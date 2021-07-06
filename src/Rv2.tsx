import { CogniteAnnotation } from "@cognite/annotations";
import { CogniteClient, FileInfo } from "@cognite/sdk/dist/src";
import { Graph } from "./Graph";
import * as pdfjs from "pdfjs-dist";
import { PDFDocumentProxy } from "pdfjs-dist/types/display/api";
import React, { useEffect } from "react";
import { useState } from "react";

export const Rv2 = ({
  sdk,
  pdf,
  annotations,
}: {
  sdk: CogniteClient;
  pdf: FileInfo;
  annotations: CogniteAnnotation[];
}) => {
  const pdfBase64Prefix = "data:application/pdf;base64,";

  const [imgSrc, setImgSrc] = useState<string>("");

  const loadFile = async () => {
    try {
      const fileUrl = await retrieveDownloadUrl(sdk, pdf.id);
      if (fileUrl) {
        const getDocParams = fileUrl.startsWith(pdfBase64Prefix)
          ? { data: atob(fileUrl.replace(pdfBase64Prefix, "")) }
          : { url: fileUrl };

        const _PDF_DOC = await pdfjs.getDocument(getDocParams).promise;

        setImgSrc(await loadPDFPage(_PDF_DOC));
      }
      // if (onPDFLoaded) {
      //   onPDFLoaded({ pages: _PDF_DOC.numPages });
      // }
    } catch (e) {
      // if (onPDFFailure) {
      //   onPDFFailure({ url: "", error: e });
      // }
    }
  };
  useEffect(() => {
    loadFile();
  }, [pdf]);

  const loadPDFPage = async (_PDF_DOC: PDFDocumentProxy, pageNumber = 1) => {
    const page = await _PDF_DOC.getPage(pageNumber);

    const { canvas, ctx, viewport } = createContext(
      page,
      window.innerWidth,
      window.innerHeight
    );

    await page.render({ canvasContext: ctx, viewport }).promise;
    const data = canvas.toDataURL("image/png", 1);

    return data;
  };

  return (
    <Graph<any>
      renderNode={(node, { k }) => (
        <div>
          <div
            style={{
              transform: `scale(${k})`,
              width: node.width,
              height: node.height,
              background: "red",
            }}
          />
        </div>
      )}
      // @ts-ignore
      nodes={annotations.map((el) => ({
        ...el,
        title: el.label,
        id: `${el.id}`,
        x: el.box.xMin * window.innerWidth,
        y: el.box.yMin * window.innerHeight,
        fx: el.box.xMin * window.innerWidth,
        fy: el.box.yMin * window.innerHeight,
        width: (el.box.xMax - el.box.xMin) * window.innerWidth,
        height: (el.box.yMax - el.box.yMin) * window.innerHeight,
      }))}
      links={[]}
    >
      <img src={imgSrc} alt="" style={{ height: "100%", width: "auto" }} />
    </Graph>
  );
};
const createContext = (page: any, width: number, height: number) => {
  const viewport = page.getViewport({
    scale: Math.min(
      Math.max(width / (page.view[2] / 4), height / (page.view[3] / 4), 1),
      8
    ),
  });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  return { canvas, ctx, viewport };
};
export const retrieveDownloadUrl = async (
  client: CogniteClient,
  fileId: number
) => {
  try {
    const [{ downloadUrl }] = await client.files.getDownloadUrls([
      { id: fileId },
    ]);
    return downloadUrl;
  } catch {
    return undefined;
  }
};
