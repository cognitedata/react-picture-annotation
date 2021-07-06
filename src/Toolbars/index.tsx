import React from "react";
import { TextBox } from "../Cognite/FileViewerUtils";
import ControlBar from "./ControlBar";
import ToolsBar from "./ToolsBar";
import { ToolbarPosition } from "./types";
import {
  ToolsBarDefaultPosition,
  ControlBarDefaultPosition,
  CustomPosition,
} from "./components";

type Props = {
  toolbarPosition: ToolbarPosition;
  hideControls: boolean;
  hideDownload: boolean;
  hideSearch: boolean;
  drawable: boolean;
  textboxes: TextBox[];
};

export const Toolbars = (props: Props): JSX.Element => {
  const {
    toolbarPosition,
    hideControls,
    hideDownload,
    hideSearch,
    drawable,
    textboxes,
  } = props;

  const isMirrored =
    toolbarPosition === "topLeft" || toolbarPosition === "bottomLeft";

  if (!toolbarPosition || toolbarPosition === "default") {
    return (
      <>
        <ToolsBarDefaultPosition>
          <ToolsBar
            drawable={drawable}
            hideDownload={hideDownload}
            hideSearch={hideSearch}
            textboxes={textboxes}
          />
        </ToolsBarDefaultPosition>
        <ControlBarDefaultPosition>
          <ControlBar hideControls={hideControls} />
        </ControlBarDefaultPosition>
      </>
    );
  } else {
    return (
      <CustomPosition position={toolbarPosition}>
        {isMirrored && <ControlBar hideControls={hideControls} />}
        <ToolsBar
          drawable={drawable}
          hideDownload={hideDownload}
          hideSearch={hideSearch}
          textboxes={textboxes}
          isMirrored={isMirrored}
        />
        {!isMirrored && <ControlBar hideControls={hideControls} />}
      </CustomPosition>
    );
  }
};

export * from "./Pagination";
export * from "./types";
