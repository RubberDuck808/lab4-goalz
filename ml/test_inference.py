"""Quick inference test — pass one or more image paths as arguments."""
import sys
import numpy as np
from PIL import Image
import onnxruntime as ort

MODEL_PATH = "serve/model/nature_classifier.onnx"

CLASSES = [
    "not_nature", "tree", "shrub", "grass_lawn", "mulch",
    "garden_bed", "ground_cover", "green_roof", "water_body",
]

def preprocess(path: str) -> np.ndarray:
    # Must match val_transform in custom_model/dataset.py and app.py's
    # preprocess_image: Resize(256) -> CenterCrop(224) -> scale to [-1,1] -> channels-first
    img = Image.open(path).convert("RGB")
    img = img.resize((256, 256), Image.Resampling.BILINEAR)
    left = top = (256 - 224) // 2
    img = img.crop((left, top, left + 224, top + 224))
    arr = np.array(img, dtype="float32")
    arr = (arr / 127.5) - 1.0
    arr = np.transpose(arr, (2, 0, 1))
    return np.expand_dims(arr, 0)

def classify(session, input_name: str, path: str) -> None:
    arr = preprocess(path)
    logits = session.run(None, {input_name: arr})[0][0]  # (9,)

    exp_l = np.exp(logits - logits.max())
    probs = exp_l / exp_l.sum()
    pred_idx = int(np.argmax(probs))
    pred_class = CLASSES[pred_idx]
    confidence = float(probs[pred_idx])

    if pred_class == "not_nature" and confidence >= 0.55:
        rec = "AutoReject   [FAIL]"
    elif pred_class == "not_nature":
        rec = "NeedsReview  [?]"
    elif confidence >= 0.85:
        rec = "AutoApprove  [PASS]"
    elif confidence >= 0.45:
        rec = "NeedsReview  [?]"
    else:
        rec = "AutoReject   [FAIL]"

    print(f"{path}")
    print(f"  class      : {pred_class}")
    print(f"  confidence : {confidence:.4f}  ({round(confidence * 100)}%)")
    print(f"  result     : {rec}")
    print()

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_inference.py <image1> [image2 ...]")
        sys.exit(1)

    session = ort.InferenceSession(MODEL_PATH)
    input_name = session.get_inputs()[0].name

    for path in sys.argv[1:]:
        classify(session, input_name, path)

if __name__ == "__main__":
    main()
