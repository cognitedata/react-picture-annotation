import React, { useContext } from "react";
import { Button, Switch, Slider } from "@cognite/cogs.js";
import CogniteFileViewerContext from "../Cognite/FileViewerContext";
import ColorPicker from "./ColorPicker";
import { WrappingBar, BarSection } from "./components";
import { DEFAULT } from "../utils";

export const PaintLayerBar = (): JSX.Element => {
  const {
    paintLayerCanvasRef,
    paintLayerEditMode,
    brushColor,
    brushRadius,
    snapStraightEnabled,
    setBrushColor,
    setSnapStraightEnabled,
    setBrushRadius,
    setPaintLayerEditMode,
  } = useContext(CogniteFileViewerContext);

  const onUndoClick = () => {
    if (paintLayerCanvasRef?.current) paintLayerCanvasRef.current.undo();
  };
  const onClearClick = () => {
    if (paintLayerCanvasRef?.current) paintLayerCanvasRef.current.clear();
  };

  return (
    <WrappingBar>
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
          </BarSection>
        </>
      )}
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
    </WrappingBar>
  );
};
