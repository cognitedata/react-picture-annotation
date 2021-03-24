import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { ArcherContainer, ArcherElement } from "react-archer";
import { ArrowPreviewOptions } from "./Cognite/FileViewerUtils";

interface PointProps {
  position: any;
}
interface ArrowBoxEvents {
  onDragStart: React.DragEvent;
  onDrag: React.DragEvent;
  onDragEnd: React.DragEvent;
}
interface ArrowBoxProps extends PointProps, ArrowBoxEvents {
  annotation: any;
  renderedArrowWithBox: any;
  updateBoxPosition: any;
  arrowPreviewOptions?: ArrowPreviewOptions;
}

const SourcePoint = styled.div.attrs((props: PointProps) => ({
  style: {
    left: `${props.position.x}px`,
    top: `${props.position.y}px`,
    transform: `translate(${props.position.offsetX}px, ${props.position.offsetY}px)`,
  },
}))<PointProps>`
  position: absolute;
  pointer-events: auto;
  cursor: grab;
`;
const TargetPoint = styled.div.attrs((props: PointProps) => ({
  style: {
    left: `${props.position.x}px`,
    top: `${props.position.y}px`,
  },
}))<PointProps>`
  position: absolute;
`;
// TODO this might need to be changed
const Dummy = styled.div`
  width: 1px;
  height: 1px;
`;
// TODO remove !important
const StyledArcherContainer = styled(ArcherContainer)`
  width: 100%;
  height: 100%;
  pointer-events: none;
  position: absolute !important;
`;

export default function ArrowBox(props: ArrowBoxProps): JSX.Element {
  const {
    annotation,
    position,
    renderedArrowWithBox,
    updateBoxPosition,
    arrowPreviewOptions,
  } = props;

  const archerContainerRef: React.RefObject<ArcherContainer> = React.createRef();

  const x = position?.x ?? 0;
  const y = position?.y ?? 0;
  const defaultBaseOffset = {
    x: -40,
    y: -40,
  };

  const [dragged, setDragged] = useState<boolean>(false);
  const [baseOffsetX, setBaseOffsetX] = useState(0);
  const [baseOffsetY, setBaseOffsetY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dragStartPoint, setDragStartPoint] = useState({ x: 0, y: 0 });

  const init = (): void => {
    const baseX = arrowPreviewOptions?.baseOffset?.x;
    const baseY = arrowPreviewOptions?.baseOffset?.y;
    const customX = arrowPreviewOptions?.customOffset?.[annotation.id]?.x;
    const customY = arrowPreviewOptions?.customOffset?.[annotation.id]?.y;
    const finalBaseOffsetX = customX ?? baseX ?? defaultBaseOffset.x;
    const finalBaseOffsetY = customY ?? baseY ?? defaultBaseOffset.y;
    setBaseOffsetX(finalBaseOffsetX);
    setBaseOffsetY(finalBaseOffsetY);
    setOffsetX(position?.offsetX ?? 0);
    setOffsetY(position?.offsetY ?? 0);
  };

  const onDragStart = (event: React.DragEvent<HTMLDivElement>): void => {
    const img = new Image();
    event.dataTransfer.setDragImage(img, 0, 0); // this makes image ghost invisible
    setDragged(true);
    setDragStartPoint({
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
    });
  };

  const onDrag = (event: React.DragEvent<HTMLDivElement>): void => {
    if (dragged) {
      const dragCurrentPoint = {
        x: event.nativeEvent.offsetX,
        y: event.nativeEvent.offsetY,
      };
      const newOffsetX = offsetX + (dragCurrentPoint.x - dragStartPoint.x);
      const newOffsetY = offsetY + (dragCurrentPoint.y - dragStartPoint.y);
      setOffsetX(newOffsetX);
      setOffsetY(newOffsetY);
    }
  };

  const onDragEnd = (event: React.DragEvent<HTMLDivElement>): void => {
    archerContainerRef?.current?.refreshScreen();
    if (dragged) {
      const dragEndPoint = {
        x: event.nativeEvent.offsetX,
        y: event.nativeEvent.offsetY,
      };
      const newOffsetX = offsetX + (dragEndPoint.x - dragStartPoint.x);
      const newOffsetY = offsetY + (dragEndPoint.y - dragStartPoint.y);
      setDragged(false);
      setOffsetX(newOffsetX);
      setOffsetY(newOffsetY);
      updateBoxPosition(annotation.id, newOffsetX, newOffsetY);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const arrowStyle = {
    endShape: {
      circle: {
        radius: 1,
        fillColor: "black",
        strokeColor: "black",
        strokeWidth: 0,
      },
    },
  };

  return (
    <StyledArcherContainer
      strokeColor="black"
      strokeWidth={1}
      ref={archerContainerRef}
    >
      <ArcherElement
        id={`${annotation.id}-source`}
        relations={[
          {
            targetId: `${annotation.id}-target`,
            targetAnchor: "top",
            sourceAnchor: "bottom",
            style: arrowStyle,
          },
        ]}
      >
        <SourcePoint
          draggable={true}
          position={{
            x,
            y,
            offsetX: offsetX + baseOffsetX,
            offsetY: offsetY + baseOffsetY,
          }}
          onDragStart={onDragStart}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
        >
          {renderedArrowWithBox}
        </SourcePoint>
      </ArcherElement>
      <ArcherElement id={`${annotation.id}-target`}>
        <TargetPoint position={position}>
          <Dummy />
        </TargetPoint>
      </ArcherElement>
    </StyledArcherContainer>
  );
}
