"""Quick inference test — pass one or more image paths as arguments."""
import sys
import numpy as np
from PIL import Image
import onnxruntime as ort

MODEL_PATH = "serve/model/nature_classifier.onnx"

def preprocess(path: str) -> np.ndarray:
    img = Image.open(path).convert("RGB").resize((224, 224))
    arr = np.array(img, dtype="float32")
    # EfficientNet preprocessing: scale to [-1, 1]
    arr = (arr / 127.5) - 1.0
    return np.expand_dims(arr, 0)

def classify(session, input_name: str, path: str) -> None:
    arr = preprocess(path)
    confidence = float(session.run(None, {input_name: arr})[0][0][0])

    if confidence >= 0.85:
        rec = "AutoApprove  [PASS]"
    elif confidence >= 0.45:
        rec = "NeedsReview  [?]"
    else:
        rec = "AutoReject   [FAIL]"

    print(f"{path}")
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
