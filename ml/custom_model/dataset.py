"""
dataset.py — NatureDataset and DataLoader factory for the custom ResNet pipeline.

CSV format expected:
    path,class_name,label
    /path/to/image.jpg,tree,1
    /path/to/image.jpg,not_nature,0

Labels must match the CLASSES index order defined in model.py.
"""

import random
import numpy as np
import pandas as pd
import torch
from PIL import Image
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms


# ── Class definitions ─────────────────────────────────────────────────────────

CLASSES = [
    "not_nature",   # 0 — the reject gate (safety-critical)
    "tree",         # 1
    "shrub",        # 2
    "grass_lawn",   # 3
    "mulch",        # 4
    "garden_bed",   # 5
    "ground_cover", # 6
    "green_roof",   # 7
    "water_body",   # 8
]
CLASS_TO_IDX = {c: i for i, c in enumerate(CLASSES)}
NUM_CLASSES = len(CLASSES)


# ── Transforms ────────────────────────────────────────────────────────────────

# Training transforms: augmentation creates variety so the model generalises.
# All augmentations simulate real-world variation in user-submitted photos.
train_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.RandomCrop(224),
    # Why 256 then crop to 224?
    # RandomCrop picks a random 224x224 window from the 256x256 image.
    # The model sees the subject at different positions — positional variety.
    # Direct resize to 224 would always show the same framing.

    transforms.RandomHorizontalFlip(p=0.5),
    # Nature elements look the same mirrored. Doubles effective dataset size.

    transforms.RandomRotation(degrees=15),
    # Photos are taken at different angles. 15 degrees = meaningful variety
    # without warping the image so much it's unrecognisable.

    transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.05),
    # Outdoor lighting varies enormously across seasons, times of day,
    # and weather. The model should not rely on colour tone alone.

    transforms.RandomPerspective(distortion_scale=0.3, p=0.4),
    # Simulates off-angle phone shots. Users don't take perfectly level photos.

    transforms.RandomGrayscale(p=0.05),
    # Some phone cameras desaturate in low light or apply filters.

    transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 1.5)),
    # Motion blur and out-of-focus shots are common in phone photography.

    transforms.ToTensor(),
    # Converts PIL Image (H x W x C, values 0-255) to tensor (C x H x W, values 0.0-1.0).
    # IMPORTANT: channel order changes — PIL is H,W,C but PyTorch expects C,H,W.
    # This reordering must be mirrored in the serving preprocessing (np.transpose).

    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
    # (x - 0.5) / 0.5 = 2x - 1  →  scales [0,1] to [-1,1].
    # Networks train more stably when inputs are centred around zero.
    # This matches the serving preprocessing: (arr / 127.5) - 1.0.

    transforms.RandomErasing(p=0.1, scale=(0.02, 0.1)),
    # Partial occlusion — fence posts, fingers, signs partially in frame.
    # MUST come after ToTensor: RandomErasing calls img.shape[-3] which only
    # exists on tensors, not PIL Images.
])

# Validation/test transforms: deterministic — no augmentation.
# CRITICAL: augmentation on training only. If you augment val/test,
# metrics will vary between runs and you cannot trust them.
val_transform = transforms.Compose([
    transforms.Resize(256),
    # Resize to 256 FIRST. This gives CenterCrop room to work.
    # If you Resize directly to 224 and CenterCrop 224, the crop is a no-op —
    # small images get stretched to exactly 224 with content clipped at edges.
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
])


# ── Dataset ───────────────────────────────────────────────────────────────────

class NatureDataset(Dataset):
    """
    Loads images from a CSV file with columns: path, class_name, label.

    Inherits from torch.utils.data.Dataset.
    PyTorch requires two methods:
      __len__:         how many samples exist (DataLoader uses this to know
                       when an epoch ends)
      __getitem__(idx): returns one sample — (image_tensor, label_int)
    """

    def __init__(self, csv_path: str, transform=None):
        self.df = pd.read_csv(csv_path)  # columns: path, class_name, label
        self.transform = transform

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, idx: int):
        row = self.df.iloc[idx]

        MAX_RETRIES = 5
        for attempt in range(MAX_RETRIES):
            try:
                img = Image.open(row["path"]).convert("RGB")
                # .convert("RGB"): normalises image format.
                # Some images are grayscale (1 channel) or RGBA (4 channels).
                # Converting ensures exactly 3 channels every time.
                break
            except Exception:
                if attempt == MAX_RETRIES - 1:
                    # All retries exhausted. Fall back to a black image.
                    # Why not always return a random sample?
                    # We've already retried 4 random samples and all failed —
                    # the dataset has a cluster of corrupt files. Log it.
                    print(f"[WARN] Could not load after {MAX_RETRIES} attempts: {row['path']}")
                    img = Image.fromarray(np.zeros((224, 224, 3), dtype=np.uint8))
                else:
                    # Pick a random different index and retry.
                    # Bounded retries prevent stack overflow on corrupt datasets.
                    idx = random.randint(0, len(self) - 1)
                    row = self.df.iloc[idx]

        if self.transform:
            img = self.transform(img)

        label = int(row["label"])  # 0–8, must match CLASSES index
        return img, label


# ── DataLoader factory ────────────────────────────────────────────────────────

def _worker_init(worker_id: int) -> None:
    """
    Per-worker random seed initialisation.

    Each DataLoader spawns multiple worker processes. Without this function,
    all workers share the same seed → correlated augmentations within each
    batch (e.g. all images flip left in the same batch). This breaks the
    assumption that each sample is independently augmented.

    We derive a unique seed from the base seed + worker_id.
    """
    seed = (torch.initial_seed() % (2 ** 32)) + worker_id
    np.random.seed(seed)
    random.seed(seed)


def make_dataloaders(
    train_csv: str,
    val_csv: str,
    test_csv: str,
    batch_size: int = 32,
) -> tuple:
    """
    Creates train, val, and test DataLoaders.

    Returns:
        (train_loader, val_loader, test_loader)

    Because classes are equal in size (5,000 each), shuffle=True on the
    training loader is sufficient to see a balanced class mix per epoch.
    No WeightedRandomSampler is needed.

    If mulch/green_roof fall significantly below 5,000 images:
        from torch.utils.data import WeightedRandomSampler
        and reintroduce class weights in the loss function.
    """
    train_ds = NatureDataset(train_csv, transform=train_transform)
    val_ds   = NatureDataset(val_csv,   transform=val_transform)
    test_ds  = NatureDataset(test_csv,  transform=val_transform)

    # pin_memory=True pre-pins CPU memory for faster GPU transfer.
    # On CPU-only machines (local dev) it prints warnings and is silently ignored.
    # Using is_available() as a guard suppresses those warnings.
    _pin = torch.cuda.is_available()

    train_loader = DataLoader(
        train_ds,
        batch_size=batch_size,
        shuffle=True,           # varied class mix per epoch
        num_workers=2,          # Kaggle T4 performs better with 2, not 4
        pin_memory=_pin,
        worker_init_fn=_worker_init,
    )
    val_loader = DataLoader(
        val_ds,
        batch_size=64,          # larger batch for val/test — no gradient needed
        shuffle=False,          # no shuffle — reproducible evaluation
        num_workers=2,
        pin_memory=_pin,
    )
    test_loader = DataLoader(
        test_ds,
        batch_size=64,
        shuffle=False,
        num_workers=2,
        pin_memory=_pin,
    )

    return train_loader, val_loader, test_loader
