import React, { useEffect, useContext } from "react";
import CanvasDraw from "react-canvas-draw";
import LZString from "lz-string";
import CogniteFileViewerContext from "../Cognite/FileViewerContext";
import { Wrapper } from "./components";
import { toRGB } from "../utils/RGB";

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
      <CanvasDraw
        ref={paintLayerCanvasRef}
        hideGrid={true}
        brushColor={toRGB(brushColor)}
        brushRadius={brushRadius}
        canvasHeight={width}
        canvasWidth={height}
        disabled={!paintLayerEditMode}
        style={{ background: "transparent" }}
      />
    </Wrapper>
  );
}
