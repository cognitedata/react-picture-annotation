import React, { useEffect, useContext } from "react";
import CanvasDraw from "@agadacz-cognite/react-canvas-draw";
import styled from "styled-components";
import LZString from "lz-string";
import CogniteFileViewerContext from "../Cognite/FileViewerContext";
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
  width?: number;
  height?: number;
  drawData?: string;
};

export default function PaintLayer(props: Props): JSX.Element {
  const { width = "90%", height = "90%", drawData } = props;
  const {
    paintLayerCanvasRef,
    paintLayerEditMode,
    brushColor,
    brushRadius,
  } = useContext(CogniteFileViewerContext);

  const loadPreviousDrawing = () => {
    if (paintLayerCanvasRef?.current && drawData && drawData.length > 0) {
      const drawDataDecompressed = String(LZString.decompress(drawData));
      paintLayerCanvasRef.current.loadSaveData(drawDataDecompressed);
    }
  };

  useEffect(() => {
    loadPreviousDrawing();
  }, []);

  return (
    <Wrapper>
      <StyledCanvasDraw
        ref={paintLayerCanvasRef}
        hideGrid={true}
        brushColor={toRGB(brushColor)}
        brushRadius={brushRadius}
        canvasHeight={width}
        canvasWidth={height}
        disabled={!paintLayerEditMode}
        paintLayerEditMode={paintLayerEditMode}
        style={{ background: "transparent" }}
      />
    </Wrapper>
  );
}
