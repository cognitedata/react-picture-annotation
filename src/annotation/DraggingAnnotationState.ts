import { ReactPictureAnnotation } from "index";
import { IAnnotationState } from "./AnnotationState";
import { DefaultAnnotationState } from "./DefaultAnnotationState";

export default class DraggingAnnotationState implements IAnnotationState {
  private hasMoved: boolean;
  private context: ReactPictureAnnotation;
  constructor(context: ReactPictureAnnotation) {
    this.context = context;
    this.hasMoved = false;
  }
  public onMouseDown = () => undefined;
  public onMouseMove = (positionX: number, positionY: number) => {
    const { shapes, selectedIds } = this.context;
    const currentShape = shapes.find(
      // TODO fix this to not default to first one :thinking
      (el) => el.getAnnotationData().id === selectedIds[0]
    );
    this.hasMoved = true;
    currentShape!.onDrag(positionX, positionY);
  };

  public onMouseUp = () => {
    const {
      shapes,
      setAnnotationState,
      selectedIds,
      props: { onAnnotationUpdate },
    } = this.context;
    setAnnotationState(new DefaultAnnotationState(this.context));
    if (onAnnotationUpdate && this.hasMoved) {
      const currentShape = shapes.find(
        // TODO fix this to not default to first one :thinking
        (el) => el.getAnnotationData().id === selectedIds[0]
      );
      onAnnotationUpdate(currentShape!.getAnnotationData());
    }
  };

  public onMouseLeave = () => this.onMouseUp();
}
