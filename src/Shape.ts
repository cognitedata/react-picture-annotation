import { IAnnotation } from "./Annotation";

export const shapeStyle = {
  padding: 5,
  margin: 10,
  fontSize: 12,
  fontColor: "#212529",
  fontBackground: "#f8f9fa",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', Helvetica, Arial, sans-serif",
  shapeBackground: "hsla(210, 16%, 93%, 0.2)",
  shapeStrokeStyle: "ff0000",
  shapeShadowStyle: "hsla(210, 9%, 31%, 0.35)",
};

export interface IShapeBase {
  x: number;
  y: number;
  width: number;
  height: number;
  shadowColor?: string;
  backgroundColor?: string;
  strokeWidth?: number;
  strokeColor?: string;
  draw?: (
    canvas2D: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    scale: number
  ) => void;
}

export interface IShapeAdjustBase extends Partial<IShapeBase> {}

export interface IShapeData extends IShapeBase {
  type: string;
}

export interface IRectShapeData extends IShapeData {
  type: "RECT";
}

export interface IShape {
  onDragStart: (positionX: number, positionY: number) => void;
  onDrag: (positionX: number, positionY: number) => void;
  checkBoundary: (
    positionX: number,
    positionY: number,
    calculateTruePositionNoTransform: (shapeData: IShapeBase) => IShapeBase,
    padding?: number
  ) => boolean;
  paint: (
    canvas2D: CanvasRenderingContext2D,
    calculateTruePosition: (shapeData: IShapeBase) => IShapeBase,
    selected: boolean,
    drawLabel: boolean,
    scale: number
  ) => IShapeBase;
  getAnnotationData: () => IAnnotation;
  adjustMark: (adjustBase: IShapeAdjustBase) => void;
  setComment: (comment: string) => void;
  equal: (data: IAnnotation) => boolean;
}

export class RectShape implements IShape {
  private annotationData: IAnnotation<IShapeData>;

  private onChangeCallBack: () => void;

  private getImageSize: () => { width: number; height: number };

  private dragStartOffset: { offsetX: number; offsetY: number };

  constructor(
    data: IAnnotation<IShapeData>,
    onChange: () => void,
    getImageSize: () => { width: number; height: number }
  ) {
    this.annotationData = data;
    this.onChangeCallBack = onChange;
    this.getImageSize = getImageSize;
  }

  public onDragStart = (positionX: number, positionY: number) => {
    const { x, y, width, height } = this.annotationData.mark;
    if (width < 1 && height < 1) {
      const imageSize = this.getImageSize();
      this.dragStartOffset = {
        offsetX: positionX / imageSize.width - x,
        offsetY: positionY / imageSize.height - y,
      };
    } else {
      this.dragStartOffset = {
        offsetX: positionX - x,
        offsetY: positionY - y,
      };
    }
  };

  public onDrag = (positionX: number, positionY: number) => {
    if (this.dragStartOffset) {
      const { width, height } = this.annotationData.mark;
      if (width < 1 && height < 1) {
        const imageSize = this.getImageSize();
        this.annotationData.mark.x =
          positionX / imageSize.width - this.dragStartOffset.offsetX;
        this.annotationData.mark.y =
          positionY / imageSize.height - this.dragStartOffset.offsetY;
      } else {
        this.annotationData.mark.x = positionX - this.dragStartOffset.offsetX;
        this.annotationData.mark.y = positionY - this.dragStartOffset.offsetY;
      }
      this.onChangeCallBack();
    }
  };

  public checkBoundary = (
    positionX: number,
    positionY: number,
    calculateTruePosition: (shapeData: IShapeBase) => IShapeBase,
    padding = 0
  ) => {
    const { x, y, width, height } = calculateTruePosition(
      this.annotationData.mark
    );

    if (
      ((positionX > x - padding && positionX < x + width + padding) ||
        (positionX < x + padding && positionX > x + width - padding)) &&
      ((positionY > y - padding && positionY < y + height + padding) ||
        (positionY < y + padding && positionY > y + height - padding))
    ) {
      return true;
    }
    return false;
  };

  public paint = (
    canvas2D: CanvasRenderingContext2D,
    calculateTruePosition: (shapeData: IShapeBase) => IShapeBase,
    selected: boolean,
    drawLabel: boolean,
    scale: number
  ) => {
    const { mark } = this.annotationData;
    const { x, y, width, height } = calculateTruePosition(mark);
    canvas2D.save();
    if (this.annotationData.mark.draw) {
      this.annotationData.mark.draw(canvas2D, x, y, width, height, scale);
    } else {
      canvas2D.shadowBlur = 10;
      canvas2D.shadowColor = mark.shadowColor || shapeStyle.shapeShadowStyle;
      canvas2D.strokeStyle = mark.strokeColor || shapeStyle.shapeStrokeStyle;
      canvas2D.lineWidth = mark.strokeWidth || 4;
      canvas2D.strokeRect(
        x - canvas2D.lineWidth / 2,
        y - canvas2D.lineWidth / 2,
        width + canvas2D.lineWidth,
        height + canvas2D.lineWidth
      );
      if (selected) {
        canvas2D.fillStyle = mark.backgroundColor || shapeStyle.shapeBackground;
        canvas2D.fillRect(
          x - canvas2D.lineWidth / 2,
          y - canvas2D.lineWidth / 2,
          width + canvas2D.lineWidth,
          height + canvas2D.lineWidth
        );
      } else {
        const { comment } = this.annotationData;
        if (comment && drawLabel) {
          canvas2D.font = `${shapeStyle.fontSize}px ${shapeStyle.fontFamily}`;
          const metrics = canvas2D.measureText(comment);
          canvas2D.fillStyle = shapeStyle.fontBackground;
          canvas2D.fillRect(
            x,
            y,
            metrics.width + shapeStyle.padding * 2,
            shapeStyle.fontSize + shapeStyle.padding * 2
          );
          canvas2D.textBaseline = "top";
          canvas2D.fillStyle = shapeStyle.fontColor;
          canvas2D.fillText(
            comment,
            x + shapeStyle.padding,
            y + shapeStyle.padding
          );
        }
      }
    }
    canvas2D.restore();

    return { x, y, width, height };
  };

  public adjustMark = ({
    x = this.annotationData.mark.x,
    y = this.annotationData.mark.y,
    width = this.annotationData.mark.width,
    height = this.annotationData.mark.height,
  }: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }) => {
    if (width > 0 && height > 0) {
      this.annotationData.mark.x = x;
      this.annotationData.mark.y = y;
      this.annotationData.mark.width = width;
      this.annotationData.mark.height = height;
      this.onChangeCallBack();
    }
  };

  public getAnnotationData = () => {
    return this.annotationData;
  };

  public setComment = (comment: string) => {
    this.annotationData.comment = comment;
  };

  public equal = (data: IAnnotation) => {
    return (
      data.id === this.annotationData.id &&
      data.comment === this.annotationData.comment &&
      data.mark.x === this.annotationData.mark.x &&
      data.mark.y === this.annotationData.mark.y &&
      data.mark.width === this.annotationData.mark.width &&
      data.mark.height === this.annotationData.mark.height
    );
  };
}
