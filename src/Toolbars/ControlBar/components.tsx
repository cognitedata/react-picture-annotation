import styled from "styled-components";

export const Wrapper = styled.div`
  display: inline-flex;
  position: absolute;
  z-index: 100;
  right: 24px;
  bottom: 24px;
  & > * {
    border-radius: 0px;
  }
  & > *:nth-child(1) {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  & > *:nth-last-child(1) {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;
