import React from "react";
import styled from "styled-components";
import { ToolbarPosition } from "./types";

export const ControlBarDefaultPosition = styled.div`
  position: absolute;
  z-index: 100;
  right: 24px;
  bottom: 24px;
`;

export const ToolsBarDefaultPosition = styled.div`
  position: absolute;
  z-index: 100;
  right: 24px;
  top: 24px;
`;

export const CustomPosition = styled.div.attrs(
  ({ position }: { position: ToolbarPosition }) => {
    const style: React.CSSProperties = {};
    if (position === "topLeft") {
      style.top = "24px";
      style.left = "24px";
    }
    if (position === "topRight") {
      style.top = "24px";
      style.right = "24px";
    }
    if (position === "bottomLeft") {
      style.bottom = "24px";
      style.left = "24px";
    }
    if (position === "bottomRight") {
      style.bottom = "24px";
      style.right = "24px";
    }
    return { style };
  }
)<{ position: ToolbarPosition }>`
  display: flex;
  flex-direction: row;
  position: absolute;
  z-index: 100;
  & > * {
    margin: 0 4px;
  }
`;
