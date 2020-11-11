import React, { useEffect, useState, useMemo } from "react";
import { action } from "@storybook/addon-actions";
import { boolean, select } from "@storybook/addon-knobs";
import { CogniteFileViewer, ViewerEditCallbacks } from "../src";
import {
  imgSdk,
  imgFile,
  imgSdkTwoAnnotations,
  pdfFile,
  pdfSdk,
} from "./utils";
import {
  listAnnotationsForFile,
  CogniteAnnotation,
} from "@cognite/annotations";
import { CustomizableCogniteAnnotation } from "./Cognite/FileViewerUtils";
import { Button } from "@cognite/cogs.js";
import {
  useSelectedAnnotation,
  useExtractFromCanvas,
} from "../src/Cognite/FileViewerContext";
import {
  useDownloadPDF,
  useZoomControls,
} from "../src/Cognite/FileViewerContext";
import styled from "styled-components"; // TODO move into separate file

export const AllowCustomization = () => {
  const [annotations, setAnnotations] = useState<CogniteAnnotation[]>([]);
  useEffect(() => {
    (async () => {
      const annotationsFromCdf = await listAnnotationsForFile(pdfSdk, pdfFile);
      setAnnotations(
        annotationsFromCdf.concat([
          {
            id: 123,
            label: "David",
            createdTime: new Date(),
            lastUpdatedTime: new Date(),
            type: "tmp_annotation",
            status: "unhandled",
            box: { xMin: 0.1, xMax: 0.2, yMin: 0.1, yMax: 0.2 },
            version: 5,
            page: 1,
            source: "tmp",
          },
        ])
      );
    })();
  }, []);
  return (
    <CogniteFileViewer
      sdk={pdfSdk}
      file={pdfFile}
      disableAutoFetch={true}
      annotations={annotations}
    />
  );
};

let id = 0;

export const AllowControlledEditing = () => {
  const [annotations, setAnnotations] = useState<CogniteAnnotation[]>([]);
  useEffect(() => {
    (async () => {
      setAnnotations(await listAnnotationsForFile(pdfSdk, pdfFile));
    })();
  }, []);

  const callbacks: ViewerEditCallbacks = useMemo(
    () => ({
      onCreate: (annotation) => {
        // decide if changes should complete
        id += 1;
        setAnnotations(
          annotations.concat([
            {
              ...annotation,
              id,
              createdTime: new Date(),
              lastUpdatedTime: new Date(),
            } as CogniteAnnotation,
          ])
        );
        return false;
      },
      onUpdate: (annotation) => {
        // decide if changes should complete
        setAnnotations(
          annotations
            .filter((el) => `${el.id}` !== `${annotation.id}`)
            .concat([annotation as CogniteAnnotation])
        );
        return false;
      },
    }),
    [annotations, setAnnotations]
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    "406167784064508"
  );

  const handleAnnotationSelection = (annotation: CogniteAnnotation) => {
    if (annotation) {
      setSelectedId(`${annotation.id}`);
    }
  };

  return (
    <CogniteFileViewer
      sdk={imgSdk}
      file={imgFile}
      disableAutoFetch={true}
      annotations={annotations}
      editable={true}
      editCallbacks={callbacks}
      selectedId={selectedId}
      onAnnotationSelected={handleAnnotationSelection}
      renderItemPreview={(anno) => (
        <>
          <span>{anno.comment}</span>
          <Button
            icon="Delete"
            onClick={() =>
              setAnnotations(
                annotations.filter((el) => `${el.id}` !== `${anno.id}`)
              )
            }
          />
        </>
      )}
    />
  );
};

export const SplitContextAndViewer = () => {
  const AnotherComponent = () => {
    // This component now has access to all of the utilities and props of the viewer!
    const download = useDownloadPDF();
    const { zoomIn, zoomOut, reset } = useZoomControls();
    const extract = useExtractFromCanvas();
    const {
      selectedAnnotation,
      setSelectedAnnotation,
    } = useSelectedAnnotation();

    return (
      <div style={{ width: 200, background: "white" }}>
        <Button onClick={() => download!("testing.pdf")}>Download</Button>
        <Button onClick={() => zoomIn!()}>Zoom In</Button>
        <Button onClick={() => zoomOut!()}>Zoom Out</Button>
        <Button onClick={() => reset!()}>Reset</Button>

        {selectedAnnotation && (
          <Button onClick={() => setSelectedAnnotation(undefined)}>
            Unselect Annotation
          </Button>
        )}
        {selectedAnnotation &&
          `${selectedAnnotation.type}: ${selectedAnnotation.description}`}
        {selectedAnnotation && (
          <img
            style={{
              objectFit: "contain",
              width: "100%",
            }}
            src={extract!(
              selectedAnnotation.box.xMin,
              selectedAnnotation.box.yMin,
              selectedAnnotation.box.xMax - selectedAnnotation.box.xMin,
              selectedAnnotation.box.yMax - selectedAnnotation.box.yMin
            )}
          />
        )}
      </div>
    );
  };
  return (
    <CogniteFileViewer.Provider sdk={pdfSdk}>
      <div style={{ height: "100%", width: "100%", display: "flex" }}>
        <AnotherComponent />
        <CogniteFileViewer.FileViewer file={pdfFile} editable={true} />
      </div>
    </CogniteFileViewer.Provider>
  );
};

export const CustomizedAnnotations = () => {
  const [annotations, setAnnotations] = useState<
    CustomizableCogniteAnnotation[]
  >([]);
  const mark = [
    {
      backgroundColor: "#ff110055",
      strokeColor: "#26ff0055",
      strokeWidth: 0,
    },
    {
      draw: (
        canvas: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
      ) => {
        canvas.beginPath();
        canvas.globalCompositeOperation = "multiply";
        canvas.fillStyle = "#26ff0055";
        canvas.arc(
          x + width / 2,
          y + height / 2,
          Math.min(height, width) / 2,
          0,
          2 * Math.PI
        );
        canvas.stroke();
        canvas.fill();
      },
    },
  ];
  useEffect(() => {
    (async () => {
      const rawAnnotations = await listAnnotationsForFile(
        imgSdkTwoAnnotations,
        imgFile
      );
      const customizedAnnotations = rawAnnotations.map(
        (annotation: CustomizableCogniteAnnotation, index: number) => ({
          ...annotation,
          mark: mark[index],
        })
      );
      setAnnotations(customizedAnnotations);
    })();
  }, [mark]);

  return (
    <CogniteFileViewer
      sdk={imgSdk}
      file={imgFile}
      disableAutoFetch={true}
      annotations={annotations}
      editable={true}
      allowCustomAnnotations={true}
    />
  );
};

const PreviewBox = styled.div`
  padding: 5px;
  border: 1px solid ${(props) => props.color ?? "orange"};
  border-top: 5px solid ${(props) => props.color ?? "orange"};
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.85);
  user-select: none;
  font-size: 0.8em;
  line-height: 0.8em;
`;

const BoxWrapper = styled.div`
  display: flex;
  flex-direction: row;

  & > * {
    margin-right: 2px;
  }
`;

export const BoxAndArrows = () => {
  const [annotations, setAnnotations] = useState<CogniteAnnotation[]>([]);
  useEffect(() => {
    (async () => {
      const rawAnnotations = await listAnnotationsForFile(
        imgSdkTwoAnnotations,
        imgFile
      );
      setAnnotations(rawAnnotations);
    })();
  }, []);
  const callbacks: ViewerEditCallbacks = useMemo(
    () => ({
      onCreate: (annotation) => {
        id += 1;
        setAnnotations(
          annotations.concat([
            {
              ...annotation,
              id,
              createdTime: new Date(),
              lastUpdatedTime: new Date(),
            } as CogniteAnnotation,
          ])
        );
        return false;
      },
      onUpdate: (annotation) => {
        setAnnotations(
          annotations
            .filter((el) => `${el.id}` !== `${annotation.id}`)
            .concat([annotation as CogniteAnnotation])
        );
        return false;
      },
    }),
    [annotations, setAnnotations]
  );

  return (
    <CogniteFileViewer
      sdk={imgSdk}
      file={imgFile}
      editable={boolean("Editable", true)}
      creatable={false}
      hideLabel={true}
      pagination={false}
      editCallbacks={callbacks}
      disableAutoFetch={true}
      annotations={annotations}
      onAnnotationSelected={action("onAnnotationSelected")}
      renderArrowPreview={(_annotation: any) => (
        <BoxWrapper>
          <PreviewBox>13</PreviewBox>
          <PreviewBox color="cyan">22</PreviewBox>
        </BoxWrapper>
      )}
      renderItemPreview={(anno) => (
        <>
          <Button
            icon="Delete"
            onClick={() =>
              setAnnotations(
                annotations.filter((el) => `${el.id}` !== `${anno.id}`)
              )
            }
          />
        </>
      )}
    />
  );
};
export const Playground = () => {
  return (
    <CogniteFileViewer
      sdk={pdfSdk}
      file={pdfFile}
      editable={boolean("Editable", false)}
      creatable={boolean("Creatable", false)}
      hideControls={boolean("Hide Controls", false)}
      hideLabel={boolean("Hide Label", false)}
      hoverable={boolean("Hoverable", false)}
      pagination={select("Pagination", ["small", "normal", false], "normal")}
      onAnnotationSelected={action("onAnnotationSelected")}
    />
  );
};
