"""
model.py — Custom ResNet-style multi-class classifier.

Architecture:
    Stem → Stage1 → Stage2 → Stage3 → Stage4 → GAP → Classifier

Each stage contains 2 ResidualBlocks. The first block in stages 2-4
uses stride=2 to halve the spatial size; the second block refines features
at the same spatial resolution.

Spatial flow through the network:
    Input:   (B, 3, 224, 224)
    Stem:    (B, 32, 56, 56)
    Stage 1: (B, 32, 56, 56)
    Stage 2: (B, 64, 28, 28)
    Stage 3: (B, 128, 14, 14)
    Stage 4: (B, 256, 7, 7)
    GAP:     (B, 256)
    Output:  (B, 9)  raw logits, no softmax

Total parameters: ~2.8M
"""

import torch
import torch.nn as nn


# ── Residual Block ────────────────────────────────────────────────────────────

class ResidualBlock(nn.Module):
    """
    A single residual block: output = ReLU(F(x) + shortcut(x))

    The key insight of ResNets (He et al. 2015):
        Instead of learning the full transformation H(x), the block learns
        the RESIDUAL F(x) = H(x) - x, then adds back x via the skip connection.
        This makes it easier to learn the identity (F(x) = 0) when a layer
        should not change anything — gradients flow directly through the shortcut
        path and don't vanish in deep networks.

    When shapes change (stride=2 or channel mismatch), a 1x1 projection conv
    on the shortcut path matches the dimensions so addition is possible.
    """

    def __init__(self, in_channels: int, out_channels: int, stride: int = 1):
        super().__init__()
        # super().__init__() MUST be the first line.
        # Without it: AttributeError: cannot assign module before Module.__init__()
        # nn.Module.__init__ sets up the internal parameter registry.

        # ── Main path: F(x) ──────────────────────────────────────────────
        self.conv1 = nn.Conv2d(
            in_channels, out_channels,
            kernel_size=3,
            stride=stride,  # stride=2 halves spatial size; stride=1 keeps it
            padding=1,      # padding=1 with kernel=3 preserves H,W when stride=1
            bias=False,     # BatchNorm has its own learnable bias — redundant here
        )
        self.bn1 = nn.BatchNorm2d(out_channels)
        # BatchNorm: for each channel, normalise across the batch dimension.
        # Specifically: subtract batch mean, divide by batch std, then apply
        # learnable scale (gamma) and shift (beta).
        # Why? Without it, activations in deep networks can explode or vanish,
        # making training unstable. BatchNorm keeps values in a healthy range.

        self.relu = nn.ReLU(inplace=False)
        # ReLU: max(0, x). Kills negative values, introduces non-linearity.
        # WHY inplace=False inside residual blocks:
        # The shortcut path's backward pass needs the pre-activation tensor (x)
        # to compute gradients. inplace=True would overwrite x in GPU memory
        # before the shortcut backward pass can read it — corrupting gradients.
        # inplace=True is safe ONLY in the stem and classifier where no skip
        # connection exists.

        self.conv2 = nn.Conv2d(
            out_channels, out_channels,
            kernel_size=3,
            stride=1,       # stride=1 always on the second conv
            padding=1,
            bias=False,
        )
        self.bn2 = nn.BatchNorm2d(out_channels)
        # Note: NO ReLU after bn2 — we apply it AFTER adding the shortcut.
        # This is the standard ResNet design: BN → + shortcut → ReLU.

        # ── Shortcut path ────────────────────────────────────────────────
        # Problem: if stride=2 OR in_channels != out_channels, then F(x) and x
        # have different shapes (spatial or channel) and cannot be added directly.
        # Solution: project x with a 1x1 conv to match the target shape.
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(
                    in_channels, out_channels,
                    kernel_size=1,   # 1x1 = "pointwise conv" — changes channel
                    stride=stride,   # depth only, preserves or halves spatial
                    bias=False,
                ),
                nn.BatchNorm2d(out_channels),
            )
        else:
            # Shapes already match — shortcut is the identity function.
            self.shortcut = nn.Identity()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Main path
        out = self.relu(self.bn1(self.conv1(x)))  # conv → norm → activate
        out = self.bn2(self.conv2(out))            # conv → norm (NO relu yet)

        # Skip connection: add input to transformed output
        out = out + self.shortcut(x)
        # This is the residual: out = F(x) + x
        # If F(x) = 0, out = x — the identity is easy to learn.

        # Final activation AFTER the skip connection
        return self.relu(out)


# ── Full Network ──────────────────────────────────────────────────────────────

class NatureResNet(nn.Module):
    """
    Full 9-class nature element classifier.

    Architecture overview:
        Stem:    initial feature extraction from raw pixels
        Stage 1: low-level features (edges, textures)  — same spatial size
        Stage 2: mid-level features (shapes, parts)    — spatial halved
        Stage 3: high-level features (objects)         — spatial halved
        Stage 4: semantic features (class identity)    — spatial halved
        GAP:     collapse spatial dimensions
        Head:    final classification

    Two blocks per stage gives more representational capacity than one,
    especially important for hard class pairs (ground_cover vs grass_lawn,
    garden_bed vs shrub).
    """

    def __init__(self, num_classes: int = 9):
        super().__init__()

        # ── Stem ─────────────────────────────────────────────────────────
        self.stem = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, stride=2, padding=1, bias=False),
            # (B, 3, 224, 224) → (B, 32, 112, 112)
            # stride=2 halves 224→112. 32 filters extract initial features.
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),  # inplace=True SAFE here — no skip connection
            nn.MaxPool2d(kernel_size=2, stride=2),
            # MaxPool: takes the maximum value in each 2x2 window.
            # 112 → 56. Adds slight position-invariance — a feature present
            # anywhere in a 2x2 region is retained regardless of exact position.
            # (B, 32, 56, 56)
        )

        # ── Residual Stages ───────────────────────────────────────────────
        self.stage1 = nn.Sequential(
            # stride=1: no spatial change, no channel change
            # shortcut = Identity() for both blocks
            ResidualBlock(32, 32, stride=1),
            ResidualBlock(32, 32, stride=1),
            # Output: (B, 32, 56, 56)
        )

        self.stage2 = nn.Sequential(
            # First block: stride=2 halves spatial, channels double (32→64)
            # shortcut uses projection conv
            ResidualBlock(32, 64, stride=2),
            # Second block: refines features at the new resolution
            ResidualBlock(64, 64, stride=1),
            # Output: (B, 64, 28, 28)
        )

        self.stage3 = nn.Sequential(
            ResidualBlock(64, 128, stride=2),
            ResidualBlock(128, 128, stride=1),
            # Output: (B, 128, 14, 14)
        )

        self.stage4 = nn.Sequential(
            ResidualBlock(128, 256, stride=2),
            ResidualBlock(256, 256, stride=1),
            # Output: (B, 256, 7, 7)
        )

        # ── Global Average Pooling ────────────────────────────────────────
        self.gap = nn.AdaptiveAvgPool2d(1)
        # Averages each 7x7 feature map to a single number.
        # Why "Adaptive"? The output size is specified, not the kernel/stride.
        # This works for any input spatial size — robust to minor changes.
        # (B, 256, 7, 7) → (B, 256, 1, 1)

        # ── Classifier Head ───────────────────────────────────────────────
        self.classifier = nn.Sequential(
            nn.Flatten(),
            # (B, 256, 1, 1) → (B, 256)
            # Flattening collapses all non-batch dimensions into one.

            nn.Linear(256, 128),
            # Fully connected: every one of 256 inputs connects to every one
            # of 128 outputs. Parameters: 256*128 + 128 = 32,896.
            nn.ReLU(inplace=True),
            # inplace=True safe — no skip connection in the head

            nn.Dropout(p=0.5),
            # During training: randomly zeros 50% of neurons on each forward pass.
            # Forces the model not to rely on any single neuron — reduces overfitting.
            # During eval (after model.eval()): dropout is automatically disabled.
            # If you forget model.eval() before inference, predictions will vary
            # randomly between calls — a common bug.

            nn.Linear(128, num_classes),
            # → (B, 9) raw logits, one per class
            # NO softmax here. CrossEntropyLoss applies softmax internally,
            # which is more numerically stable than computing it separately.
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.stem(x)      # (B, 3, 224, 224) → (B, 32, 56, 56)
        x = self.stage1(x)    # (B, 32, 56, 56)  → (B, 32, 56, 56)
        x = self.stage2(x)    # (B, 32, 56, 56)  → (B, 64, 28, 28)
        x = self.stage3(x)    # (B, 64, 28, 28)  → (B, 128, 14, 14)
        x = self.stage4(x)    # (B, 128, 14, 14) → (B, 256, 7, 7)
        x = self.gap(x)       # (B, 256, 7, 7)   → (B, 256, 1, 1)
        x = self.classifier(x)# (B, 256, 1, 1)   → (B, 9)
        return x              # raw logits — not probabilities


# ── Sanity check ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import torch

    model = NatureResNet(num_classes=9)

    total = sum(p.numel() for p in model.parameters())
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Total parameters:     {total:,}")      # expect ~2,800,000
    print(f"Trainable parameters: {trainable:,}")  # same — all from scratch

    # Shape check
    dummy = torch.randn(4, 3, 224, 224)  # batch of 4 images
    output = model(dummy)
    print(f"Output shape: {output.shape}")  # must be torch.Size([4, 9])
    assert output.shape == (4, 9), f"Expected (4, 9) but got {output.shape}"
    print("Shape check passed.")

    # Individual block check
    block = ResidualBlock(32, 64, stride=2)
    x = torch.randn(4, 32, 56, 56)
    out = block(x)
    assert out.shape == (4, 64, 28, 28), f"Block shape wrong: {out.shape}"
    print("Block shape check passed.")

    print("\nAll sanity checks passed.")
