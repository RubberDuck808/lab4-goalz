"""
evaluate.py — Evaluation metrics, confusion matrix, calibration, and error analysis.

Usage:
    python evaluate.py --test_csv test.csv --checkpoint checkpoints/best_model.pth

Outputs:
    - Overall accuracy
    - Per-class classification report (precision, recall, F1)
    - Normalised confusion matrix heatmap
    - AutoApprove precision (most important business metric)
    - Calibration plot (overconfidence check)
    - Error analysis grids per class
"""

import os
import argparse
import numpy as np
import torch
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.calibration import calibration_curve

from dataset import NatureDataset, val_transform, CLASSES
from model import NatureResNet


# ── Recommendation logic ──────────────────────────────────────────────────────

def recommend(pred_class: str, confidence: float) -> str:
    """
    Maps predicted class + confidence to a recommendation.

    Asymmetric thresholds: the not_nature gate uses a lower bar (0.55)
    than AutoApprove (0.85). This reflects the asymmetry of consequences:
    a wrongly AutoApproved non-nature image bypasses review entirely.

    Threshold decision process:
        1. If model is moderately confident it's not_nature → reject
        2. If model is VERY confident it's nature AND specific class → approve
        3. Anything in between → flag for human review
    """
    if pred_class == "not_nature" and confidence >= 0.55:
        # Moderately sure it's not a qualifying element — reject.
        return "AutoReject"
    elif pred_class == "not_nature" and confidence < 0.55:
        # Model is confused — unsure if it's nature. Human decides.
        return "NeedsReview"
    elif confidence >= 0.85:
        # High confidence valid nature element — auto-approve.
        return "AutoApprove"
    elif confidence >= 0.45:
        # Likely nature but unsure of category — flag for review.
        return "NeedsReview"
    else:
        # Too uncertain even for review — likely edge case or hard negative.
        return "AutoReject"


# ── Prediction ────────────────────────────────────────────────────────────────

def predict_batch(model, loader, device):
    """
    Run inference on an entire DataLoader.

    Returns:
        all_preds:       list of predicted class indices
        all_labels:      list of true class indices
        all_confidences: list of max softmax probabilities
        all_probs:       list of full 9-class probability arrays
    """
    model.eval()
    all_preds, all_labels, all_confidences, all_probs = [], [], [], []

    with torch.no_grad():
        for images, labels in loader:
            images = images.to(device)
            logits = model(images)            # (B, 9)
            probs  = torch.softmax(logits, dim=1)  # (B, 9) — now sums to 1
            preds  = probs.argmax(dim=1)           # predicted class index
            confs  = probs.max(dim=1).values       # confidence in that prediction

            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.numpy())
            all_confidences.extend(confs.cpu().numpy())
            all_probs.extend(probs.cpu().numpy())

    return all_preds, all_labels, all_confidences, all_probs


# ── Metrics ───────────────────────────────────────────────────────────────────

def print_classification_report(all_labels, all_preds):
    """
    Per-class precision, recall, F1.

    Precision: of all images predicted as "tree", what % was actually tree?
               (false positives hurt precision)
    Recall:    of all actual trees, what % did the model correctly identify?
               (false negatives hurt recall)
    F1:        harmonic mean of precision and recall
               (useful when both matter equally)

    zero_division=0: suppresses warnings when a class has zero predictions
    (expected for mulch/green_roof if they underperformed significantly).
    """
    print("\n=== Classification Report ===")
    print(classification_report(
        all_labels, all_preds,
        target_names=CLASSES,
        zero_division=0,
    ))


def plot_confusion_matrix(all_labels, all_preds, save_path="confusion_matrix.png"):
    """
    9x9 normalised confusion matrix.

    normalize='true': each row sums to 1.0 — shows per-class accuracy at a glance.
    Diagonal = correctly classified. Off-diagonal = where the model confuses classes.

    Expected confusion pairs:
        ground_cover ↔ grass_lawn  (both low-growing green plants)
        garden_bed   ↔ shrub       (both contain green bushy plants)
    """
    cm = confusion_matrix(all_labels, all_preds, normalize="true")
    fig, ax = plt.subplots(figsize=(11, 9))
    sns.heatmap(
        cm, annot=True, fmt=".2f",
        xticklabels=CLASSES, yticklabels=CLASSES,
        cmap="Blues", ax=ax,
    )
    ax.set_xlabel("Predicted", fontsize=12)
    ax.set_ylabel("True", fontsize=12)
    ax.set_title("Normalised Confusion Matrix", fontsize=14)
    plt.tight_layout()
    plt.savefig(save_path, dpi=150)
    plt.show()
    print(f"Confusion matrix saved to {save_path}")


def print_autoapprove_precision(all_preds, all_labels, all_confidences):
    """
    AutoApprove precision — the most critical business metric.

    Definition: of all elements that were AutoApproved, what % were the
    correct class?

    Why this matters: AutoApproved elements bypass staff review entirely.
    If the model AutoApproves a car photo as "tree", that garbage goes
    directly into the game map with no human check.

    Target: >= 0.90 (at most 1 in 10 AutoApproved elements is wrong class)
    """
    recommendations = [
        recommend(CLASSES[p], c)
        for p, c in zip(all_preds, all_confidences)
    ]
    auto_approved = [
        (p == l, p, l)
        for p, l, r in zip(all_preds, all_labels, recommendations)
        if r == "AutoApprove"
    ]
    if not auto_approved:
        print("\nAutoApprove precision: no AutoApproved predictions (thresholds may be too high)")
        return

    total_aa = len(auto_approved)
    correct_aa = sum(1 for correct, _, _ in auto_approved if correct)
    precision = correct_aa / total_aa

    print(f"\n=== AutoApprove Metrics ===")
    print(f"Total AutoApproved:    {total_aa}")
    print(f"Correctly classified:  {correct_aa}")
    print(f"AutoApprove precision: {precision:.3f}")

    if precision < 0.90:
        print("  WARNING: precision below 0.90 — consider raising AutoApprove threshold")


def plot_calibration(all_labels, all_preds, all_confidences, save_path="calibration.png"):
    """
    Calibration plot: does the model's confidence match actual accuracy?

    A well-calibrated model predicts 90% confidence exactly when it's correct
    90% of the time. Neural networks trained with CrossEntropyLoss are
    systematically OVERCONFIDENT — they output 95% confidence on predictions
    that are only 75% accurate.

    Interpretation:
        - Model line below diagonal: overconfident (common for neural nets)
        - Model line above diagonal: underconfident (rare)
        - Close to diagonal: well-calibrated

    Fix (if needed): Temperature scaling — divide logits by T before softmax.
        T > 1 spreads the distribution (reduces confidence).
        T is found by minimising NLL on the val set. Typical range: 1.2–2.0.
    """
    is_correct = [1 if p == l else 0 for p, l in zip(all_preds, all_labels)]
    prob_true, prob_pred = calibration_curve(is_correct, all_confidences, n_bins=10)

    fig, ax = plt.subplots(figsize=(7, 6))
    ax.plot(prob_pred, prob_true, marker="o", label="Model", linewidth=2)
    ax.plot([0, 1], [0, 1], "--", color="gray", label="Perfect calibration")
    ax.set_xlabel("Mean predicted confidence", fontsize=12)
    ax.set_ylabel("Actual accuracy", fontsize=12)
    ax.set_title("Calibration Plot", fontsize=14)
    ax.legend()
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(save_path, dpi=150)
    plt.show()
    print(f"Calibration plot saved to {save_path}")


def plot_error_grids(test_csv, all_preds, all_labels, all_confidences, n_errors=9):
    """
    Show the worst errors for each class.

    For each class C: find images where true_class == C but the model was
    most confident about the wrong class. Display them in a 3x3 grid.

    This tells you WHAT the model is confusing and WHY — useful for deciding
    whether to adjust the dataset, add augmentation, or accept the limitation.

    Pay extra attention to not_nature misclassifications — a confidently
    wrong AutoApprove is the highest-severity failure mode.
    """
    import pandas as pd
    df = pd.read_csv(test_csv)

    for class_idx, class_name in enumerate(CLASSES):
        # Find indices where true_class == class_idx but prediction is wrong
        errors = [
            (i, all_preds[i], all_confidences[i])
            for i in range(len(all_labels))
            if all_labels[i] == class_idx and all_preds[i] != class_idx
        ]
        if not errors:
            continue
        # Sort by confidence in wrong prediction (worst errors first)
        errors.sort(key=lambda x: x[2], reverse=True)
        errors = errors[:n_errors]

        n_cols = 3
        n_rows = (len(errors) + n_cols - 1) // n_cols
        fig, axes = plt.subplots(n_rows, n_cols, figsize=(n_cols * 3, n_rows * 3))
        axes = np.array(axes).flatten()

        fig.suptitle(
            f"Worst errors: true={class_name}",
            fontsize=13, y=1.01
        )
        for ax in axes:
            ax.axis("off")

        for j, (img_idx, pred_idx, conf) in enumerate(errors):
            try:
                img = Image.open(df.iloc[img_idx]["path"]).convert("RGB").resize((112, 112))
                axes[j].imshow(img)
            except Exception:
                axes[j].set_facecolor("gray")
            axes[j].set_title(
                f"pred: {CLASSES[pred_idx]}\nconf: {conf:.2f}",
                fontsize=8
            )
            axes[j].axis("off")

        plt.tight_layout()
        plt.savefig(f"errors_{class_name}.png", dpi=120, bbox_inches="tight")
        plt.show()


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--test_csv",   default="test.csv")
    parser.add_argument("--checkpoint", default="checkpoints/best_model.pth")
    parser.add_argument("--batch_size", type=int, default=64)
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Load model
    raw_model = NatureResNet(num_classes=9).to(device)
    checkpoint = torch.load(args.checkpoint, map_location=device)
    raw_model.load_state_dict(checkpoint["model_state_dict"])
    print(f"Loaded checkpoint from {args.checkpoint}")
    print(f"  Phase: {checkpoint.get('phase', '?')}, "
          f"Epoch: {checkpoint.get('epoch', '?')}, "
          f"Val loss: {checkpoint.get('val_loss', '?'):.4f}")

    # Load test data
    from torch.utils.data import DataLoader
    test_ds = NatureDataset(args.test_csv, transform=val_transform)
    test_loader = DataLoader(test_ds, batch_size=args.batch_size, shuffle=False, num_workers=2)

    # Run predictions
    print("\nRunning inference on test set...")
    all_preds, all_labels, all_confidences, all_probs = predict_batch(
        raw_model, test_loader, device
    )

    overall_acc = sum(p == l for p, l in zip(all_preds, all_labels)) / len(all_labels)
    print(f"\nOverall accuracy: {overall_acc:.4f} ({overall_acc*100:.1f}%)")

    # Metrics
    print_classification_report(all_labels, all_preds)
    print_autoapprove_precision(all_preds, all_labels, all_confidences)
    plot_confusion_matrix(all_labels, all_preds)
    plot_calibration(all_labels, all_preds, all_confidences)
    plot_error_grids(args.test_csv, all_preds, all_labels, all_confidences)


if __name__ == "__main__":
    main()
