import React, { useContext } from "react";
import { Button } from "@cognite/cogs.js";
import CogniteFileViewerContext from "../../Cognite/FileViewerContext";
import { Wrapper } from "./components";

type Props = {
  hideControls: boolean;
};

export default function ControlBar(props: Props): JSX.Element {
  const { hideControls } = props;
  const { zoomIn, zoomOut, reset } = useContext(CogniteFileViewerContext);

  const onZoomIn = () => zoomIn && zoomIn();
  const onZoomOut = () => zoomOut && zoomOut();
  const onZoomReset = () => reset && reset();

  if (hideControls) return <></>;
  return (
    <Wrapper>
      <Button aria-label="Zoom in" onClick={onZoomIn} icon="ZoomIn" />
      <Button aria-label="Refresh" icon="Refresh" onClick={onZoomReset} />
      <Button aria-label="Zoom out" icon="ZoomOut" onClick={onZoomOut} />
    </Wrapper>
  );
}
