"""
Inspect an ArcFace (or any face) ONNX model: I/O names, shapes, dtypes,
and a dummy forward pass to confirm output embedding size.

Usage (from face_recognition/ or anywhere):
  pip install onnx onnxruntime numpy
  python scripts/inspect_onnx_face.py path/to/arcface.onnx
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np


def _fix_dynamic_shape(shape: list) -> list[int]:
    out: list[int] = []
    for dim in shape:
        if dim is None or (isinstance(dim, str) and not dim.isdigit()):
            out.append(1)
        else:
            out.append(int(dim))
    return out


def main() -> int:
    parser = argparse.ArgumentParser(description="Inspect ONNX face model I/O")
    parser.add_argument("onnx_path", type=Path, help="Path to .onnx file")
    args = parser.parse_args()
    path = args.onnx_path.resolve()
    if not path.is_file():
        print(f"File not found: {path}", file=sys.stderr)
        return 1

    try:
        import onnx
    except ImportError:
        onnx = None

    try:
        import onnxruntime as ort
    except ImportError:
        print("Install: pip install onnxruntime", file=sys.stderr)
        return 1

    print(f"=== ONNX file: {path} ===\n")

    if onnx is not None:
        m = onnx.load(str(path))
        print("--- Graph inputs (onnx) ---")
        for i in m.graph.input:
            t = i.type.tensor_type
            dims = [d.dim_value or d.dim_param or "?" for d in t.shape.dim]
            print(f"  name={i.name!r}  elem_type={t.elem_type}  shape={dims}")
        print("\n--- Graph outputs (onnx) ---")
        for o in m.graph.output:
            t = o.type.tensor_type
            dims = [d.dim_value or d.dim_param or "?" for d in t.shape.dim]
            print(f"  name={o.name!r}  elem_type={t.elem_type}  shape={dims}")
        print()

    sess = ort.InferenceSession(
        str(path),
        providers=["CPUExecutionProvider"],
    )

    print("--- Runtime inputs (onnxruntime) ---")
    for i in sess.get_inputs():
        print(f"  name={i.name!r}  shape={i.shape}  type={i.type}")
    print("\n--- Runtime outputs (onnxruntime) ---")
    for o in sess.get_outputs():
        print(f"  name={o.name!r}  shape={o.shape}  type={o.type}")

    # Dummy inference: use first input
    inp = sess.get_inputs()[0]
    fixed_shape = _fix_dynamic_shape(list(inp.shape))
    dummy = np.random.randn(*fixed_shape).astype(np.float32)

    print(f"\n--- Dummy forward (random input, shape={fixed_shape}) ---")
    feeds = {inp.name: dummy}
    outs = sess.run(None, feeds)
    for idx, arr in enumerate(outs):
        a = np.asarray(arr)
        flat = a.flatten()
        print(f"  output[{idx}]: shape={a.shape}  dtype={a.dtype}  len(flat)={len(flat)}")

    # Heuristic: embedding is usually the largest 1D or 2D (1,N) output
    best = max(outs, key=lambda x: np.asarray(x).size)
    b = np.asarray(best).flatten()
    print(f"\n>>> Treat as main embedding: length={len(b)} (verify against model docs)")

    print(
        "\n--- Preprocessing hints ---\n"
        "  • If input shape is [1, 3, H, W] → NCHW, RGB, often H=W=112.\n"
        "  • If input shape is [1, H, W, 3] → NHWC (like your current TFLite path).\n"
        "  • Match normalization to the training/export code (InsightFace often\n"
        "    uses (pixel - 127.5) / 128.0 on RGB; your app uses /127.5 - 1.0\n"
        "    which is (pixel - 127.5) / 127.5 — not identical).\n"
        "  • OpenCV loads BGR → convert to RGB before NCHW transpose.\n"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
