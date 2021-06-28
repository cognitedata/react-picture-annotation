import React, { useState } from "react";
import { SketchPicker } from "react-color";
import { Popover, ArrowContainer } from "react-tiny-popover";
import { ColorSwatch, ColorPreview } from "./components";
import { RGBColor } from "../utils/RGB";

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
          <SketchPicker color={brushColor} onChange={onBrushColorChange} />
        </ArrowContainer>
      )}
    >
      <ColorSwatch onClick={onColorPickerClick}>
        <ColorPreview userColor={brushColor} />
      </ColorSwatch>
    </Popover>
  );
}
