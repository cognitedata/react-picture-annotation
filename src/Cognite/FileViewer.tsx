import React, { useState, useEffect, useRef, useMemo, useContext } from "react";
import { ReactPictureAnnotation, IAnnotation, IRectShapeData } from "..";
import { Colors } from "@cognite/cogs.js";
import {
  CogniteAnnotation,
  CURRENT_VERSION,
  createAnnotations,
  updateAnnotations,
  PendingCogniteAnnotation,
} from "@cognite/annotations";
import { FileInfo } from "@cognite/sdk";
import CogniteFileViewerContext from "./FileViewerContext";
import {
  ProposedCogniteAnnotation,
  convertCogniteAnnotationToIAnnotation,
  isSameResource,
  retrieveDownloadUrl,
  isPreviewableImage,
  retrieveOCRResults,
  TextBox,
  ArrowPreviewOptions,
} from "./FileViewerUtils";
import { Toolbars, Pagination, ToolbarPosition } from "../Toolbars";

type RenderItemPreviewFunction = (
  annotations: (ProposedCogniteAnnotation | CogniteAnnotation)[],
  height: React.CSSProperties["maxHeight"]
) => React.ReactElement | undefined;

type RenderArrowPreviewFunction = (
  annotation: ProposedCogniteAnnotation | CogniteAnnotation
) => React.ReactElement | undefined;

export type ViewerEditCallbacks = {
  onUpdate: <T extends ProposedCogniteAnnotation | CogniteAnnotation>(
    annotation: T
  ) => T | false;
  onCreate: <T extends PendingCogniteAnnotation>(annotation: T) => T | false;
};

export type ViewerProps = {
  /**
   * If true, you can customize the color and shape of annotation boxes.
   */
  allowCustomAnnotations?: boolean;
  /**
   * File will tell the viewer what file to show.
   */
  file?: FileInfo;
  /**
   * Should the label of the of the annotation be hidden
   */
  editable?: boolean;
  /**
   * Should users be able to create new annotations
   */
  creatable?: boolean;
  /**
   * Should users be able to choose annotations purely using hovers? Useful in conjunction with `renderItemPreview`
   */
  hoverable?: boolean;
  /**
   * Should the drawable Paint Layer render? Also shows the Draw icon on the toolbar
   */
  drawable?: boolean;
  /**
   * Used when an annotation needs to be selected on start
   */
  selectedIds?: string[];
  /**
   * Used when `disableAutoFetch` is true to supply `annotations` to display
   */
  annotations?: (CogniteAnnotation | ProposedCogniteAnnotation)[];
  /**
   * Callbacks when something is created or edited. Return false from function if you want to handle it in a custom manner.
   */
  editCallbacks?: ViewerEditCallbacks;
  /**
   * Useful when in hover mode. Renders a small display of whatever you link near the box when something is selected.
   */
  renderAnnotation?: (
    el: CogniteAnnotation | ProposedCogniteAnnotation,
    isSelected: boolean,
    allowCustomAnnotations: boolean
  ) => IAnnotation<IRectShapeData>;
  /**
   * Override how an annotation box is drawn on top of the file
   */
  renderItemPreview?: RenderItemPreviewFunction;
  /**
   * Renders an always visible small draggable display connected to annotation with an arrow.
   */
  renderArrowPreview?: RenderArrowPreviewFunction;
  /**
   * Options for the arrow preview, if it's defined.
   */
  arrowPreviewOptions?: ArrowPreviewOptions;
  /**
   * Callback when an arrow box belonging to an annotation is moved.
   * Useful to save the new arrow box position so it can be preserved over page refresh.
   */
  onArrowBoxMove?: (arrowBox: {
    annotationId: string | number;
    offsetX?: number;
    offsetY?: number;
  }) => void;
  /**
   * Callback for when something is selected
   */
  onAnnotationSelected?: (
    annotation: (CogniteAnnotation | ProposedCogniteAnnotation)[]
  ) => void;

  /**
   * Callback function to be called when the file is loaded
   */
  onFileLoaded?: () => void;
  /**
   * Should pagination be shown, and what size? One page files will have no pagination displayed regardless of settings!
   */
  pagination?: false | "small" | "normal";
  /**
   * Should controls (zoom levels) be hidden.
   */
  hideLabel?: boolean;
  /**
   * Should users be able to edit existing annotations and add new ones
   */
  hideControls?: boolean;
  /**
   * Should hide the download button
   */
  hideDownload?: boolean;
  /**
   * Should hide the search field
   */
  hideSearch?: boolean;
  /**
   *
   */
  toolbarPosition?: ToolbarPosition;
  /**
   * Callback for every stroke on the paint layer.
   * Allows you to get the drawing data from outside to be able to save it externally.
   */
  onDrawingSaved?: (drawData: string) => void;
  /**
   * What to display while loading. Note this is NOT displayed when `file` is not set.
   */
  loader?: React.ReactNode;
  /**
   * Sets the annotation that the file should zoom on
   */
  zoomOnAnnotation?: { annotation: CogniteAnnotation; scale?: number };
  /**
   * Allows to customize the pinch zoom scale.
   */
  pinchScaleModifier?: number;
  /**
   * Allows you to inject an old drawing to component if you had it saved.
   */
  loadedDrawData?: string;
};

export const FileViewer = ({
  annotations: annotationsFromProps,
  allowCustomAnnotations = false,
  file: fileFromProps,
  hideLabel = true,
  hoverable = false,
  drawable = false,
  editCallbacks = {
    onUpdate: (a) => a,
    onCreate: (a) => a,
  } as ViewerEditCallbacks,
  renderItemPreview = () => <></>,
  creatable,
  editable,
  selectedIds,
  pagination = "normal",
  hideControls = false,
  loader,
  hideDownload = false,
  hideSearch = false,
  zoomOnAnnotation,
  loadedDrawData,
  onDrawingSaved,
  onAnnotationSelected,
  onArrowBoxMove,
  renderAnnotation = convertCogniteAnnotationToIAnnotation,
  renderArrowPreview,
  arrowPreviewOptions,
  onFileLoaded,
  pinchScaleModifier,
  toolbarPosition,
}: ViewerProps) => {
  const {
    annotations,
    setAnnotations,
    page,
    setFile,
    sdk,
    file,
    selectedAnnotations,
    setSelectedAnnotations,
    setDownload,
    setExtractFromCanvas,
    setReset,
    setZoomIn,
    setZoomOut,
    totalPages,
    setTotalPages,
    query,
    paintLayerCanvasRef,
    drawData,
    setDrawData,
  } = useContext(CogniteFileViewerContext);

  useEffect(() => {
    if (loadedDrawData && drawData !== loadedDrawData) {
      setDrawData(loadedDrawData);
    }
  }, [loadedDrawData]);

  useEffect(() => {
    if (onDrawingSaved) onDrawingSaved(drawData);
  }, [drawData]);

  useEffect(() => {
    if (annotationsFromProps) {
      setAnnotations(annotationsFromProps);
    }
  }, [annotationsFromProps, setAnnotations]);

  useEffect(() => {
    if (fileFromProps) {
      setFile(fileFromProps);
    }
  }, [fileFromProps, setFile]);

  const combinedIAnnotations = useMemo(
    () =>
      annotations.map((el) =>
        renderAnnotation(
          el,
          selectedAnnotations.some((item) => isSameResource(el, item)),
          !!allowCustomAnnotations
        )
      ),
    [annotations, selectedAnnotations]
  );

  /**
   * caching for performance
   */
  const [visibleAnnotations, setVisibleAnnotations] = useState<
    IAnnotation<IRectShapeData>[]
  >(combinedIAnnotations || ([] as IAnnotation<IRectShapeData>[]));

  const wrapperRef = useRef<HTMLDivElement>(null);
  const annotatorRef = useRef<ReactPictureAnnotation>(null);

  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [textboxes, setTextboxes] = useState<TextBox[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  const fileId = file ? file.id : undefined;

  const textboxesToShow = useMemo(
    () =>
      textboxes
        .filter(
          (box) =>
            query.length !== 0 &&
            query
              .toLowerCase()
              .split(",")
              .some((el) => box.text.toLowerCase().includes(el))
        )
        .map(
          (el) =>
            ({
              id: JSON.stringify(el.boundingBox),
              mark: {
                x: el.boundingBox.xMin,
                y: el.boundingBox.yMin,
                width: el.boundingBox.xMax - el.boundingBox.xMin,
                height: el.boundingBox.yMax - el.boundingBox.yMin,
                backgroundColor: `${Colors["midblue-4"].hex()}88`,
                strokeWidth: 2,
                highlight: true,
              },
              disableClick: true,
            } as IAnnotation<IRectShapeData>)
        ),
    [textboxes, query]
  );

  useEffect(() => {
    (async () => {
      if (fileId) {
        setTextboxes(await retrieveOCRResults(sdk, fileId));
      }
    })();
  }, [fileId, setTextboxes]);

  useEffect(() => {
    (async () => {
      if (fileId) {
        setPreviewUrl(undefined);
        setLoading(true);
        setPreviewUrl(await retrieveDownloadUrl(sdk, fileId));
        setLoading(false);
      }
    })();
  }, [sdk, fileId]);
  useEffect(() => {
    if (annotatorRef && annotatorRef.current) {
      setDownload(() => annotatorRef.current!.downloadFile);
      setExtractFromCanvas(() => annotatorRef.current!.extractFromCanvas);
      setZoomIn(() => annotatorRef.current!.zoomIn);
      setZoomOut(() => annotatorRef.current!.zoomOut);
      setReset(() => annotatorRef.current!.reset);
    }
  }, [annotatorRef]);

  useEffect(() => {
    setVisibleAnnotations(combinedIAnnotations);
  }, [combinedIAnnotations]);

  useEffect(() => {
    if (wrapperRef.current) {
      // change width from the state object
      setHeight(wrapperRef.current!.clientHeight);
      setWidth(wrapperRef.current!.clientWidth);
    }
  }, [wrapperRef]);

  useEffect(() => {
    const resizeListener = () => {
      if (wrapperRef.current) {
        // change width from the state object
        setHeight(wrapperRef.current!.clientHeight);
        setWidth(wrapperRef.current!.clientWidth);
      }
    };
    // set resize listener
    window.addEventListener("resize", resizeListener);

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  const onAnnotationSelect = (ids: string[]) => {
    if (ids.length === 0) {
      setSelectedAnnotations([]);
      if (onAnnotationSelected) {
        onAnnotationSelected([]);
      }
    }
    if (
      selectedAnnotations.length !== ids.length ||
      !selectedAnnotations
        .map((el) => `${el.id}`)
        .every((item) => ids.includes(item))
    ) {
      const newlySelectedAnnotations = annotations.filter((el) =>
        ids.includes(`${el.id}`)
      );
      if (newlySelectedAnnotations.length > 0) {
        setSelectedAnnotations(newlySelectedAnnotations);

        if (onAnnotationSelected) {
          onAnnotationSelected(newlySelectedAnnotations);
        }
      }
    }
  };

  const onArrowBoxMoved = (
    annotationId: string | number,
    offsetX?: number,
    offsetY?: number
  ) => {
    if (onArrowBoxMove) {
      onArrowBoxMove({ annotationId, offsetX, offsetY });
    }
  };

  const isImage: boolean = useMemo(() => {
    if (file) {
      return isPreviewableImage(file);
    }
    return false;
  }, [file]);

  const onUpdateAnnotation = async (
    annotation: IAnnotation<IRectShapeData>
  ) => {
    const foundAnno = annotations.find(
      (el) => el.id === Number(annotation.id) || el.id === annotation.id
    );
    if (foundAnno) {
      const pendingAnnotation = editCallbacks.onUpdate({
        ...foundAnno,
        box: {
          xMin: annotation.mark.x,
          yMin: annotation.mark.y,
          xMax: annotation.mark.x + annotation.mark.width,
          yMax: annotation.mark.y + annotation.mark.height,
        },
      });
      if (pendingAnnotation) {
        if (typeof pendingAnnotation.id === "number") {
          await updateAnnotations(sdk, [
            {
              id: pendingAnnotation.id,
              annotation: pendingAnnotation as CogniteAnnotation,
              update: {
                box: {
                  set: pendingAnnotation.box,
                },
              },
            },
          ]);
        }
        setAnnotations(
          annotations.reduce((prev, el) => {
            if (el.id !== Number(annotation.id) && el.id !== annotation.id) {
              prev.push(el);
            } else {
              prev.push(pendingAnnotation);
            }
            return prev;
          }, [] as (CogniteAnnotation | ProposedCogniteAnnotation)[])
        );
      }
    }
  };

  const onCreateAnnotation = async (
    annotation: IAnnotation<IRectShapeData>
  ) => {
    const pendingAnnotation = editCallbacks.onCreate({
      status: "verified",
      ...(file!.externalId
        ? { fileExternalId: file!.externalId }
        : { fileId: file!.id }),
      version: CURRENT_VERSION,
      label: "",
      page: annotation.page || page,
      box: {
        xMin: annotation.mark.x,
        yMin: annotation.mark.y,
        xMax: annotation.mark.x + annotation.mark.width,
        yMax: annotation.mark.y + annotation.mark.height,
      },
    } as PendingCogniteAnnotation);
    if (pendingAnnotation) {
      const [createdAnnotation] = await createAnnotations(sdk, [
        pendingAnnotation,
      ]);
      setAnnotations(annotations.concat([createdAnnotation]));
      setSelectedAnnotations([createdAnnotation]);
    }
  };

  const annotationData = useMemo(
    () =>
      visibleAnnotations
        .filter((el) => totalPages === 1 || el.page === page)
        .concat(textboxesToShow),
    [textboxesToShow, page, totalPages, visibleAnnotations]
  );

  return (
    <div
      ref={wrapperRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {loading && (
        <div style={{ position: "absolute", height: "100%", width: "100%" }}>
          {loader}
        </div>
      )}
      <ReactPictureAnnotation
        ref={annotatorRef}
        selectedIds={selectedIds}
        drawLabel={!hideLabel}
        hoverable={hoverable}
        editable={editable}
        drawable={drawable}
        annotationData={annotationData}
        onChange={(e) => {
          // if (textboxesToShow.find(el=>el.id===))
          setVisibleAnnotations(
            visibleAnnotations
              .filter((el) => !(totalPages === 1 || el.page === page))
              .concat(
                e.filter(
                  (el) => !textboxesToShow.some((box) => box.id === el.id)
                ) as IAnnotation<IRectShapeData>[]
              )
          );
        }}
        onSelect={onAnnotationSelect}
        onAnnotationCreate={onCreateAnnotation}
        onAnnotationUpdate={onUpdateAnnotation}
        pdf={
          file && file.mimeType === "application/pdf" ? previewUrl : undefined
        }
        image={file && isImage ? previewUrl : undefined}
        creatable={creatable}
        width={width}
        height={height}
        page={page}
        onLoading={(isLoading) => setLoading(isLoading)}
        renderItemPreview={(items, maxHeight) => {
          const ids = items.map((el) => el.id);
          const currentAnnotations = annotations.filter((el) =>
            ids.includes(`${el.id}`)
          );
          return renderItemPreview(currentAnnotations, maxHeight);
        }}
        renderArrowPreview={renderArrowPreview}
        arrowPreviewOptions={arrowPreviewOptions}
        onArrowBoxMove={onArrowBoxMoved}
        onPDFLoaded={async ({ pages }) => {
          setLoading(false);
          setTotalPages(pages);

          if (onFileLoaded) {
            onFileLoaded();
          }
        }}
        zoomOnAnnotation={zoomOnAnnotation}
        paintLayerCanvasRef={paintLayerCanvasRef}
        pinchScaleModifier={pinchScaleModifier}
      />
      <Pagination pagination={pagination} />
      <Toolbars
        toolbarPosition={toolbarPosition}
        hideControls={hideControls}
        hideDownload={hideDownload}
        hideSearch={hideSearch}
        drawable={drawable}
        textboxes={textboxes}
      />
    </div>
  );
};
