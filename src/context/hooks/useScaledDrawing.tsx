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
    let scaleToUse = scale;
    // const scaleToUse = 0.3343934575193094;

    const drawDataParsed = JSON.parse(drawingToScale);

    const canvasWidth = 736;
    scaleToUse = canvasWidth / +drawDataParsed.width.replace("px", "");

    const drawDataMapped = {
      ...drawDataParsed,
      lines: drawDataParsed.lines.map((line: any) => {
        return {
          ...line,
          points: line.points.map((point: any) => ({
            x: scaleToUse / point.x + originX,
            y: scaleToUse / point.y + originY,
          })),
          brushRadius: line.brushRadius * scaleToUse,
        };
      }),
    };
    // console.log(drawDataParsed);
    // console.log(drawDataMapped);
    drawDataMapped.width = "100%";
    drawDataMapped.height = "100%";
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
