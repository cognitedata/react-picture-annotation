import React, { useContext } from "react";
import { Button } from "@cognite/cogs.js";
import CogniteFileViewerContext from "../Cognite/FileViewerContext";
import { Bar, BrushRadiusGroup, BrushRadius } from "./components";
import ColorPicker from "./ColorPicker";
import { toRGB, DEFAULT } from "../utils";

export const PaintLayerBar = (): JSX.Element => {
  const {
    paintLayerCanvasRef,
    paintLayerEditMode,
    brushColor,
    setBrushColor,
    setBrushRadius,
  } = useContext(CogniteFileViewerContext);

  const onBrushRadiusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const radius = Number(event.target.value);
    setBrushRadius(radius);
  };
  const onUndoClick = () => {
    if (paintLayerCanvasRef?.current) paintLayerCanvasRef.current.undo();
  };
  const onClearClick = () => {
    if (paintLayerCanvasRef?.current) paintLayerCanvasRef.current.clear();
  };

  return (
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
      <Button
        icon="RotateLeft"
        onClick={onUndoClick}
        aria-label="redoDrawChangesButton"
      />
      <Button
        icon="Trash"
        onClick={onClearClick}
        aria-label="deleteDrawingButton"
      />
    </Bar>
  );
};
