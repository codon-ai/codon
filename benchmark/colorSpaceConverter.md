# Color Space Converter (HEX, RGB, HSL)
Create color conversion functions between HEX, RGB, and HSL in a single file.

Requirements:
- Export interface `RGB { r: number; g: number; b: number; }`.
- Export interface `HSL { h: number; s: number; l: number; }`.
- Export function `hexToRgb(hex: string): RGB`: strips leading `#`, parses 6-digit hex into `{ r, g, b }` (0-255). Throws on invalid format.
- Export function `rgbToHex(r: number, g: number, b: number): string`: clamps 0-255, formats as uppercase `"#RRGGBB"`.
- Export function `rgbToHsl(r: number, g: number, b: number): HSL`: computes hue `h` (0-360), saturation `s` (0-100), lightness `l` (0-100) rounded to integers.
