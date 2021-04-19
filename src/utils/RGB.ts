export type RGBColor = {
  r: number;
  g: number;
  b: number;
  a?: number;
};

export const toRGB = (color: RGBColor) =>
  `rgba(${color.r},${color.g},${color.b},${color.a})`;
