"""GPU horizon scan for the relief bake.

`max_slope` in build_relief.py looks from every texel along one direction
and records the steepest rise (height difference / distance) over 45 samples.
On the CPU that is ~19 x 45 bilinear shifts of the whole height map, which
dominated the bake (about 60 of 90 seconds). Here the same arithmetic is an
ONNX graph of static slices, run by onnxruntime on DirectML (the GTX 1650
on the user's PC) or CUDA when available. Results match the OpenCV version
to floating-point precision (bilinear taps, replicate border).
"""

from __future__ import annotations

import math

import numpy as np

try:
    import onnx
    import onnxruntime as ort
    from onnx import TensorProto, helper
except ImportError:  # pragma: no cover - CPU fallback lives in build_relief
    onnx = None


def available() -> bool:
    if onnx is None:
        return False
    providers = ort.get_available_providers()
    return "DmlExecutionProvider" in providers or "CUDAExecutionProvider" in providers


def _graph(h: int, w: int, pad: int, angles, steps: int, step: float):
    nodes = []
    inits = []
    counter = [0]

    def name(prefix):
        counter[0] += 1
        return f"{prefix}{counter[0]}"

    def const(values, dtype=np.int64):
        n = name("c")
        inits.append(helper.make_tensor(n, TensorProto.INT64 if dtype == np.int64 else TensorProto.FLOAT,
                                        [len(values)] if dtype == np.int64 else [], values))
        return n

    axes = const([2, 3])

    def window(oy: int, ox: int):
        """Padded map read at integer offset (oy, ox): shape (1,1,h,w)."""
        out = name("s")
        nodes.append(helper.make_node("Slice", ["P", const([pad + oy, pad + ox]),
                                                const([pad + oy + h, pad + ox + w]), axes], [out]))
        return out

    centre = window(0, 0)
    outputs = []
    for a_index, angle in enumerate(angles):
        dx, dy = math.cos(angle), -math.sin(angle)
        best = None
        for i in range(1, steps):
            t = i * step * (1 + i / steps)
            # cv2.warpAffine with translation (-dx*t, -dy*t) samples the
            # source at (x + dx*t, y + dy*t).
            ox, oy = dx * t, dy * t
            fx, fy = math.floor(ox), math.floor(oy)
            ax, ay = ox - fx, oy - fy
            taps = []
            for (yy, xx, weight) in ((fy, fx, (1 - ax) * (1 - ay)), (fy, fx + 1, ax * (1 - ay)),
                                     (fy + 1, fx, (1 - ax) * ay), (fy + 1, fx + 1, ax * ay)):
                if weight < 1e-7:
                    continue
                win = window(yy, xx)
                wn = name("w")
                inits.append(helper.make_tensor(wn, TensorProto.FLOAT, [], [weight]))
                out = name("m")
                nodes.append(helper.make_node("Mul", [win, wn], [out]))
                taps.append(out)
            acc = taps[0]
            for tap in taps[1:]:
                out = name("a")
                nodes.append(helper.make_node("Add", [acc, tap], [out]))
                acc = out
            diff = name("d")
            nodes.append(helper.make_node("Sub", [acc, centre], [diff]))
            inv = name("i")
            inits.append(helper.make_tensor(inv, TensorProto.FLOAT, [], [1.0 / t]))
            rise = name("r")
            nodes.append(helper.make_node("Mul", [diff, inv], [rise]))
            if best is None:
                best = rise
            else:
                out = name("x")
                nodes.append(helper.make_node("Max", [best, rise], [out]))
                best = out
        outputs.append(best)
    stacked = "OUT"
    nodes.append(helper.make_node("Concat", outputs, [stacked], axis=1))
    graph = helper.make_graph(
        nodes, "horizon",
        [helper.make_tensor_value_info("P", TensorProto.FLOAT, [1, 1, h + 2 * pad, w + 2 * pad])],
        [helper.make_tensor_value_info(stacked, TensorProto.FLOAT, [1, len(angles), h, w])],
        inits,
    )
    model = helper.make_model(graph, opset_imports=[helper.make_opsetid("", 17)])
    model.ir_version = 8
    return model.SerializeToString()


def _generic_graph(h: int, w: int, pad: int, steps: int):
    """One direction, any angle: every tap's offsets and weights are inputs,
    so a single compiled session serves all directions."""
    nodes, inputs = [], [helper.make_tensor_value_info("P", TensorProto.FLOAT, [1, 1, h + 2 * pad, w + 2 * pad])]
    inits = [helper.make_tensor("axes", TensorProto.INT64, [2], [2, 3]),
             helper.make_tensor("size", TensorProto.INT64, [2], [h, w]),
             helper.make_tensor("c0", TensorProto.INT64, [2], [pad, pad])]
    nodes.append(helper.make_node("Add", ["c0", "size"], ["c1"]))
    nodes.append(helper.make_node("Slice", ["P", "c0", "c1", "axes"], ["centre"]))
    best = None
    for i in range(1, steps):
        taps = []
        for k in range(4):
            st, wt = f"st{i}_{k}", f"wt{i}_{k}"
            inputs.append(helper.make_tensor_value_info(st, TensorProto.INT64, [2]))
            inputs.append(helper.make_tensor_value_info(wt, TensorProto.FLOAT, [1]))
            nodes.append(helper.make_node("Add", [st, "size"], [f"en{i}_{k}"]))
            nodes.append(helper.make_node("Slice", ["P", st, f"en{i}_{k}", "axes"], [f"win{i}_{k}"]))
            nodes.append(helper.make_node("Mul", [f"win{i}_{k}", wt], [f"tap{i}_{k}"]))
            taps.append(f"tap{i}_{k}")
        nodes.append(helper.make_node("Sum", taps, [f"acc{i}"]))
        nodes.append(helper.make_node("Sub", [f"acc{i}", "centre"], [f"d{i}"]))
        inputs.append(helper.make_tensor_value_info(f"inv{i}", TensorProto.FLOAT, [1]))
        nodes.append(helper.make_node("Mul", [f"d{i}", f"inv{i}"], [f"r{i}"]))
        if best is None:
            best = f"r{i}"
        else:
            nodes.append(helper.make_node("Max", [best, f"r{i}"], [f"b{i}"]))
            best = f"b{i}"
    graph = helper.make_graph(nodes, "horizon", inputs,
                              [helper.make_tensor_value_info(best, TensorProto.FLOAT, [1, 1, h, w])], inits)
    model = helper.make_model(graph, opset_imports=[helper.make_opsetid("", 17)])
    model.ir_version = 8
    return model.SerializeToString(), best


def max_slopes(wall: np.ndarray, angles, steps: int, step: float):
    """Return [max_slope(angle) for angle in angles], computed on the GPU."""
    h, w = wall.shape
    pad = int(math.ceil((steps - 1) * step * 2 + 2)) + 2
    padded = np.pad(wall.astype(np.float32), pad, mode="edge")[None, None]
    providers = [p for p in ("CUDAExecutionProvider", "DmlExecutionProvider") if p in ort.get_available_providers()]
    options = ort.SessionOptions()
    options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_BASIC
    options.enable_mem_pattern = False
    model, _ = _generic_graph(h, w, pad, steps)
    session = ort.InferenceSession(model, options, providers=providers)
    results = []
    for angle in angles:
        dx, dy = math.cos(angle), -math.sin(angle)
        feed = {"P": padded}
        for i in range(1, steps):
            t = i * step * (1 + i / steps)
            ox, oy = dx * t, dy * t
            fx, fy = math.floor(ox), math.floor(oy)
            ax, ay = ox - fx, oy - fy
            taps = ((fy, fx, (1 - ax) * (1 - ay)), (fy, fx + 1, ax * (1 - ay)),
                    (fy + 1, fx, (1 - ax) * ay), (fy + 1, fx + 1, ax * ay))
            for k, (yy, xx, weight) in enumerate(taps):
                feed[f"st{i}_{k}"] = np.array([pad + yy, pad + xx], np.int64)
                feed[f"wt{i}_{k}"] = np.array([weight], np.float32)
            feed[f"inv{i}"] = np.array([1.0 / t], np.float32)
        results.append(session.run(None, feed)[0][0, 0])
    return results
