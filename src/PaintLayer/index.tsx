import React, { useContext, useState, useEffect } from "react";
import CanvasDraw from "@agadacz-cognite/react-canvas-draw";
import styled from "styled-components";
import { FileViewerContext, useScaledDrawing } from "../context";
import { IStageState } from "../ReactPictureAnnotation";
import { Wrapper } from "./components";
import { toRGB } from "../utils/RGB";

const StyledCanvasDraw = styled(CanvasDraw).attrs(
  ({ paintLayerEditMode }: { paintLayerEditMode: boolean }) => {
    const style: any = {};
    if (!paintLayerEditMode) style.pointerEvents = "none";
    return { style };
  }
)<{ paintLayerEditMode: boolean }>``;

type Props = {
  scaleState: IStageState;
  hidePaintLayer: boolean;
};

export default function PaintLayer(props: Props): JSX.Element {
  const { scaleState, hidePaintLayer } = props;
  const {
    paintLayerCanvasRef,
    paintLayerEditMode,
    brushColor,
    brushRadius,
    drawData,
    snapStraightEnabled,
    setDrawData,
  } = useContext(FileViewerContext);
  const { getRescaledDrawData, getRawDrawData } = useScaledDrawing(scaleState);
  const [loadTimeOffset] = useState(0);
  const [scaledDrawData, setScaledDrawData] = useState(drawData);

  const onGetCanvasClick = () => {
    if (!snapStraightEnabled) return;
    const freshSaveData = paintLayerCanvasRef?.current?.getSaveData();
    const saveData = JSON.parse(freshSaveData);
    const lineToFix = saveData.lines.pop();
    lineToFix.points.splice(1, lineToFix.points.length - 2);
    saveData.lines.push(lineToFix);
    const fixedSaveData = JSON.stringify(saveData);
    const rescaledDrawing = getRawDrawData(fixedSaveData);
    setDrawData(String(rescaledDrawing));
  };

  useEffect(() => {
    if (hidePaintLayer) return;
    if (!paintLayerEditMode) {
      const newDrawing = paintLayerCanvasRef?.current?.getSaveData();
      if (newDrawing && newDrawing !== drawData) {
        const rescaledDrawing = getRawDrawData(newDrawing);
        setDrawData(String(rescaledDrawing));
      }
    }
  }, [paintLayerEditMode]);

  useEffect(() => {
    const rescaledData = getRescaledDrawData(drawData);
    setScaledDrawData(rescaledData);
  }, [scaleState.scale, scaleState.originX, scaleState.originY, drawData]);

  return (
    <Wrapper onMouseUp={onGetCanvasClick}>
      {!hidePaintLayer && (
        <StyledCanvasDraw
          ref={paintLayerCanvasRef}
          saveData={scaledDrawData}
          hideGrid={true}
          brushColor={toRGB(brushColor)}
          brushRadius={brushRadius}
          canvasHeight="100%"
          canvasWidth="100%"
          disabled={!paintLayerEditMode}
          paintLayerEditMode={paintLayerEditMode}
          loadTimeOffset={loadTimeOffset}
          style={{ background: "transparent" }}
        />
      )}
    </Wrapper>
  );
}

export * from "./helpers";
