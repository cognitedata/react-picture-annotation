import React from "react";
import styled from "styled-components/macro";
import SplitterLayout, { SplitterLayoutProps } from "react-splitter-layout";

interface SplitterProps extends SplitterLayoutProps {
  children: React.ReactNode;
  height?: any;
}
export function Splitter(props: SplitterProps) {
  const { children, height } = props;

  return (
    <SplitterWrapper height={height}>
      <SplitterLayout {...props}>{children}</SplitterLayout>
    </SplitterWrapper>
  );
}

const SplitterWrapper = styled.div<{ height: any }>`
  .splitter-layout {
    position: absolute;
    display: flex;
    flex-direction: row;
    width: 100%;
    height: ${(props) => props.height ?? "100%"};
    overflow: hidden;
  }
  .splitter-layout .layout-pane {
    position: relative;
    flex: 0 0 auto;
    overflow: auto;
  }
  .splitter-layout .layout-pane.layout-pane-primary {
    flex: 1 1 auto;
  }
  .splitter-layout > .layout-splitter {
    flex: 0 0 auto;
    width: 4px;
    height: 100%;
    cursor: col-resize;
    background-color: #ccc;
  }
  .splitter-layout .layout-splitter:hover {
    background-color: #bbb;
  }
  .splitter-layout.layout-changing {
    cursor: col-resize;
  }
  .splitter-layout.layout-changing > .layout-splitter {
    background-color: #aaa;
  }
  .splitter-layout.splitter-layout-vertical {
    flex-direction: column;
  }
  .splitter-layout.splitter-layout-vertical.layout-changing {
    cursor: row-resize;
  }
  .splitter-layout.splitter-layout-vertical > .layout-splitter {
    width: 100%;
    height: 4px;
    cursor: row-resize;
  }
`;
