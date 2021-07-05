import styled from "styled-components";
import { Colors } from "@cognite/cogs.js";
import { RGBColor } from "../utils/RGB";

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
  width: 24px;
  height: 24px;
  border-radius: 2px;
  cursor: pointer;
`;

export const WrappingBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: ${Colors["greyscale-grey1"].hex()};
  z-index: 100;
  font-size: 10px;
`;

type BarSectionType = {
  hasMargin?: boolean;
  noBorder?: boolean;
};
export const BarSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: ${({ hasMargin }: BarSectionType) => (hasMargin ? "0 4px" : "0")};
  border-left: ${({ noBorder }: BarSectionType) =>
    noBorder ? "0" : `1px solid ${Colors["greyscale-grey4"].hex()}`};

  & > * {
    box-sizing: border-box;
    margin: ${({ hasMargin }: BarSectionType) => (hasMargin ? "0 4px" : "0")};
  }
`;
