/// <reference lib="webworker" />
/**
 * Decodes a 16-bit height map (red = high byte, green = low byte) off the
 * main thread and returns half-float heights, rows flipped so v = 0 is the
 * bottom of the wall. Doing this on the main thread stalled scrolling for
 * tens of milliseconds every time a new carving arrived.
 */
import { DataUtils } from "three";

self.onmessage = async (event: MessageEvent<{ id: number; url: string }>) => {
  const { id, url } = event.data;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`height ${response.status}`);
    const bitmap = await createImageBitmap(await response.blob(), {
      colorSpaceConversion: "none",
      premultiplyAlpha: "none",
    });
    const { width, height } = bitmap;
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d", { willReadFrequently: true })!;
    context.drawImage(bitmap, 0, 0);
    bitmap.close();
    const pixels = context.getImageData(0, 0, width, height).data;
    const data = new Uint16Array(width * height);
    for (let y = 0; y < height; y++) {
      const source = (height - 1 - y) * width * 4;
      const target = y * width;
      for (let x = 0; x < width; x++) {
        const value =
          (pixels[source + x * 4] * 256 + pixels[source + x * 4 + 1]) / 65535;
        data[target + x] = DataUtils.toHalfFloat(value);
      }
    }
    (self as unknown as Worker).postMessage({ id, width, height, data }, [
      data.buffer,
    ]);
  } catch (error) {
    (self as unknown as Worker).postMessage({ id, error: String(error) });
  }
};
