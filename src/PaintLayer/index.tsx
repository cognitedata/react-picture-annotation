import React, { useState, useEffect, useRef } from "react";
import CanvasDraw from "react-canvas-draw";
import { Button } from "@cognite/cogs.js";
import LZString from "lz-string";
import { Bar, BrushRadiusGroup, BrushRadius, Wrapper } from "./components";
import ColorPicker from "./ColorPicker";
import { toRGB, RGBColor } from "../utils/RGB";

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

type Props = {
  width?: number;
  height?: number;
  drawData?: string;
  paintLayerEditMode?: boolean;
  onPaintLayerDraw?: (drawData: string) => void;
};

export default function PaintLayer(props: Props): JSX.Element {
  const {
    width = "90%",
    height = "90%",
    drawData,
    paintLayerEditMode = false,
    onPaintLayerDraw,
  } = props;
  const [brushColor, setBrushColor] = useState<RGBColor>(DEFAULT.COLOR);
  const [brushRadius, setBrushRadius] = useState<number>(DEFAULT.RADIUS);
  const canvasRef = useRef<CanvasDraw>(null);

  const loadPreviousDrawing = () => {
    if (canvasRef?.current && drawData && drawData.length > 0) {
      const drawDataDecompressed = String(LZString.decompress(drawData));
      canvasRef.current.loadSaveData(drawDataDecompressed);
    }
  };

  const onBrushRadiusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const radius = Number(event.target.value);
    setBrushRadius(radius);
  };
  const onUndoClick = () => {
    if (canvasRef?.current) canvasRef.current.undo();
  };
  const onClearClick = () => {
    if (canvasRef?.current) canvasRef.current.clear();
  };
  const onSaveClick = () => {
    if (canvasRef?.current && onPaintLayerDraw) {
      const newDrawData = canvasRef.current.getSaveData();
      const newDrawDataCompressed = LZString.compress(newDrawData);
      onPaintLayerDraw(newDrawDataCompressed);
    }
  };

  useEffect(() => {
    loadPreviousDrawing();
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
        disabled={!paintLayerEditMode}
        style={{ background: "transparent" }}
      />
      <Bar visible={paintLayerEditMode}>
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
        {onPaintLayerDraw && <Button icon="FloppyDisk" onClick={onSaveClick} />}
      </Bar>
    </Wrapper>
  );
}
