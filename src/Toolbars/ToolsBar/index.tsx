import React, { useContext } from "react";
import styled from "styled-components";
import { Button, Dropdown, Menu } from "@cognite/cogs.js";
import { FileViewerContext } from "../../context";
import { TextBox } from "../../Cognite/FileViewerUtils";
import PaintLayerBar from "../PaintLayerBar";
import { SearchField } from "./SearchField";

const Wrapper = styled.div`
  display: inline-flex;
  align-items: stretch;
  & > * {
    margin-left: 8px;
  }
`;

type Props = {
  drawable: boolean;
  hideSearch: boolean;
  hideDownload: boolean;
  textboxes: TextBox[];
  isMirrored?: boolean;
};

export default function ToolsBar(props: Props): JSX.Element {
  const {
    drawable,
    hideSearch,
    hideDownload,
    textboxes,
    isMirrored = false,
  } = props;
  const { file, download } = useContext(FileViewerContext);

  return (
    <Wrapper>
      {!isMirrored && drawable && <PaintLayerBar isMirrored={isMirrored} />}
      {!isMirrored && !hideSearch && textboxes.length !== 0 && <SearchField />}
      {download && !hideDownload && (
        <Dropdown
          content={
            <Menu>
              <Menu.Item
                onClick={() =>
                  download!(
                    file ? file.name : "export.pdf",
                    false,
                    false,
                    false
                  )
                }
              >
                Original File
              </Menu.Item>
              <Menu.Item
                onClick={() =>
                  download!(file ? file.name : "export.pdf", false, true, true)
                }
              >
                File with Annotations
              </Menu.Item>
            </Menu>
          }
        >
          <Button icon="Download" aria-label="Download" />
        </Dropdown>
      )}
      {isMirrored && !hideSearch && textboxes.length !== 0 && <SearchField />}
      {isMirrored && drawable && <PaintLayerBar isMirrored={isMirrored} />}
    </Wrapper>
  );
}
