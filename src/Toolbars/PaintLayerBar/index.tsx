import React, { useContext } from "react";
import { Button, Switch, Slider } from "@cognite/cogs.js";
import { FileViewerContext, useScaledDrawing } from "../../context";
import { DEFAULT } from "../../utils";
import ColorPicker from "./ColorPicker";
import { WrappingBar, BarSection } from "./components";

type Props = { isMirrored: boolean };
export default function PaintLayerBar(props: Props): JSX.Element {
  const { isMirrored } = props;
  const {
    paintLayerCanvasRef,
    paintLayerEditMode,
    brushColor,
    brushRadius,
    snapStraightEnabled,
    drawData,
    setBrushColor,
    setSnapStraightEnabled,
    setBrushRadius,
    setPaintLayerEditMode,
    setDrawData,
  } = useContext(FileViewerContext);
  const scaleState = { scale: 1, originX: 0, originY: 0 }; // WIP
  const { getRawDrawData } = useScaledDrawing(scaleState);

  const onUndoClick = () => {
    if (paintLayerCanvasRef?.current) paintLayerCanvasRef.current.undo();
  };
  const onClearClick = () => {
    if (paintLayerCanvasRef?.current) paintLayerCanvasRef.current.clear();
  };
  const onSaveClick = () => {
    if (!paintLayerCanvasRef?.current) return;
    const newDrawing = paintLayerCanvasRef?.current?.getSaveData();
    if (newDrawing && newDrawing !== drawData) {
      const rescaledDrawing = getRawDrawData(newDrawing);
      setDrawData(String(rescaledDrawing));
    }
  };

  return (
    <WrappingBar>
      {isMirrored && (
        <BarSection hasMargin={true} noBorder={!paintLayerEditMode}>
          <Button
            icon="Edit"
            variant={paintLayerEditMode ? "default" : "ghost"}
            onClick={() => {
              setPaintLayerEditMode(!paintLayerEditMode);
            }}
            aria-label="editButton"
            size="small"
            style={{ margin: "0 1px" }}
          />
        </BarSection>
      )}
      {paintLayerEditMode && (
        <>
          <BarSection hasMargin={true} noBorder={true}>
            <span>Color</span>
            <ColorPicker
              brushColor={brushColor}
              setBrushColor={setBrushColor}
            />
          </BarSection>
          <BarSection hasMargin={true}>
            <span>Size</span>
            <div style={{ width: "68px", padding: "0 4px" }}>
              <Slider
                min={DEFAULT.RADIUS_MIN}
                max={DEFAULT.RADIUS_MAX}
                step={1}
                value={brushRadius}
                onChange={setBrushRadius}
              />
            </div>
          </BarSection>
          <BarSection hasMargin={true}>
            <span>Snap straight</span>
            <Switch
              size="small"
              name="snapStraightSwitch"
              value={snapStraightEnabled}
              onChange={(nextState: boolean) =>
                setSnapStraightEnabled(nextState)
              }
              style={{ height: "16px" }}
            />
          </BarSection>
          <BarSection hasMargin={true}>
            <Button
              size="small"
              onClick={onUndoClick}
              aria-label="redoDrawChangesButton"
              style={{ fontSize: "11px", height: "24px" }}
            >
              Undo
            </Button>
            <Button
              size="small"
              type="ghost-danger"
              onClick={onClearClick}
              aria-label="deleteDrawingButton"
              style={{ fontSize: "11px", height: "24px" }}
            >
              Erase all
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={onSaveClick}
              aria-label="saveDrawingButton"
              style={{ fontSize: "11px", height: "24px" }}
            >
              Save
            </Button>
          </BarSection>
        </>
      )}
      {!isMirrored && (
        <BarSection hasMargin={true} noBorder={!paintLayerEditMode}>
          <Button
            icon="Edit"
            variant={paintLayerEditMode ? "default" : "ghost"}
            onClick={() => {
              setPaintLayerEditMode(!paintLayerEditMode);
            }}
            aria-label="editButton"
            size="small"
            style={{ margin: "0 1px" }}
          />
        </BarSection>
      )}
    </WrappingBar>
  );
}
