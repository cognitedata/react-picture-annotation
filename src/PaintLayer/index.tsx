import React, { useState, useEffect, useRef } from "react";
import CanvasDraw from "react-canvas-draw";
import { Button } from "@cognite/cogs.js";
import { Bar, BrushRadiusGroup, BrushRadius, Wrapper } from "./components";
import ColorPicker from "./ColorPicker";
import { RGBColor } from "./types";

const DEFAULT = {
  COLOR: {
    r: 255,
    g: 0,
    b: 0,
    a: 0.1,
  },
  RADIUS: 20,
  RADIUS_MIN: 2,
  RADIUS_MAX: 20,
};

const toRGB = (userColor: RGBColor) => {
  return `rgba(${userColor.r},${userColor.g},${userColor.b},${userColor.a})`;
};

type Props = {
  width?: number;
  height?: number;
  drawData: string;
  onPaintLayerDraw: (drawData: string) => void;
};

export default function PaintLayer(props: Props): JSX.Element {
  const { width = "90%", height = "90%", drawData, onPaintLayerDraw } = props;
  const [brushColor, setBrushColor] = useState<RGBColor>(DEFAULT.COLOR);
  const [brushRadius, setBrushRadius] = useState<number>(DEFAULT.RADIUS);
  const canvasRef = useRef<CanvasDraw>(null);

  const enableDrawing = () => {
    if (canvasRef?.current && drawData && drawData.length > 0) {
      canvasRef.current.loadSaveData(drawData);
    }
  };
  const onBrushRadiusChange = (event: any) => {
    const radius = event.target.value;
    setBrushRadius(radius);
  };
  const onUndoClick = () => {
    if (canvasRef?.current) canvasRef.current.undo();
  };
  const onClearClick = () => {
    if (canvasRef?.current) canvasRef.current.clear();
  };
  const onDraw = () => {
    if (canvasRef?.current) {
      const newDrawData = canvasRef.current.getSaveData();
      onPaintLayerDraw(newDrawData);
    }
  };

  useEffect(() => {
    enableDrawing();
  }, []);

  return (
    <Wrapper>
      <CanvasDraw
        ref={canvasRef}
        hideGrid={true}
        brushColor={toRGB(brushColor)}
        brushRadius={brushRadius}
        canvasHeight={width}
        canvasWidth={height}
        onChange={onDraw}
        style={{ background: "transparent" }}
      />
      <Bar>
        <ColorPicker brushColor={brushColor} setBrushColor={setBrushColor} />
        <BrushRadiusGroup>
          <BrushRadius radius={DEFAULT.RADIUS_MIN} color={toRGB(brushColor)} />
          <input
            min={DEFAULT.RADIUS_MIN}
            max={DEFAULT.RADIUS_MAX}
            type="range"
            onChange={onBrushRadiusChange}
          />
          <BrushRadius radius={DEFAULT.RADIUS_MAX} color={toRGB(brushColor)} />
        </BrushRadiusGroup>
        <Button icon="ArrowBack" onClick={onUndoClick} />
        <Button icon="Trash" onClick={onClearClick} />
      </Bar>
    </Wrapper>
  );
}
