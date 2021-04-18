import styled from "styled-components";
import { Colors } from "@cognite/cogs.js";
import { RGBColor } from "./types";

export const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Bar = styled.div`
  display: flex;
  width: auto;
  height: 64px;
  border-radius: 4px;
  background-color: ${Colors["greyscale-grey1"].hex()};
  padding: 4px;
  margin: 0;
`;

export const ColorSwatch = styled.div`
  padding: 5px;
  background: #fff;
  border-radius: 1px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  display: inline-block;
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
