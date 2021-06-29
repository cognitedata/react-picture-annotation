import React, { useContext, useState, useEffect } from "react";
import CanvasDraw from "@agadacz-cognite/react-canvas-draw";
import simplify from "simplify-js";
import styled from "styled-components";
import CogniteFileViewerContext from "../Cognite/FileViewerContext";
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
    setDrawData,
  } = useContext(CogniteFileViewerContext);
  const [loadTimeOffset] = useState(0);
  const [tolerance] = useState(5);
  const [highQuality] = useState(true);
  const [scaledDrawData, setScaledDrawData] = useState(drawData);

  // initial rescaling //

  const getRescaledDrawData = (drawingToScale: string): string => {
    const { scale, originX, originY } = scaleState;
    const drawDataParsed = JSON.parse(drawingToScale);
    const drawDataMapped = {
      ...drawDataParsed,
      lines: drawDataParsed.lines.map((line: any) => {
        return {
          ...line,
          points: line.points.map((point: any) => ({
            x: (point.x + originX) * scale,
            y: (point.y + originY) * scale,
          })),
          brushRadius: line.brushRadius * scale,
        };
      }),
    };
    const scaled = JSON.stringify(drawDataMapped);
    return scaled;
  };

  const getRawDrawData = (drawingToDescale: string): string => {
    const { scale, originX, originY } = scaleState;
    const drawDataParsed = JSON.parse(drawingToDescale);
    const drawDataMapped = {
      ...drawDataParsed,
      lines: drawDataParsed.lines.map((line: any) => {
        return {
          ...line,
          points: simplify(line.points, tolerance, highQuality).map(
            (point: any) => ({
              x: point.x / scale - originX,
              y: point.y / scale - originY,
            })
          ),
          brushRadius: line.brushRadius / scale,
        };
      }),
    };
    const descaled = JSON.stringify(drawDataMapped);
    return descaled;
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
    const rescaled = getRescaledDrawData(drawData);
    setScaledDrawData(rescaled);
  }, [drawData]);

  useEffect(() => {
    onImageMove();
  }, [scaleState.originX, scaleState.originY]);

  useEffect(() => {
    onImageResize();
  }, [scaleState.scale]);

  // useEffect(() => {
  //   console.log(scaleState)
  // }, [scaleState.scale, scaleState.originX, scaleState.originY])

  const onImageMove = () => {
    const { originX, originY, scale } = scaleState;
    const drawDataParsed = JSON.parse(drawData);
    const drawDataMapped = {
      ...drawDataParsed,
      lines: drawDataParsed.lines.map((line: any) => {
        return {
          ...line,
          points: line.points.map((point: any) => ({
            x: point.x + originX * scale,
            y: point.y + originY * scale,
          })),
        };
      }),
    };
    const stringifiedDrawDataMapped = JSON.stringify(drawDataMapped);
    const rescaled = getRescaledDrawData(stringifiedDrawDataMapped);
    setScaledDrawData(rescaled);
  };

  const onImageResize = () => {
    const { scale } = scaleState;
    const drawDataParsed = JSON.parse(drawData);
    const drawDataMapped = {
      ...drawDataParsed,
      lines: drawDataParsed.lines.map((line: any) => {
        return {
          ...line,
          points: line.points.map((point: any) => ({
            x: point.x * scale,
            y: point.y * scale,
          })),
          brushRadius: line.brushRadius / scale,
        };
      }),
    };
    const stringifiedDrawDataMapped = JSON.stringify(drawDataMapped);
    const rescaled = getRescaledDrawData(stringifiedDrawDataMapped);
    setScaledDrawData(rescaled);
  };

  return (
    <Wrapper>
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
export * from "./PaintLayerBar";
