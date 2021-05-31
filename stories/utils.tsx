import styled from "styled-components";
import { CogniteClient } from "@cognite/sdk";
import { response, threeAnnotationsResponse, orcResults } from "./resources";
import { FileViewerContextObserverPublicProps } from "../src";
import randomId from "../src/utils/randomId";
// @ts-ignore
import pdfFileUrl from "./img/pnid.pdf";
// @ts-ignore
import imgFileUrl from "./img/pnid.jpg";
// @ts-ignore
import tifFileUrl from "./img/pnid.tiff";

export const pdfFile = {
  id: 1,
  lastUpdatedTime: new Date(),
  uploaded: false,
  createdTime: new Date(),
  name: "Random File",
  mimeType: "application/pdf",
};

export const imgFile = {
  id: 1,
  lastUpdatedTime: new Date(),
  uploaded: false,
  createdTime: new Date(),
  name: "Random File",
  mimeType: "image/png",
};

export const tifFile = {
  id: 1,
  lastUpdatedTime: new Date(),
  uploaded: false,
  createdTime: new Date(),
  name: "Random File",
  mimeType: "image/tif",
};

export const imgSdkThreeAnnotations = ({
  events: {
    list: (..._: any[]) => ({
      autoPagingToArray: async () => threeAnnotationsResponse,
    }),
    update: async (...annotations: any[]) =>
      annotations.map((el) => el.annotation),
    create: async (...annotations: any[]) =>
      annotations.map((el) => ({ ...el, id: randomId() })),
  },
  post: async () => ({ data: { items: [{ annotations: orcResults }] } }),
  files: {
    retrieve: async () => [imgFile],
    getDownloadUrls: async () => [{ downloadUrl: imgFileUrl }],
  },
} as unknown) as CogniteClient;

export const imgSdk = ({
  events: {
    list: (..._: any[]) => ({ autoPagingToArray: async () => response }),
    update: async (...annotations: any[]) =>
      annotations.map((el) => el.annotation),
    create: async (...annotations: any[]) =>
      annotations.map((el) => ({ ...el, id: randomId() })),
  },
  post: async () => ({ data: { items: [{ annotations: orcResults }] } }),
  files: {
    retrieve: async () => [imgFile],
    getDownloadUrls: async () => [{ downloadUrl: imgFileUrl }],
  },
} as unknown) as CogniteClient;

export const pdfSdk = ({
  events: {
    list: (..._: any[]) => ({ autoPagingToArray: async () => response }),
    update: async (...annotations: any[]) =>
      annotations.map((el) => el.annotation),
    create: async (...annotations: any[]) =>
      annotations.map((el) => ({ ...el, id: randomId() })),
  },
  post: async () => ({ data: { items: [{ annotations: orcResults }] } }),
  files: {
    retrieve: async () => [pdfFile],
    getDownloadUrls: async () => [
      {
        downloadUrl: pdfFileUrl,
      },
    ],
  },
} as unknown) as CogniteClient;

export const tifSdk = ({
  events: {
    list: (..._: any[]) => ({ autoPagingToArray: async () => response }),
    update: async (...annotations: any[]) =>
      annotations.map((el) => el.annotation),
    create: async (...annotations: any[]) =>
      annotations.map((el) => ({ ...el, id: randomId() })),
  },
  post: async () => ({ data: { items: [{ annotations: orcResults }] } }),
  files: {
    retrieve: async () => [tifFile],
    getDownloadUrls: async () => [{ downloadUrl: tifFileUrl }],
  },
} as unknown) as CogniteClient;

export const Container = styled.div`
  width: 100%;
  height: 600px;
  background: grey;
`;

export const stubObserverObj = (_: FileViewerContextObserverPublicProps) =>
  null;
