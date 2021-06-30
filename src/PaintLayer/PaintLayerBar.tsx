import React, { useContext } from "react";
import { Button, Tooltip } from "@cognite/cogs.js";
import CogniteFileViewerContext from "../Cognite/FileViewerContext";
import { Bar, BrushRadiusGroup, BrushRadius } from "./components";
import ColorPicker from "./ColorPicker";
import { toRGB, DEFAULT } from "../utils";

export const PaintLayerBar = (): JSX.Element => {
  const {
    paintLayerCanvasRef,
    paintLayerEditMode,
    brushColor,
    freeDrawEnabled,
    setBrushColor,
    setFreeDrawEnabled,
    setBrushRadius,
  } = useContext(CogniteFileViewerContext);

  const onBrushRadiusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const radius = Number(event.target.value);
    setBrushRadius(radius);
  };
  const onFreeDrawClick = () => {
    setFreeDrawEnabled(!freeDrawEnabled);
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
      <Tooltip
        content={
          <span>
            {freeDrawEnabled
              ? "Disable the freehand mode"
              : "Enable the freehand mode"}
          </span>
        }
      >
        <Button
          icon="LineChart"
          onClick={onFreeDrawClick}
          aria-label="freeDrawButton"
          style={{
            boxSizing: "border-box",
            boxShadow: freeDrawEnabled ? "inset 0 0 5px #000" : "none",
          }}
        />
      </Tooltip>
      <Tooltip content={<span>Undo the last change</span>}>
        <Button
          icon="RotateLeft"
          onClick={onUndoClick}
          aria-label="redoDrawChangesButton"
        />
      </Tooltip>
      <Tooltip content={<span>Clear the entire drawing</span>}>
        <Button
          icon="Trash"
          onClick={onClearClick}
          aria-label="deleteDrawingButton"
        />
      </Tooltip>
    </Bar>
  );
};
