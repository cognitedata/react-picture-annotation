import React, { useState, useRef } from "react";
import CanvasDraw from "react-canvas-draw";
import ColorPicker from "./ColorPicker";
import { Bar, Wrapper } from "./components";
import { RGBColor } from "./types";

const DEFAULT = {
  COLOR: {
    r: 255,
    g: 0,
    b: 0,
    a: 0.3,
  },
  RADIUS: 20,
};

const toRGB = (userColor: RGBColor) => {
  return `rgba(${userColor.r},${userColor.g},${userColor.b},${userColor.a})`;
};

type Props = {
  width: number;
  height: number;
};
export default function PaintLayer(props: Props): JSX.Element {
  const { width, height } = props;
  const [brushColor, setBrushColor] = useState<RGBColor>(DEFAULT.COLOR);
  const [brushRadius, setBrushRadius] = useState<number>(DEFAULT.RADIUS);
  const canvasRef = useRef(null);

  const onBrushRadiusChange = (event: any) => {
    const radius = event.target.value;
    setBrushRadius(radius);
  };

  return (
    <Wrapper>
      <CanvasDraw
        ref={canvasRef}
        hideGrid={true}
        brushColor={toRGB(brushColor)}
        brushRadius={brushRadius}
        canvasHeight={width}
        canvasWidth={height}
      />
      <Bar>
        <ColorPicker brushColor={brushColor} setBrushColor={setBrushColor} />
        <input min="2" max="50" type="range" onChange={onBrushRadiusChange} />
      </Bar>
    </Wrapper>
  );
}
