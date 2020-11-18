import { ReactPictureAnnotation } from "../ReactPictureAnnotation";
import { RectShape } from "../Shape";
import Transformer from "../Transformer";
import randomId from "../utils/randomId";
import { IAnnotationState } from "./AnnotationState";
import CreatingAnnotationState from "./CreatingAnnotationState";
import DraggingAnnotationState from "./DraggingAnnotationState";
import TransformationState from "./TransfromationState";

export class DefaultAnnotationState implements IAnnotationState {
  private context: ReactPictureAnnotation;
  private hasMoved = false;
  private hasClicked = false;
  private hasSelected = false;

  constructor(context: ReactPictureAnnotation) {
    this.context = context;
    this.hasMoved = false;
    this.hasSelected = false;
    this.hasClicked = false;
  }
  public onMouseMove = (positionX: number, positionY: number) => {
    if (this.hasClicked) {
      this.hasMoved = true;
    }
    if (this.context.props.hoverable) {
      this.checkSelectedId(positionX, positionY);
    }
    this.checkCursor(positionX, positionY);
  };
  public onMouseUp = () => {
    if (!this.hasMoved && !this.hasSelected && this.hasClicked) {
      this.context.selectedId = null;
    }
    this.context.onShapeChange();
    this.hasMoved = false;
    this.hasClicked = false;
    this.hasSelected = false;
  };

  public onMouseLeave = () => {
    this.hasClicked = false;
    this.hasMoved = false;
    this.hasSelected = false;
  };

  public onMouseDown = (positionX: number, positionY: number) => {
    this.hasClicked = true;
    const {
      shapes,
      currentTransformer,
      onShapeChange,
      setAnnotationState: setState,
      props: { editable, creatable },
    } = this.context;

    if (
      currentTransformer &&
      currentTransformer.checkBoundary(positionX, positionY)
    ) {
      currentTransformer.startTransformation(positionX, positionY);
      setState(new TransformationState(this.context));
      return;
    }

    for (let i = shapes.length - 1; i >= 0; i--) {
      if (
        shapes[i].checkBoundary(
          positionX,
          positionY,
          this.context.calculateShapePositionNoOffset
        ) &&
        !shapes[i].getAnnotationData().disableClick
      ) {
        if (this.context.selectedId !== shapes[i].getAnnotationData().id) {
          this.hasSelected = true;
        }
        this.context.selectedId = shapes[i].getAnnotationData().id;
        const [selectedShape] = shapes.splice(i, 1);
        shapes.push(selectedShape);
        onShapeChange();
        if (editable) {
          this.context.currentTransformer = new Transformer(
            shapes[i],
            editable,
            this.context.getOriginalImageSize,
            this.context.calculateShapePositionNoOffset
          );
          selectedShape.onDragStart(positionX, positionY);
          setState(new DraggingAnnotationState(this.context));
        }
        return;
      }
    }
    if (editable || creatable) {
      const newShapeId = randomId();
      this.context.shapes.push(
        new RectShape(
          {
            id: newShapeId,
            mark: {
              x: positionX,
              y: positionY,
              width: 0,
              height: 0,
              type: "RECT",
            },
            page: this.context.props.page || 1,
          },
          onShapeChange,
          this.context.getOriginalImageSize
        )
      );

      this.context.pendingShapeId = newShapeId;

      setState(new CreatingAnnotationState(this.context));
    }
  };

  private checkSelectedId = (positionX: number, positionY: number) => {
    const { shapes, onShapeChange } = this.context;
    for (let i = shapes.length - 1; i >= 0; i--) {
      if (
        shapes[i].checkBoundary(
          positionX,
          positionY,
          this.context.calculateShapePositionNoOffset,
          (shapes[i].getAnnotationData().mark.strokeWidth || 4) + 10
        )
      ) {
        const { id, disableClick } = shapes[i].getAnnotationData();
        if (this.context.selectedId !== id && !disableClick) {
          this.context.selectedId = id;
          onShapeChange();
        }
        return;
      }
    }
    if (this.context.selectedId) {
      this.context.selectedId = null;
      onShapeChange();
    }
  };
  private checkCursor = (positionX: number, positionY: number) => {
    const {
      shapes,
      props: { creatable, editable },
    } = this.context;
    for (let i = shapes.length - 1; i >= 0; i--) {
      if (
        shapes[i].checkBoundary(
          positionX,
          positionY,
          this.context.calculateShapePositionNoOffset,
          (shapes[i].getAnnotationData().mark.strokeWidth || 4) + 10
        )
      ) {
        const { disableClick } = shapes[i].getAnnotationData();
        if (!disableClick) {
          if (this.context.canvasRef.current) {
            this.context.canvasRef.current.style.cursor = "pointer";
          }
        }
        return;
      }
    }
    if (creatable || editable) {
      if (this.context.canvasRef.current) {
        this.context.canvasRef.current.style.cursor = "crosshair";
      }
      return;
    }
    if (this.context.canvasRef.current) {
      this.context.canvasRef.current.style.cursor = "default";
    }
  };
}
