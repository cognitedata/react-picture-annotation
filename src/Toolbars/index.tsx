import React from "react";
import { TextBox } from "../Cognite/FileViewerUtils";
import ControlBar from "./ControlBar";
import ToolsBar from "./ToolsBar";

type Props = {
  toolbarPosition: any;
  hideControls: boolean;
  hideDownload: boolean;
  hideSearch: boolean;
  drawable: boolean;
  textboxes: TextBox[];
};

export const Toolbars = (props: Props) => {
  const {
    toolbarPosition,
    hideControls,
    hideDownload,
    hideSearch,
    drawable,
    textboxes,
  } = props;

  return (
    <>
      <ControlBar hideControls={hideControls} />
      <ToolsBar
        drawable={drawable}
        hideDownload={hideDownload}
        hideSearch={hideSearch}
        textboxes={textboxes}
      />
      <div>{toolbarPosition ?? "todo"}</div>
    </>
  );
};

export * from "./Pagination";
