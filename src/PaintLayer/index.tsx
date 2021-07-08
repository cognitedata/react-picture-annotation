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
    shouldSaveDrawData,
    setDrawData,
    setShouldSaveDrawData,
  } = useContext(FileViewerContext);
  const { getScaledDrawData, getRawDrawData } = useScaledDrawing(scaleState);
  const [loadTimeOffset] = useState(0);
  const [scaledDrawData, setScaledDrawData] = useState(drawData);
  const [tempDrawData, setTempDrawData] = useState(drawData);

  const saveDrawing = () => {
    if (!shouldSaveDrawData || hidePaintLayer) return;
    if (tempDrawData && tempDrawData !== drawData) {
      const rawDrawing = getRawDrawData(tempDrawData);
      setDrawData(String(rawDrawing));
    }
    setShouldSaveDrawData(false);
  };

  const saveTempDrawing = () => {
    if (hidePaintLayer || paintLayerEditMode) return;
    const newDrawing = paintLayerCanvasRef?.current?.getSaveData();
    if (newDrawing && newDrawing !== drawData) {
      const rawDrawing = getRawDrawData(newDrawing);
      setTempDrawData(String(rawDrawing));
    }
  };

  const adjustDrawingToScale = () => {
    const scaledData = getScaledDrawData(tempDrawData);
    setScaledDrawData(scaledData);
  };

  const onGetCanvasClick = () => {
    if (!snapStraightEnabled) return;
    const saveData = JSON.parse(tempDrawData);
    const lineToFix = saveData.lines.pop();
    lineToFix.points.splice(1, lineToFix.points.length - 2);
    saveData.lines.push(lineToFix);
    const fixedSaveData = JSON.stringify(saveData);
    const rawDrawing = getRawDrawData(fixedSaveData);
    setTempDrawData(String(rawDrawing));

    // const freshSaveData = paintLayerCanvasRef?.current?.getSaveData();
    // const saveData = JSON.parse(freshSaveData);
    // const lineToFix = saveData.lines.pop();
    // lineToFix.points.splice(1, lineToFix.points.length - 2);
    // saveData.lines.push(lineToFix);
    // const fixedSaveData = JSON.stringify(saveData);
    // const rescaledDrawing = getRawDrawData(fixedSaveData);
    // setTempDrawData(String(rescaledDrawing));
  };

  useEffect(() => {
    adjustDrawingToScale();
  }, [scaleState.scale, scaleState.originX, scaleState.originY, tempDrawData]);

  useEffect(() => {
    saveDrawing();
  }, [shouldSaveDrawData]);

  useEffect(() => {
    saveTempDrawing();
  }, [paintLayerEditMode]);

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
