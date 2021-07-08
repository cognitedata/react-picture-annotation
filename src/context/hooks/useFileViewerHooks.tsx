import { useContext } from "react";
import { FileViewerContext } from "../FileViewerContext";

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
