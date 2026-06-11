from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import onnxruntime as ort
import numpy as np
import httpx
from PIL import Image
from io import BytesIO
import os

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

MODEL_PATH = os.getenv("MODEL_PATH", "model/nature_classifier.onnx")
session    = None
input_name = None


# ── App lifecycle ─────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load the ONNX model on startup using the lifespan pattern.

    This replaces the deprecated @app.on_event("startup") decorator.
    Code before `yield` runs on startup; code after runs on shutdown.
    """
    global session, input_name
    if os.path.exists(MODEL_PATH):
        session = ort.InferenceSession(MODEL_PATH)
        input_name = session.get_inputs()[0].name
        # Query the input tensor name at runtime — never hardcode it.
        # The name comes from torch.onnx.export(input_names=["input"]) in export.py.
    yield
    # Cleanup (if needed) goes here


app = FastAPI(lifespan=lifespan)


# ── Preprocessing ─────────────────────────────────────────────────────────────

def preprocess_image(img: Image.Image) -> np.ndarray:
    """
    Preprocess a PIL image for inference.

    Must match val_transform in dataset.py EXACTLY:
        Resize(256) → CenterCrop(224) → scale to [-1,1] → channels-first

    Any mismatch means the model receives different input at inference
    than it was trained on — predictions will be wrong or random.

    Channel order note:
        PIL images are (H, W, C) — height, width, channels.
        PyTorch and the ONNX model expect (C, H, W) — channels first.
        np.transpose performs this reordering.
        Forgetting the transpose passes the wrong shape to ONNX Runtime
        and causes a shape mismatch error.
    """
    img = img.convert("RGB")

    # Step 1: Resize to 256 (matches Resize(256) in val_transform)
    img = img.resize((256, 256), Image.Resampling.BILINEAR)
    # Image.Resampling.BILINEAR: Pillow 10.0+ renamed Image.BILINEAR to this.

    # Step 2: CenterCrop to 224 (matches CenterCrop(224) in val_transform)
    left = top = (256 - 224) // 2  # = 16 pixels from each edge
    img = img.crop((left, top, left + 224, top + 224))

    # Step 3: Scale to [-1, 1] (matches Normalize(mean=0.5, std=0.5))
    # Normalize: (x - mean) / std = (x - 0.5) / 0.5 = 2x - 1
    # Equivalent to: x / 127.5 - 1.0 when x is in [0, 255]
    arr = np.array(img, dtype="float32")  # (224, 224, 3), values 0-255
    arr = (arr / 127.5) - 1.0             # (224, 224, 3), values -1 to 1

    # Step 4: Channels-first (matches ToTensor() which reorders H,W,C → C,H,W)
    arr = np.transpose(arr, (2, 0, 1))    # (3, 224, 224)

    return np.expand_dims(arr, 0)         # (1, 3, 224, 224) — add batch dim


# ── Recommendation logic ──────────────────────────────────────────────────────

def get_recommendation(pred_class: str, confidence: float) -> tuple:
    """
    Maps predicted class and confidence to a recommendation and summary.

    Asymmetric thresholds:
        not_nature gate uses 0.55 (lower than AutoApprove bar of 0.85)
        Reason: a wrongly AutoApproved non-nature image bypasses review entirely.
        Better to send uncertain not_nature predictions to review than to auto-reject
        valid nature elements that happen to look urban.
    """
    if pred_class == "not_nature" and confidence >= 0.55:
        rec = "AutoReject"
        summary = f"Image does not appear to show a nature element ({round(confidence * 100)}%)"
    elif pred_class == "not_nature" and confidence < 0.55:
        rec = "NeedsReview"
        summary = f"Unclear whether this is a nature element — {round(confidence * 100)}% confidence, manual review recommended"
    elif confidence >= 0.85:
        rec = "AutoApprove"
        summary = f"{pred_class.replace('_', ' ').title()} detected ({round(confidence * 100)}% confidence)"
    elif confidence >= 0.45:
        rec = "NeedsReview"
        summary = f"Possible {pred_class.replace('_', ' ')} — {round(confidence * 100)}% confidence, manual review recommended"
    else:
        rec = "AutoReject"
        summary = f"Image unclear ({round(confidence * 100)}%)"

    return rec, summary


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ready" if session else "no_model"}


class AnalyseRequest(BaseModel):
    imageUrl: str
    elementName: str
    elementType: str


@app.post("/analyse")
async def analyse(req: AnalyseRequest):
    if session is None:
        raise HTTPException(503, "Model not loaded — check MODEL_PATH and restart")

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(req.imageUrl)
            resp.raise_for_status()
        img = Image.open(BytesIO(resp.content))
        arr = preprocess_image(img)
    except httpx.HTTPStatusError as e:
        raise HTTPException(422, f"Failed to fetch image: {e}")
    except Exception as e:
        raise HTTPException(422, f"Failed to process image: {e}")

    try:
        logits = session.run(None, {input_name: arr})[0][0]  # (9,)
    except Exception as e:
        raise HTTPException(500, f"Model inference failed: {e}")

    # Stable softmax: subtract max before exp to prevent float32 overflow
    exp_l  = np.exp(logits - logits.max())
    probs  = exp_l / exp_l.sum()

    pred_idx   = int(np.argmax(probs))
    pred_class = CLASSES[pred_idx]
    confidence = float(probs[pred_idx])

    rec, summary = get_recommendation(pred_class, confidence)

    return {
        "confidence":     confidence,
        "recommendation": rec,
        "summary":        summary,
        "classification": pred_class,  # populates AiClassification in DB
    }
