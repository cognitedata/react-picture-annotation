import styled from "styled-components";
import { Colors, Pagination } from "@cognite/cogs.js";

export const DocumentPagination = styled(Pagination)`
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  bottom: 16px;
  && {
    background: #fff;
    border-radius: 50px;
    padding: 12px 24px;
    box-shadow: 0px 0px 8px ${Colors["greyscale-grey3"].hex()};
  }
`;
