import React, { useContext } from "react";
import { Button, Dropdown, Menu } from "@cognite/cogs.js";
import CogniteFileViewerContext from "../../Cognite/FileViewerContext";
import { TextBox } from "../../Cognite/FileViewerUtils";
import PaintLayerBar from "../PaintLayerBar";
import { SearchField } from "./SearchField";
import { Wrapper } from "./components";

type Props = {
  drawable: boolean;
  hideSearch: boolean;
  hideDownload: boolean;
  textboxes: TextBox[];
};

export default function ToolsBar(props: Props): JSX.Element {
  const { drawable, hideSearch, hideDownload, textboxes } = props;
  const { file, download } = useContext(CogniteFileViewerContext);

  return (
    <Wrapper>
      {drawable && <PaintLayerBar />}
      {!hideSearch && textboxes.length !== 0 && <SearchField />}
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
    </Wrapper>
  );
}
