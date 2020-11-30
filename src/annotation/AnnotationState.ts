export interface IAnnotationState {
  onMouseDown: (
    event:
      | React.MouseEvent<HTMLCanvasElement, MouseEvent>
      | React.TouchEvent<HTMLCanvasElement>,
    positionX: number,
    positionY: number
  ) => void;
  onMouseMove: (positionX: number, positionY: number) => void;
  onMouseLeave: () => void;
  onMouseUp: () => void;
}
