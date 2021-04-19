import styled from "styled-components";
import { Colors } from "@cognite/cogs.js";
import { RGBColor } from "./types";

export const Wrapper = styled.div`
  position: absolute;
  top: 0; // TODO
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Bar = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-between;
  bottom: 16px;
  left: 16px;
  margin: 0;
  padding: 8px 4px;
  width: auto;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: ${Colors["greyscale-grey2"].hex()};
  z-index: 100;
  & > * {
    margin: 0 4px;
  }
`;

export const BrushRadiusGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  & > * {
    margin: 0 4px;
  }
`;

type BrushRadiusProps = {
  radius: number;
  color: string;
};
export const BrushRadius = styled.div`
  width: ${(props: BrushRadiusProps) => props.radius * 2}px;
  height: ${(props: BrushRadiusProps) => props.radius * 2}px;
  border-radius: ${(props: BrushRadiusProps) => props.radius * 2}px;
  background-color: ${(props: BrushRadiusProps) => props.color};
`;

export const ColorSwatch = styled.div`
  padding: 5px;
  background: #fff;
  border-radius: 1px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

export const ColorPickPopover = styled.div`
  position: absolute;
  z-index: 2;
  background-color: white;
`;

export const ColorPickCover = styled.div`
  position: fixed;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
`;

export const ColorPreview = styled.div.attrs(
  (props: { userColor: RGBColor }) => {
    const { r, g, b, a } = props.userColor;
    return {
      style: {
        backgroundColor: `rgba(${r},${g},${b},${a})`,
      },
    };
  }
)<{ userColor: RGBColor }>`
  width: 36px;
  height: 14px;
  border-radius: 2px;
`;
