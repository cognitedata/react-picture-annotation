import { ReactPictureAnnotation } from "index";
import { IAnnotationState } from "./AnnotationState";
import { DefaultAnnotationState } from "./DefaultAnnotationState";

export default class CreatingAnnotationState implements IAnnotationState {
  private context: ReactPictureAnnotation;
  constructor(context: ReactPictureAnnotation) {
    this.context = context;
  }
  public onMouseDown = () => undefined;
  public onMouseMove = (positionX: number, positionY: number) => {
    const { shapes, onShapeChange } = this.context;
    if (shapes.length > 0) {
      const currentShape = shapes.find(
        (el) => el.getAnnotationData().id === this.context.pendingShapeId
      );
      if (currentShape) {
        const {
          mark: { x, y },
        } = currentShape.getAnnotationData();
        currentShape.adjustMark({
          width: positionX - x,
          height: positionY - y,
        });
      }
    }
    onShapeChange();
  };

  public onMouseUp = () => {
    const {
      shapes,
      onShapeChange,
      setAnnotationState,
      onDelete,
      getOriginalImageSize,
      props: { onAnnotationCreate, usePercentage },
    } = this.context;
    const data = shapes.find(
      (el) => el.getAnnotationData().id === this.context.pendingShapeId
    );
    if (data) {
      if (
        data &&
        data.getAnnotationData().mark.width !== 0 &&
        data.getAnnotationData().mark.height !== 0
      ) {
        // make sure width, height are positive numbers
        let { x, y, width, height } = data.getAnnotationData().mark;
        if (usePercentage) {
          const origSize = getOriginalImageSize();
          x = x / origSize.width;
          y = y / origSize.height;
          width = width / origSize.width;
          height = height / origSize.height;
        }
        data.getAnnotationData().mark.x = x + Math.min(0, width);
        data.getAnnotationData().mark.y = y + Math.min(0, height);
        data.getAnnotationData().mark.width = Math.abs(width);
        data.getAnnotationData().mark.height = Math.abs(height);

        this.context.selectedIds = [data.getAnnotationData().id];
        if (onAnnotationCreate) {
          onAnnotationCreate(data.getAnnotationData());
        }
      } else {
        if (this.context.pendingShapeId) {
          onDelete(this.context.pendingShapeId);
        }
        this.context.selectedIds = [];
      }
    } else {
      this.context.pendingShapeId = null;
      this.context.selectedIds = [];
    }
    setAnnotationState(new DefaultAnnotationState(this.context));
    onShapeChange();
  };

  public onMouseLeave = () => this.onMouseUp();
}
