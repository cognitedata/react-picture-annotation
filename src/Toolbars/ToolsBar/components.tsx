import styled from "styled-components";

export const Wrapper = styled.div`
  display: inline-flex;
  position: absolute;
  z-index: 100;
  right: 24px;
  top: 24px;
  align-items: stretch;

  && > * {
    margin-left: 8px;
  }
`;
