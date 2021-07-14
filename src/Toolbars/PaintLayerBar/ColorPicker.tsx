import React, { useState } from "react";
import { SketchPicker } from "react-color";
import { Popover, ArrowContainer } from "react-tiny-popover";
import { RGBColor } from "../../utils/RGB";
import { ColorPreview } from "./components";

type Props = {
  brushColor: RGBColor;
  setBrushColor: (newColor: RGBColor) => void;
};

export default function ColorPicker(props: Props) {
  const { brushColor, setBrushColor } = props;
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [opacity] = useState("80");
  const [presetColors] = useState(
    [
      "#D0021B",
      "#F5A623",
      "#F8E71C",
      "#8B572A",
      "#7ED321",
      "#417505",
      "#BD10E0",
      "#9013FE",
      "#4A90E2",
      "#50E3C2",
      "#B8E986",
      "#000000",
      "#4A4A4A",
      "#9B9B9B",
      "#FFFFFF",
    ].map((color) => `${color}${opacity}`)
  );

  const onColorPickerClick = () => setShowColorPicker(!showColorPicker);
  const onBrushColorChange = (color: { rgb: RGBColor }) =>
    setBrushColor(color.rgb);

  return (
    <Popover
      isOpen={showColorPicker}
      onClickOutside={() => setShowColorPicker(false)}
      positions={["top", "right", "bottom", "left"]}
      containerStyle={{ zIndex: "101" }}
      content={({ position, childRect, popoverRect }) => (
        <ArrowContainer
          position={position}
          childRect={childRect}
          popoverRect={popoverRect}
          arrowColor={"white"}
          arrowSize={10}
          style={{ zIndex: 101 }}
        >
          <SketchPicker
            color={brushColor}
            presetColors={presetColors}
            onChange={onBrushColorChange}
          />
        </ArrowContainer>
      )}
    >
      <ColorPreview onClick={onColorPickerClick} userColor={brushColor} />
    </Popover>
  );
}
