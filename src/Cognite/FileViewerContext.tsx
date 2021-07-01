import React, { useContext, useState, useEffect, useRef } from "react";
import { CogniteClient, FileInfo } from "@cognite/sdk";
import {
  CogniteAnnotation,
  listAnnotationsForFile,
} from "@cognite/annotations";
import { ProposedCogniteAnnotation } from "./FileViewerUtils";
import {
  DownloadFileFunction,
  ExtractFromCanvasFunction,
  ViewerZoomFunction,
  ViewerZoomControlledFunction,
} from "../ReactPictureAnnotation";
import { RGBColor, DEFAULT } from "../utils";

export type FileViewerContextObserver = FileViewerContextObserverPublicProps &
  FileViewerContextObserverPrivateProps &
  FileViewerContextObserverPaintLayerProps;
export type FileViewerContextObserverPublicProps = {
  /**
   * The sdk that was provided via provider
   */
  sdk: CogniteClient;
  /**
   * The current page, available via `usePage()`
   */
  page: number;
  /**
   * Set the current page, available via `usePage()`
   */
  setPage: React.Dispatch<React.SetStateAction<number>>;
  /**
   * The total number of pages, available via `usePage()`
   */
  totalPages: number;
  /**
   * The current file
   */
  file?: FileInfo;
  /**
   * The current annotation, available via `useSelectedAnnotations()`
   */
  selectedAnnotations: (ProposedCogniteAnnotation | CogniteAnnotation)[];
  /**
   * Set the current annotation, available via `useSelectedAnnotations()`
   */
  setSelectedAnnotations: React.Dispatch<
    React.SetStateAction<(ProposedCogniteAnnotation | CogniteAnnotation)[]>
  >;
  /**
   * Annotations to display, available via `useAnnotations()`
   */
  annotations: (CogniteAnnotation | ProposedCogniteAnnotation)[];
  /**
   * Set the annotations to display, useful if you want to modify annotations across views under the context, available via useAnnotations()
   */
  setAnnotations: (
    annotations: (CogniteAnnotation | ProposedCogniteAnnotation)[]
  ) => void;
  /**
   * The search query, available via `useViewerQuery()`
   */
  query: string;
  /**
   * Set the file search query, available via `useViewerQuery()`
   */
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  /**
   * Is the file loading, available via `useIsFileLoading()`
   */
  isLoading: boolean;
  /**
   * zoomIn() will zoom the viewer in, available via `useZoomControls()`
   */
  zoomIn: ViewerZoomFunction | undefined;
  /**
   * zoomOut() will zoom the viewer out, available via `useZoomControls()`
   */
  zoomOut: ViewerZoomFunction | undefined;
  /**
   * zoomOnAnnotation(annotation) centers and zooms the file on a particular annotation
   */
  zoomOnAnnotation: ViewerZoomControlledFunction | undefined;
  /**
   * reset() reset the zoom and position, available via `useZoomControls()`
   */
  reset: ViewerZoomFunction | undefined;
  /**
   * download() will allow you to download the file (and decide if annotations should be drawn on top), available via `useDownload()`
   */
  download: DownloadFileFunction | undefined;
  /**
   * extractFromCanvas() will allow you to extract part of the PDF as an image string, available via `useExtractFromCanvas()`
   */
  extractFromCanvas: ExtractFromCanvasFunction | undefined;
};

type FileViewerContextObserverPrivateProps = {
  setExtractFromCanvas: React.Dispatch<
    React.SetStateAction<ExtractFromCanvasFunction | undefined>
  >;
  setDownload: React.Dispatch<
    React.SetStateAction<DownloadFileFunction | undefined>
  >;
  setZoomIn: React.Dispatch<
    React.SetStateAction<ViewerZoomFunction | undefined>
  >;
  setZoomOut: React.Dispatch<
    React.SetStateAction<ViewerZoomFunction | undefined>
  >;
  setZoomOnAnnotation: React.Dispatch<
    React.SetStateAction<ViewerZoomFunction | undefined>
  >;
  setReset: React.Dispatch<
    React.SetStateAction<ViewerZoomFunction | undefined>
  >;
  setFile: (file?: FileInfo) => void;
  setTotalPages: (total: number) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

type FileViewerContextObserverPaintLayerProps = {
  /**
   *
   */
  paintLayerCanvasRef: React.RefObject<any>;
  /**
   *
   */
  paintLayerEditMode: boolean;
  /**
   *
   */
  setPaintLayerEditMode: (editMode: boolean) => void;
  /**
   *
   */
  brushRadius: number;
  /**
   *
   */
  setBrushRadius: (newBrushRadius: number) => void;
  /**
   *
   */
  brushColor: RGBColor;
  /**
   *
   */
  setBrushColor: (newColor: RGBColor) => void;
  /**
   *
   */
  snapStraightEnabled: boolean;
  /**
   *
   */
  setSnapStraightEnabled: (snapStraightEnabled: boolean) => void;
  /**
   *
   */
  drawData: string;
  /**
   *
   */
  setDrawData: (drawData: string) => void;
};

const FileViewerContext = React.createContext({} as FileViewerContextObserver);

export const useAnnotations = () => {
  const { annotations, setAnnotations } = useContext(FileViewerContext);
  return { annotations, setAnnotations };
};

export const useIsFileLoading = () => {
  const { isLoading } = useContext(FileViewerContext);
  return isLoading;
};

export const usePage = () => {
  const { page, setPage } = useContext(FileViewerContext);
  return { page, setPage };
};

export const useZoomControls = () => {
  const { zoomIn, zoomOut, zoomOnAnnotation, reset } = useContext(
    FileViewerContext
  );
  return { zoomIn, zoomOut, zoomOnAnnotation, reset };
};

export const useDownloadPDF = () => {
  const { download } = useContext(FileViewerContext);
  return download;
};

export const useExtractFromCanvas = () => {
  const { extractFromCanvas } = useContext(FileViewerContext);
  return extractFromCanvas;
};

export const useSelectedAnnotations = () => {
  const { selectedAnnotations, setSelectedAnnotations } = useContext(
    FileViewerContext
  );
  return { selectedAnnotations, setSelectedAnnotations };
};
export const useViewerQuery = () => {
  const { query, setQuery } = useContext(FileViewerContext);
  return { query, setQuery };
};

export const useViewerPage = () => {
  const { page, setPage, totalPages } = useContext(FileViewerContext);
  return { page, setPage, totalPages };
};

export type ContextProps = {
  /**
   * A CogniteClient to supply to the viewer
   */
  sdk: CogniteClient;
  /**
   * Should fetching of annotations happen automatically? Unless you want to hook annotations fetching/storing into your store or augment annotations from CDF before sending into viewer, and you can trust the viewer to fetch annotations each time a file is supplied.
   */
  disableAutoFetch?: boolean;
};

const FileViewerProvider = ({
  sdk,
  children,
  disableAutoFetch = false,
}: {
  children: React.ReactNode;
} & ContextProps) => {
  const [annotations, setAnnotations] = useState<
    (CogniteAnnotation | ProposedCogniteAnnotation)[]
  >([]);

  const [selectedAnnotations, setSelectedAnnotations] = useState<
    (ProposedCogniteAnnotation | CogniteAnnotation)[]
  >([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [file, setFile] = useState<FileInfo | undefined>(undefined);
  const [query, setQuery] = useState<string>("");

  const [download, setDownload] = useState<DownloadFileFunction | undefined>(
    undefined
  );
  const [zoomIn, setZoomIn] = useState<ViewerZoomFunction | undefined>(
    undefined
  );
  const [zoomOut, setZoomOut] = useState<ViewerZoomFunction | undefined>(
    undefined
  );
  const [zoomOnAnnotation, setZoomOnAnnotation] = useState<
    ViewerZoomFunction | undefined
  >(undefined);
  const [reset, setReset] = useState<ViewerZoomFunction | undefined>(undefined);
  const [extractFromCanvas, setExtractFromCanvas] = useState<
    ExtractFromCanvasFunction | undefined
  >(undefined);

  const [paintLayerEditMode, setPaintLayerEditMode] = useState<boolean>(false);
  const [snapStraightEnabled, setSnapStraightEnabled] = useState<boolean>(true);
  const [brushRadius, setBrushRadius] = useState<number>(DEFAULT.RADIUS);
  const [brushColor, setBrushColor] = useState<RGBColor>(DEFAULT.COLOR);
  const [drawData, setDrawData] = useState<string>(
    '{"lines":[],"width":"100%","height":"100%"}'
  );
  const paintLayerCanvasRef = useRef<any>(null);

  const fileId = file ? file.id : undefined;

  useEffect(() => {
    (async () => {
      if (fileId && sdk && !disableAutoFetch) {
        setIsLoading(true);
        const [fetchedFile] = await sdk.files.retrieve([{ id: fileId }], {
          ignoreUnknownIds: true,
        });
        setFile(fetchedFile);
        if (fetchedFile) {
          const annos = await listAnnotationsForFile(sdk, fetchedFile);
          setAnnotations(annos);
        }
        setIsLoading(false);
      }
    })();
  }, [sdk, fileId, disableAutoFetch]);

  useEffect(() => {
    if (fileId) {
      setPage(1);
    }
  }, [fileId]);

  return (
    <FileViewerContext.Provider
      value={{
        sdk,
        isLoading,
        setIsLoading,
        annotations,
        setAnnotations,
        download,
        zoomIn,
        zoomOut,
        zoomOnAnnotation,
        reset,
        extractFromCanvas,
        setDownload,
        setZoomIn,
        setZoomOut,
        setZoomOnAnnotation,
        setReset,
        setExtractFromCanvas,
        page,
        file,
        setFile,
        setPage,
        totalPages,
        setTotalPages,
        selectedAnnotations,
        query,
        setQuery,
        setSelectedAnnotations,
        paintLayerEditMode,
        setPaintLayerEditMode,
        snapStraightEnabled,
        setSnapStraightEnabled,
        brushColor,
        setBrushColor,
        brushRadius,
        setBrushRadius,
        paintLayerCanvasRef,
        drawData,
        setDrawData,
      }}
    >
      {children}
    </FileViewerContext.Provider>
  );
};

export { FileViewerProvider };
export default FileViewerContext;
