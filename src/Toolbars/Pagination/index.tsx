import React, { useContext } from "react";
import CogniteFileViewerContext from "../../Cognite/FileViewerContext";
import { DocumentPagination } from "./components";

type Props = {
  pagination: any;
};

export const Pagination = (props: Props): JSX.Element => {
  const { pagination } = props;
  const { totalPages, page, setPage } = useContext(CogniteFileViewerContext);

  if (totalPages <= 1 || !pagination) return <></>;
  return (
    <DocumentPagination
      total={totalPages}
      current={page || 1}
      pageSize={1}
      showPrevNextJumpers={true}
      simple={pagination === "small"}
      onChange={(newPageNum) => setPage && setPage(newPageNum)}
    />
  );
};
