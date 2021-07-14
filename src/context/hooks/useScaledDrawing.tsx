import { useState } from "react";
import simplify from "simplify-js";
import { IStageState } from "../../ReactPictureAnnotation";

export const useScaledDrawing = (scaleState: IStageState) => {
  const [tolerance] = useState(5);
  const [highQuality] = useState(true);

  /**
   * Returns drawing scaled to current scale.
   */
  const getScaledDrawData = (drawingToScale: string): string => {
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

  /**
   * Returns drawing in its raw state - aka converted to scale 1,
   * or to percentage of canvas.
   */
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
    const raw = JSON.stringify(drawDataMapped);
    return raw;
  };

  return {
    getScaledDrawData,
    getRawDrawData,
  };
};
