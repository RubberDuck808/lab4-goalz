from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import onnxruntime as ort
from tensorflow.keras.applications.efficientnet import preprocess_input
import numpy as np
import httpx
from PIL import Image
from io import BytesIO
import os

app = FastAPI()

MODEL_PATH = os.getenv("MODEL_PATH", "model/nature_classifier.onnx")
session = None
input_name = None


@app.on_event("startup")
def load_model():
    global session, input_name
    if os.path.exists(MODEL_PATH):
        session = ort.InferenceSession(MODEL_PATH)
        input_name = session.get_inputs()[0].name  # query at runtime, never hardcode


class AnalyseRequest(BaseModel):
    imageUrl: str
    elementName: str
    elementType: str


@app.get("/health")
def health():
    return {"status": "ready" if session else "no_model"}


@app.post("/analyse")
async def analyse(req: AnalyseRequest):
    if session is None:
        raise HTTPException(503, "Model not loaded — run the training notebook first")
    try:
        async with httpx.AsyncClient(timeout=30) as client:  # async: non-blocking download
            resp = await client.get(req.imageUrl)
            resp.raise_for_status()
        img = Image.open(BytesIO(resp.content)).convert("RGB").resize((224, 224))
        arr = preprocess_input(
            np.expand_dims(np.array(img, dtype="float32"), 0)
        )
        confidence = float(session.run(None, {input_name: arr})[0][0][0])
    except Exception as e:
        raise HTTPException(422, f"Failed to process image: {e}")

    if confidence >= 0.85:
        rec = "AutoApprove"
        summary = f"Nature element detected ({round(confidence * 100)}% confidence)"
    elif confidence >= 0.45:
        rec = "NeedsReview"
        summary = f"Uncertain — {round(confidence * 100)}% confidence, manual review recommended"
    else:
        rec = "AutoReject"
        summary = f"Image does not appear to show a nature element ({round(confidence * 100)}%)"

    return {"confidence": confidence, "recommendation": rec, "summary": summary}
