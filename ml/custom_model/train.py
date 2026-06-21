"""
train.py — Training loop for the custom ResNet nature classifier.

Usage:
    python train.py --train_csv train.csv --val_csv val.csv --epochs 20

Two-phase training:
    Phase A: 20 epochs at lr=1e-3 (coarse learning)
    Phase B: 10 epochs at lr=1e-4 (fine-tuning from best Phase A checkpoint)

Key concepts demonstrated:
    - AMP (Automatic Mixed Precision) for 2-3x faster training on T4 GPU
    - AdamW optimiser (correct weight decay, unlike standard Adam)
    - ReduceLROnPlateau scheduler (adaptive learning rate)
    - Gradient clipping (prevents explosion)
    - torch.compile (free 1.2-1.5x throughput)
    - TensorBoard logging
    - Early stopping
    - Checkpointing via raw_model.state_dict()
"""

import os
import random
import argparse
import numpy as np
import torch
import torch.nn as nn
from torch.utils.tensorboard import SummaryWriter

from dataset import make_dataloaders
from model import NatureResNet

# ── Reproducibility ───────────────────────────────────────────────────────────

SEED = 42

def set_seeds(seed: int = SEED) -> None:
    """Set all random seeds for reproducibility."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    # manual_seed:      covers CPU ops
    # manual_seed_all:  covers all GPU devices (handles multi-GPU)
    # np.random.seed:   NumPy augmentation ops in DataLoader workers
    # random.seed:      Python random ops in DataLoader workers


# ── Training loop ─────────────────────────────────────────────────────────────

def train_one_epoch(
    model: nn.Module,
    loader,
    criterion: nn.Module,
    optimiser: torch.optim.Optimizer,
    scaler: torch.amp.GradScaler,
    device: torch.device,
) -> tuple:
    """
    Train for one epoch. Returns (avg_loss, accuracy).

    Steps per batch:
        1. zero_grad   — clear accumulated gradients from the previous batch
        2. autocast    — run forward pass in mixed precision (FP16 where safe)
        3. forward     — model(images) → logits
        4. loss        — CrossEntropyLoss(logits, labels)
        5. backward    — compute gradients via backpropagation (chain rule)
        6. unscale     — restore true gradient magnitudes before clipping
        7. clip_grad   — cap gradient norm to prevent explosion
        8. step        — update weights: w = w - lr * grad (AdamW version)
        9. scaler.update — adjust AMP scale factor for the next iteration
    """
    model.train()
    # model.train() CRITICAL: enables Dropout and batch statistics for BatchNorm.
    # Forgetting this means Dropout stays disabled — common silent bug.
    # The model will appear to train normally but won't generalise as well.

    total_loss = 0.0
    correct = 0
    total = 0

    for images, labels in loader:
        images = images.to(device, non_blocking=True)
        labels = labels.to(device, non_blocking=True)
        # non_blocking=True: CPU→GPU transfers happen asynchronously
        # when pin_memory=True in the DataLoader. Small but free speedup.

        # Step 1: Clear gradients from the previous batch.
        # PyTorch ACCUMULATES gradients by default.
        # If you skip this, gradients from batch N add to batch N+1 — corrupts training.
        optimiser.zero_grad()

        # Steps 2-4: Forward pass inside autocast for AMP.
        with torch.amp.autocast("cuda"):
            # autocast: runs matrix multiplications in FP16 (2-3x faster on T4 Tensor Cores)
            # while keeping loss computation in FP32 (more numerically stable).
            outputs = model(images)              # (B, 9) raw logits
            loss = criterion(outputs, labels)    # scalar loss value

        # Step 5: Backward pass — compute gradients via backpropagation.
        # PyTorch traces the computation graph built during forward and applies
        # the chain rule of calculus. Each param.grad is filled.
        # scaler.scale(loss) multiplies loss by the AMP scale factor to prevent
        # FP16 underflow during backward.
        scaler.scale(loss).backward()

        # Step 6: Restore true gradient magnitudes before clipping.
        # scaler.unscale_ divides all gradients by the AMP scale factor.
        # Must be done before clip_grad_norm_ so it clips actual gradients.
        scaler.unscale_(optimiser)

        # Step 7: Gradient clipping.
        # If any gradient is too large (explosion), this caps the global norm at 1.0.
        # Prevents training instability, especially in early epochs.
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

        # Step 8: Update weights.
        # For each parameter: weight = weight - lr * weight.grad
        # (AdamW's actual update is more complex but conceptually the same)
        # scaler.step() skips the step if any gradient is NaN/Inf (AMP safety net).
        scaler.step(optimiser)

        # Step 9: Update AMP scale factor for next iteration.
        # If the step was skipped (NaN grad), scale is reduced.
        # If steps succeed consecutively, scale is gradually increased.
        scaler.update()

        # Track metrics
        total_loss += loss.item() * images.size(0)
        # loss.item() = loss as Python float
        # * images.size(0) converts mean loss back to sum (for correct averaging later)

        preds = outputs.argmax(dim=1)
        # argmax: index of the highest logit = predicted class (0-8)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

    return total_loss / total, correct / total


def evaluate(
    model: nn.Module,
    loader,
    criterion: nn.Module,
    device: torch.device,
) -> tuple:
    """
    Evaluate model on a DataLoader. Returns (avg_loss, accuracy, preds, labels).

    Important differences from training:
        - model.eval(): disables Dropout, uses running statistics in BatchNorm
        - torch.no_grad(): no computation graph — we never call .backward() in eval
    """
    model.eval()
    # model.eval() CRITICAL: disables Dropout.
    # BatchNorm uses its RUNNING statistics (accumulated during training)
    # rather than batch statistics. Without this, results vary between runs.

    total_loss = 0.0
    correct = 0
    total = 0
    all_preds = []
    all_labels = []

    with torch.no_grad():
        # torch.no_grad(): tells PyTorch not to build the computation graph.
        # We don't call .backward() in evaluation so we don't need it.
        # Saves ~50% GPU memory and speeds up inference.
        for images, labels in loader:
            images = images.to(device)
            labels = labels.to(device)
            outputs = model(images)
            loss = criterion(outputs, labels)
            preds = outputs.argmax(dim=1)

            total_loss += loss.item() * images.size(0)
            correct += (preds == labels).sum().item()
            total += labels.size(0)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    return total_loss / total, correct / total, all_preds, all_labels


# ── Main training script ──────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Train custom ResNet nature classifier")
    parser.add_argument("--train_csv", default="train.csv")
    parser.add_argument("--val_csv",   default="val.csv")
    parser.add_argument("--test_csv",  default="test.csv")
    parser.add_argument("--epochs_a",  type=int, default=20, help="Phase A epochs")
    parser.add_argument("--epochs_b",  type=int, default=10, help="Phase B epochs")
    parser.add_argument("--batch_size",type=int, default=32)
    parser.add_argument("--checkpoint_dir", default="checkpoints")
    args = parser.parse_args()

    # ── Setup ─────────────────────────────────────────────────────────────
    set_seeds()
    os.makedirs(args.checkpoint_dir, exist_ok=True)
    CHECKPOINT_PATH = os.path.join(args.checkpoint_dir, "best_model.pth")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")
    if device.type == "cuda":
        print(f"GPU: {torch.cuda.get_device_name(0)}")

    torch.backends.cudnn.benchmark = True
    # cuDNN benchmarks its convolution algorithms on the first batch and picks
    # the fastest one for this specific input size (224x224).
    # Free 10-20% throughput improvement. Only helps with fixed input sizes.

    # ── Cache dir for torch.compile on Kaggle ─────────────────────────────
    if os.path.exists("/kaggle/working"):
        os.environ["TORCHINDUCTOR_CACHE_DIR"] = "/kaggle/working/torch_cache"

    # ── Data ──────────────────────────────────────────────────────────────
    print("Loading data...")
    train_loader, val_loader, _ = make_dataloaders(
        args.train_csv, args.val_csv, args.test_csv, args.batch_size
    )
    print(f"Train batches: {len(train_loader)}, Val batches: {len(val_loader)}")

    # ── Model ─────────────────────────────────────────────────────────────
    raw_model = NatureResNet(num_classes=9).to(device)
    # Keep a reference to raw_model for checkpointing and ONNX export.
    # torch.compile wraps the module — raw_model.state_dict() loads cleanly.

    model = torch.compile(raw_model)
    # Compiles PyTorch operations into optimised CUDA kernels.
    # ~30-60s overhead on first batch, then 1.2-1.5x faster throughput.

    total_params = sum(p.numel() for p in raw_model.parameters())
    print(f"Parameters: {total_params:,}")

    # ── Loss, optimiser, scaler ────────────────────────────────────────────
    criterion = nn.CrossEntropyLoss()
    # Equal class sizes — no class weights needed.
    # CrossEntropyLoss: applies softmax → log → negate → mean over batch.

    optimiser = torch.optim.AdamW(
        model.parameters(),
        lr=1e-3,
        weight_decay=1e-4,
    )
    # AdamW vs Adam: standard Adam with weight_decay incorrectly scales
    # regularisation per-parameter via adaptive learning rates.
    # AdamW decouples weight decay from gradient updates — the correct approach.

    scaler = torch.amp.GradScaler("cuda")
    # AMP GradScaler: multiplies loss by a large factor to prevent FP16 underflow
    # during backward. Adjusts the scale automatically each iteration.

    writer = SummaryWriter("runs/nature_resnet_v1")

    # ── Phase A ───────────────────────────────────────────────────────────
    print("\n=== Phase A: coarse training ===")
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimiser, mode="min", patience=3, factor=0.5, min_lr=1e-6
    )
    # ReduceLROnPlateau: if val_loss hasn't improved for `patience` epochs,
    # multiply the LR by `factor`. Use val_loss (not val_acc) —
    # it's a smoother signal and sensitive to model calibration.

    best_val_loss = float("inf")
    no_improve = 0

    for epoch in range(1, args.epochs_a + 1):
        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimiser, scaler, device
        )
        val_loss, val_acc, _, _ = evaluate(model, val_loader, criterion, device)

        scheduler.step(val_loss)
        current_lr = optimiser.param_groups[0]["lr"]

        # TensorBoard logging
        writer.add_scalar("Loss/train", train_loss, epoch)
        writer.add_scalar("Loss/val",   val_loss,   epoch)
        writer.add_scalar("Acc/train",  train_acc,  epoch)
        writer.add_scalar("Acc/val",    val_acc,    epoch)
        writer.add_scalar("LR",         current_lr, epoch)

        print(
            f"[A] Epoch {epoch:3d} | "
            f"train_loss={train_loss:.4f} val_loss={val_loss:.4f} | "
            f"train_acc={train_acc:.3f} val_acc={val_acc:.3f} | "
            f"lr={current_lr:.2e}"
        )

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            no_improve = 0
            torch.save(
                {
                    "epoch": epoch,
                    "phase": "A",
                    "model_state_dict": raw_model.state_dict(),
                    # raw_model shares weights with model (compile doesn't copy them)
                    # but state_dict() loads cleanly without compile artifacts.
                    "optimiser_state_dict": optimiser.state_dict(),
                    "val_loss": val_loss,
                    "val_acc": val_acc,
                },
                CHECKPOINT_PATH,
            )
            print(f"    ✓ Checkpoint saved (val_loss={val_loss:.4f})")
        else:
            no_improve += 1
            if no_improve >= 5:
                print(f"    Early stopping after {epoch} epochs (patience=5)")
                break

    print(f"\nPhase A complete. Best val_loss: {best_val_loss:.4f}")

    # ── Phase B ───────────────────────────────────────────────────────────
    print("\n=== Phase B: fine-tuning at lr=1e-4 ===")

    # Load best Phase A checkpoint
    checkpoint = torch.load(CHECKPOINT_PATH, map_location=device)
    raw_model.load_state_dict(checkpoint["model_state_dict"])
    optimiser.load_state_dict(checkpoint["optimiser_state_dict"])

    # IMPORTANT: override the learning rate AFTER loading.
    # load_state_dict() restores Phase A's lr, momentum buffers, and
    # squared-gradient estimates. We want the Phase A adaptive estimates
    # (they encode useful history) but with a smaller learning rate.
    for g in optimiser.param_groups:
        g["lr"] = 1e-4

    # Reinitialise scheduler to clear Phase A's internal state.
    # The old scheduler holds Phase A's best_loss — using it for Phase B
    # would fire the LR reduction at the wrong threshold.
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimiser, mode="min", patience=3, factor=0.5, min_lr=1e-6
    )

    no_improve = 0  # Reset early stopping counter for Phase B

    for epoch in range(1, args.epochs_b + 1):
        global_epoch = checkpoint["epoch"] + epoch  # for TensorBoard continuity

        train_loss, train_acc = train_one_epoch(
            model, train_loader, criterion, optimiser, scaler, device
        )
        val_loss, val_acc, _, _ = evaluate(model, val_loader, criterion, device)

        scheduler.step(val_loss)
        current_lr = optimiser.param_groups[0]["lr"]

        writer.add_scalar("Loss/train", train_loss, global_epoch)
        writer.add_scalar("Loss/val",   val_loss,   global_epoch)
        writer.add_scalar("Acc/train",  train_acc,  global_epoch)
        writer.add_scalar("Acc/val",    val_acc,    global_epoch)
        writer.add_scalar("LR",         current_lr, global_epoch)

        print(
            f"[B] Epoch {epoch:3d} | "
            f"train_loss={train_loss:.4f} val_loss={val_loss:.4f} | "
            f"train_acc={train_acc:.3f} val_acc={val_acc:.3f} | "
            f"lr={current_lr:.2e}"
        )

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            no_improve = 0
            torch.save(
                {
                    "epoch": global_epoch,
                    "phase": "B",
                    "model_state_dict": raw_model.state_dict(),
                    "optimiser_state_dict": optimiser.state_dict(),
                    "val_loss": val_loss,
                    "val_acc": val_acc,
                },
                CHECKPOINT_PATH,
            )
            print(f"    ✓ Checkpoint saved (val_loss={val_loss:.4f})")
        else:
            no_improve += 1
            if no_improve >= 5:
                print(f"    Early stopping after {epoch} Phase B epochs")
                break

    writer.close()
    print(f"\nTraining complete. Best val_loss: {best_val_loss:.4f}")
    print(f"Checkpoint saved to: {CHECKPOINT_PATH}")


if __name__ == "__main__":
    main()
