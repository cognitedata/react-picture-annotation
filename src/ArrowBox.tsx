import React from "react";
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

export default class ArrowBox extends React.Component<ArrowBoxProps> {
  public state = {
    dragged: false,
    x: this.props.position.x,
    y: this.props.position.y,
    offsetX: this.props.position.offsetX ?? 0,
    offsetY: this.props.position.offsetY ?? 0,
    baseOffsetX: this.props.arrowPreviewOptions?.baseOffset?.x ?? -20,
    baseOffsetY: this.props.arrowPreviewOptions?.baseOffset?.y ?? -40,
  };

  private onDragStart = (event: React.DragEvent<HTMLDivElement>): void => {
    const img = new Image();
    // this makes image ghost invisible
    event.dataTransfer.setDragImage(img, 0, 0);
    this.setState({
      dragged: true,
      offsetX: this.state.offsetX + event.nativeEvent.offsetX,
      offsetY: this.state.offsetY + event.nativeEvent.offsetY,
    });
  };

  private onDrag = (event: React.DragEvent<HTMLDivElement>): void => {
    if (this.state.dragged) {
      this.setState({
        offsetX: this.state.offsetX + event.nativeEvent.offsetX,
        offsetY: this.state.offsetY + event.nativeEvent.offsetY,
      });
    }
  };

  private onDragEnd = (event: React.DragEvent<HTMLDivElement>): void => {
    this.archerContainerRef?.current?.refreshScreen();
    if (this.state.dragged) {
      const offsetX = this.state.offsetX + event.nativeEvent.offsetX;
      const offsetY = this.state.offsetY + event.nativeEvent.offsetY;
      this.setState({
        dragged: false,
        offsetX,
        offsetY,
      });
      this.props.updateBoxPosition(this.props.annotation.id, offsetX, offsetY);
    }
  };

  private archerContainerRef: React.RefObject<ArcherContainer> = React.createRef();

  render() {
    const { position, renderedArrowWithBox, annotation } = this.props;
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
        ref={this.archerContainerRef}
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
              x: this.state.x,
              y: this.state.y,
              offsetX: this.state.offsetX + this.state.baseOffsetX,
              offsetY: this.state.offsetY + this.state.baseOffsetY,
            }}
            onDragStart={this.onDragStart}
            onDrag={this.onDrag}
            onDragEnd={this.onDragEnd}
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
}
