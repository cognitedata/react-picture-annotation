import React, { useEffect, useState, useMemo } from "react";
import { action } from "@storybook/addon-actions";
import { boolean, select } from "@storybook/addon-knobs";
import { CogniteFileViewer, ViewerEditCallbacks } from "../src";
import {
  imgSdk,
  imgFile,
  imgSdkThreeAnnotations,
  pdfFile,
  pdfSdk,
} from "./utils";
import {
  listAnnotationsForFile,
  CogniteAnnotation,
} from "@cognite/annotations";
import { CustomizableCogniteAnnotation } from "./Cognite/FileViewerUtils";
import { Button, Colors } from "@cognite/cogs.js";
import {
  useSelectedAnnotations,
  useExtractFromCanvas,
  useDownloadPDF,
  useZoomControls,
  useAnnotations,
} from "../src/Cognite/FileViewerContext";
import styled from "styled-components"; // TODO move into separate file
import { Splitter } from "./Splitter";

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

  const [selectedIds, setSelectedIds] = useState<string[]>(["406167784064508"]);

  const handleAnnotationSelection = (
    selectedAnnotations: CogniteAnnotation[]
  ) => {
    if (selectedAnnotations.length > 0) {
      setSelectedIds([`${selectedAnnotations[0].id}`]);
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
      selectedIds={selectedIds}
      onAnnotationSelected={handleAnnotationSelection}
      renderItemPreview={(anno) => (
        <>
          <span>{anno[0].label}</span>
          <Button
            icon="Delete"
            onClick={() =>
              setAnnotations(
                annotations.filter((el) => `${el.id}` !== `${anno[0].id}`)
              )
            }
          />
        </>
      )}
    />
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 200px;
  height: 100%;
  background: white;
  padding: 8px;
  & > * {
    margin: 8px;
  }
`;

export const SplitContextAndViewer = () => {
  const AnotherComponent = () => {
    // This component now has access to all of the utilities and props of the viewer!
    const download = useDownloadPDF();
    const { zoomIn, zoomOut, zoomOnAnnotation, reset } = useZoomControls();
    const extract = useExtractFromCanvas();
    const {
      selectedAnnotations,
      setSelectedAnnotations,
    } = useSelectedAnnotations();
    const { annotations } = useAnnotations();

    const [selectedAnnotation] = selectedAnnotations;

    const onZoomOnRandomAnnotation = () => {
      const randomAnnotationIndex = Math.floor(
        Math.random() * annotations.length
      );
      const randomAnnotation = annotations[
        randomAnnotationIndex
      ] as CogniteAnnotation;
      const scale = 0.3;
      zoomOnAnnotation!(randomAnnotation, scale);
    };

    return (
      <Wrapper>
        <Button onClick={() => download!("testing.pdf")}>Download</Button>
        <Button onClick={() => zoomIn!()}>Zoom In</Button>
        <Button onClick={() => zoomOut!()}>Zoom Out</Button>
        <Button onClick={() => onZoomOnRandomAnnotation()}>
          Zoom on random annotation
        </Button>
        <Button onClick={() => reset!()}>Reset</Button>
        {selectedAnnotation && (
          <Button onClick={() => setSelectedAnnotations([])}>
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
      </Wrapper>
    );
  };
  return (
    <CogniteFileViewer.Provider sdk={pdfSdk}>
      <div style={{ height: "100%", width: "100%", display: "flex" }}>
        <AnotherComponent />
        <CogniteFileViewer.FileViewer file={pdfFile} editable={false} />
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
    {
      draw: (
        canvas: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
      ) => {
        const radius = 10;
        canvas.beginPath();
        canvas.lineWidth = 4;
        canvas.shadowBlur = 10;
        canvas.shadowColor = "#000033";
        canvas.fillStyle = "#0000ff";
        canvas.lineTo(x + width - radius, y);
        canvas.quadraticCurveTo(x + width, y, x + width, y + radius);
        canvas.lineTo(x + width, y + height - radius);
        canvas.quadraticCurveTo(
          x + width,
          y + height,
          x + width - radius,
          y + height
        );
        canvas.lineTo(x + radius, y + height);
        canvas.quadraticCurveTo(x, y + height, x, y + height - radius);
        canvas.lineTo(x, y + radius);
        canvas.quadraticCurveTo(x, y, x + radius, y);
        canvas.stroke();
        canvas.fill();
      },
    },
  ];
  useEffect(() => {
    (async () => {
      const rawAnnotations = await listAnnotationsForFile(
        imgSdkThreeAnnotations,
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

const PreviewBox = styled.div<{ color?: string; invert?: boolean }>`
  padding: 4px;
  background-color: ${({ color }) => color ?? "#2D79CF"};
  color: ${({ invert }) => (invert ? Colors.black.hex() : Colors.white.hex())};
  box-sizing: border-box;
  user-select: none;
  font-size: 14px;
  line-height: 20px;
  font-weight: bold;
  font-family: Inter, Verdana, Geneva, Tahoma, sans-serif;
`;

const BoxWrapper = styled.div`
  display: flex;
  flex-direction: row;
  border-radius: 3px;
  overflow: hidden;
  box-sizing: border-box;
`;

export const BoxAndArrows = () => {
  const [annotations, setAnnotations] = useState<CogniteAnnotation[]>([]);
  useEffect(() => {
    (async () => {
      const rawAnnotations = await listAnnotationsForFile(imgSdk, imgFile);
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
    <div style={{ width: "100%", height: "100%", backgroundColor: "grey" }}>
      <CogniteFileViewer
        sdk={imgSdk}
        file={imgFile}
        editable={boolean("Editable", false)}
        creatable={false}
        hideLabel={true}
        pagination={false}
        editCallbacks={callbacks}
        disableAutoFetch={true}
        annotations={annotations}
        onAnnotationSelected={action("onAnnotationSelected")}
        arrowPreviewOptions={{
          baseOffset: {
            x: -40,
            y: -40,
          },
        }}
        renderArrowPreview={(annotation: any) => {
          if (annotation.id === "352749521886257")
            return (
              <BoxWrapper>
                <PreviewBox>13</PreviewBox>
                <PreviewBox invert={true} color="#fdc000">
                  22
                </PreviewBox>
              </BoxWrapper>
            );
          return undefined;
        }}
        renderItemPreview={(anno) => (
          <>
            <Button
              icon="Delete"
              onClick={() =>
                setAnnotations(
                  annotations.filter((el) => `${el.id}` !== `${anno[0].id}`)
                )
              }
            />
          </>
        )}
      />
    </div>
  );
};

export const BoxAndArrowsWithSplitter = () => {
  const [annotations, setAnnotations] = useState<CogniteAnnotation[]>([]);
  useEffect(() => {
    (async () => {
      const rawAnnotations = await listAnnotationsForFile(imgSdk, imgFile);
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
    <Splitter
      secondaryMinSize={70}
      secondaryInitialSize={70}
      percentage={true}
      height="calc(100% - 57px)"
    >
      <div style={{ width: "100%", height: "100%", backgroundColor: "white" }}>
        {" "}
        test
      </div>
      <div style={{ width: "100%", height: "100%", backgroundColor: "grey" }}>
        <CogniteFileViewer
          sdk={imgSdk}
          file={imgFile}
          editable={boolean("Editable", false)}
          creatable={false}
          hideLabel={true}
          pagination={false}
          editCallbacks={callbacks}
          disableAutoFetch={true}
          annotations={annotations}
          onAnnotationSelected={action("onAnnotationSelected")}
          arrowPreviewOptions={{
            baseOffset: {
              x: -40,
              y: -40,
            },
          }}
          renderArrowPreview={(annotation: any) => {
            if (annotation.id === "352749521886257")
              return (
                <BoxWrapper>
                  <PreviewBox>13</PreviewBox>
                  <PreviewBox color="#fdc000">22</PreviewBox>
                </BoxWrapper>
              );
            return undefined;
          }}
          renderItemPreview={(anno) => (
            <>
              <Button
                icon="Delete"
                onClick={() =>
                  setAnnotations(
                    annotations.filter((el) => `${el.id}` !== `${anno[0].id}`)
                  )
                }
              />
            </>
          )}
        />
      </div>
    </Splitter>
  );
};

export const Playground = () => {
  const [annotations, setAnnotations] = useState<CogniteAnnotation[]>([]);
  const [
    annotationIdsWithArrowBoxes,
    setAnnotationIdsWithArrowBoxes,
  ] = useState([] as number[]);
  useEffect(() => {
    (async () => {
      const rawAnnotations = await listAnnotationsForFile(imgSdk, imgFile);
      setAnnotations(rawAnnotations);
    })();
  }, []);
  const generateArrowPreview = () => {
    const randomIndex = Math.floor(Math.random() * annotations.length);
    const randomAnnotation = annotations[randomIndex];
    if (
      randomAnnotation &&
      !annotationIdsWithArrowBoxes.includes(randomAnnotation.id)
    ) {
      setAnnotationIdsWithArrowBoxes([
        ...annotationIdsWithArrowBoxes,
        randomAnnotation.id,
      ]);
    }
  };

  const renderArrowPreview = (annotation: any) => {
    const hasPreview = annotationIdsWithArrowBoxes.find((annotationId: any) => {
      if (typeof annotation.id === "string")
        return parseInt(annotation.id, 10) === annotationId;
      else return annotation.id === annotationId;
    });
    if (hasPreview) {
      return (
        <div style={{ padding: "5px", backgroundColor: "red" }}>
          {annotation.id}
        </div>
      );
    } else return undefined;
  };

  return (
    <>
      <Button onClick={generateArrowPreview}>Generate boxes</Button>
      <CogniteFileViewer
        sdk={imgSdk}
        file={imgFile}
        annotations={annotations}
        editable={boolean("Editable", false)}
        creatable={boolean("Creatable", false)}
        hideControls={boolean("Hide Controls", false)}
        hideLabel={boolean("Hide Label", false)}
        hoverable={boolean("Hoverable", false)}
        pagination={select("Pagination", ["small", "normal", false], "normal")}
        renderArrowPreview={renderArrowPreview}
        onAnnotationSelected={action("onAnnotationSelected")}
        renderItemPreview={() => (
          <div
            style={{
              backgroundColor: "white",
              color: "black",
              border: "1px solid black",
              padding: "5px",
            }}
          >
            <ul style={{ margin: 0, padding: 0, listStyleType: "none" }}>
              <li>test</li>
              <li>test</li>
              <li>test</li>
              <li>test</li>
              <li>test</li>
              <li>test</li>
              <li>test</li>
              <li>test</li>
              <li>test</li>
              <li>test</li>
            </ul>
          </div>
        )}
      />
    </>
  );
};
