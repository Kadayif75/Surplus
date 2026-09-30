import { describe, expect, it } from 'vitest';
import JsBarcode from 'jsbarcode';
import { BinaryBitmap, HybridBinarizer, MultiFormatReader, RGBLuminanceSource, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { seedMappings } from '../data/seed';

describe('Afdrukbare codes echt decoderen, zonder fysieke camera', () => {
  it.each(seedMappings)('D01: $rawValue wordt door ZXing correct gelezen', mapping => {
    const target = {} as { encodings: { data: string }[] };
    JsBarcode(target, mapping.rawValue, { format: mapping.symbology === 'CODE_128' ? 'CODE128' : 'EAN13', displayValue: false });
    const bars = target.encodings.map(e => e.data).join('');
    const width = bars.length * 3 + 120, height = 100;
    const pixels = new Uint8ClampedArray(width * height).fill(255);
    for (let y = 10; y < 90; y++) for (let x = 60; x < width - 60; x++) pixels[y * width + x] = bars[Math.floor((x - 60) / 3)] === '1' ? 0 : 255;
    const reader = new MultiFormatReader();
    const result = reader.decode(new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(pixels, width, height))), new Map([[DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128, BarcodeFormat.EAN_13]]]));
    expect(result.getText()).toBe(mapping.rawValue); expect(BarcodeFormat[result.getBarcodeFormat()]).toBe(mapping.symbology);
  });
});
