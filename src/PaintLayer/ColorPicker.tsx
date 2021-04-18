import React, { useState } from "react";
import { SketchPicker } from "react-color";
import {
  ColorSwatch,
  ColorPreview,
  ColorPickPopover,
  ColorPickCover,
} from "./components";
import { RGBColor } from "./types";

type Props = {
  brushColor: RGBColor;
  setBrushColor: (newColor: RGBColor) => void;
};
export default function ColorPicker(props: Props) {
  const { brushColor, setBrushColor } = props;
  const [showColorPicker, setShowColorPicker] = useState(false);

  const onColorPickerClick = () => setShowColorPicker(!showColorPicker);
  const onBrushColorChange = (color: { rgb: RGBColor }) =>
    setBrushColor(color.rgb);

  return (
    <div style={{ position: "relative" }}>
      <ColorSwatch onClick={onColorPickerClick}>
        <ColorPreview userColor={brushColor} />
      </ColorSwatch>
      {showColorPicker ? (
        <ColorPickPopover>
          <ColorPickCover onClick={() => setShowColorPicker(false)} />
          <SketchPicker color={brushColor} onChange={onBrushColorChange} />
        </ColorPickPopover>
      ) : null}
    </div>
  );
}
