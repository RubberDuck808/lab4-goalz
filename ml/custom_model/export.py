"""
export.py — Export trained model to ONNX and verify inference parity.

Usage:
    python export.py --checkpoint checkpoints/best_model.pth --output custom_resnet.onnx

CRITICAL: always export from raw_model, NOT the torch.compile'd model.
    torch.onnx.export traces the computation graph by running a dummy input
    through the model. torch.compile wraps nn.Module in a way the tracer
    cannot follow — export will fail or produce a broken graph.
    raw_model and model share the SAME weights (compile doesn't copy them),
    so exporting raw_model gives you the trained model.

After export:
    cp custom_resnet.onnx ../serve/model/nature_classifier.onnx
"""

import argparse
import numpy as np
import torch
import onnx
import onnxruntime as ort

from model import NatureResNet


def stable_softmax(logits: np.ndarray) -> np.ndarray:
    """
    Numerically stable softmax.

    Problem: np.exp(logits) overflows for large logit values.
    Example: logit=100 → exp(100) ≈ 2.7e43, exceeds float32 max (3.4e38) → NaN.

    Solution: subtract the max value before exponentiation.
    This is mathematically equivalent because:
        softmax(x) = exp(x) / sum(exp(x))
                   = exp(x - max) / sum(exp(x - max))  ← identical result

    After subtracting max: exp(100-100) = exp(0) = 1 — no overflow.

    This must match the serving code in app.py exactly.
    """
    e = np.exp(logits - logits.max(axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)


def export_onnx(raw_model: NatureResNet, output_path: str, device: torch.device) -> None:
    """
    Export raw_model to ONNX format.

    input_names=["input"]: must match what app.py queries at runtime:
        input_name = session.get_inputs()[0].name

    dynamic_axes: allows the batch dimension to vary at inference time.
        Without this, the model is locked to batch_size=1.
        Adding a batch dimension: input (B, 3, 224, 224) with dynamic B.

    opset_version=17: stable and well-supported by onnxruntime 1.18+.
    """
    raw_model.eval()
    # CRITICAL: model must be in eval mode before export.
    # export traces the graph — Dropout must be disabled so the graph is
    # deterministic. If you forget this, the exported model will behave
    # differently every inference call.

    dummy_input = torch.randn(1, 3, 224, 224, device=device)
    # torch.onnx.export traces the model by running this dummy input through it.
    # The resulting computation graph (operations + weights) is saved as ONNX.

    torch.onnx.export(
        raw_model,              # must be the raw (uncompiled) nn.Module
        dummy_input,
        output_path,
        input_names=["input"],  # name for the input tensor
        output_names=["output"],# name for the output tensor (logits)
        dynamic_axes={
            "input":  {0: "batch_size"},  # batch dim is dynamic
            "output": {0: "batch_size"},
        },
        opset_version=17,
        verbose=False,
    )
    print(f"ONNX model exported to: {output_path}")


def verify_onnx(output_path: str) -> None:
    """
    Verify the ONNX model is structurally valid and has the correct tensor names.
    """
    model_onnx = onnx.load(output_path)
    onnx.checker.check_model(model_onnx)
    print("ONNX structural check: PASSED")

    input_name  = model_onnx.graph.input[0].name
    output_name = model_onnx.graph.output[0].name
    print(f"Input tensor name:  '{input_name}'")   # must be "input"
    print(f"Output tensor name: '{output_name}'")  # must be "output"

    if input_name != "input":
        print(f"  WARNING: input name is '{input_name}', expected 'input'.")
        print("  app.py queries session.get_inputs()[0].name at runtime,")
        print("  so this is not a bug — but verify app.py reads it dynamically.")


def parity_check(raw_model: NatureResNet, output_path: str, device: torch.device) -> None:
    """
    Verify that PyTorch and ONNX Runtime produce identical outputs.

    We compare softmax probabilities (not raw logits) because probabilities
    are what serving code uses for recommendations.

    Max diff < 1e-4 is the acceptance threshold. Typical value: ~1e-6.
    If this fails, the ONNX tracer produced a different graph than the
    nn.Module forward pass — likely a torch.compile artifact.
    """
    test_input = torch.randn(1, 3, 224, 224)

    # PyTorch
    raw_model.eval()
    with torch.no_grad():
        pt_logits = raw_model(test_input.to(device)).cpu().numpy()
    pt_probs = stable_softmax(pt_logits)

    # ONNX Runtime
    session = ort.InferenceSession(output_path)
    ort_input_name = session.get_inputs()[0].name
    ort_logits = session.run(None, {ort_input_name: test_input.numpy()})[0]
    ort_probs = stable_softmax(ort_logits)

    diff = np.abs(pt_probs - ort_probs).max()
    print(f"\nParity check — max absolute difference: {diff:.8f}")

    if diff < 1e-4:
        print("Parity check: PASSED")
    else:
        print(f"Parity check: FAILED (diff={diff:.8f} >= 1e-4)")
        print("  Possible cause: exported from torch.compile'd model instead of raw_model.")
        raise AssertionError(f"Parity check failed: max diff = {diff}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", default="checkpoints/best_model.pth")
    parser.add_argument("--output",     default="custom_resnet.onnx")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Load checkpoint into raw_model
    raw_model = NatureResNet(num_classes=9).to(device)
    checkpoint = torch.load(args.checkpoint, map_location=device)
    raw_model.load_state_dict(checkpoint["model_state_dict"])
    print(f"Loaded checkpoint: {args.checkpoint}")
    print(f"  Phase: {checkpoint.get('phase', '?')}, "
          f"Epoch: {checkpoint.get('epoch', '?')}")

    # Export, verify, parity check
    export_onnx(raw_model, args.output, device)
    verify_onnx(args.output)
    parity_check(raw_model, args.output, device)

    print(f"\nExport complete: {args.output}")
    print(f"\nTo deploy, copy to serving directory:")
    print(f"    cp {args.output} ../serve/model/nature_classifier.onnx")


if __name__ == "__main__":
    main()
