import { useState } from "react";
import simplify from "simplify-js";
import { IStageState } from "../../ReactPictureAnnotation";

export const useScaledDrawing = (scaleState: IStageState) => {
  const [tolerance] = useState(5);
  const [highQuality] = useState(true);

  const getRescaledDrawData = (drawingToScale: string): string => {
    const { scale, originX, originY } = scaleState;
    const drawDataParsed = JSON.parse(drawingToScale);
    const drawDataMapped = {
      ...drawDataParsed,
      lines: drawDataParsed.lines.map((line: any) => {
        return {
          ...line,
          points: line.points.map((point: any) => ({
            x: scale / point.x + originX,
            y: scale / point.y + originY,
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
              x: scale / (point.x - originX),
              y: scale / (point.y - originY),
            })
          ),
          brushRadius: line.brushRadius / scale,
        };
      }),
    };
    const descaled = JSON.stringify(drawDataMapped);
    return descaled;
  };

  return {
    getRescaledDrawData,
    getRawDrawData,
  };
};
