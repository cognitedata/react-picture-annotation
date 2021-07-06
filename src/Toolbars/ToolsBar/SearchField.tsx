import React, { useState, useEffect } from "react";
import { Input, Button } from "@cognite/cogs.js";
import styled from "styled-components";
import { useViewerQuery } from "../../Cognite/FileViewerContext";

const Wrapper = styled.div`
  display: flex;
  align-items: stretch;
  input {
    height: 32px;
  }
`;

export const SearchField = () => {
  const [open, setOpen] = useState(false);
  const { query, setQuery } = useViewerQuery();

  const wrapperRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    if (open && wrapperRef?.current) {
      wrapperRef.current.querySelector("input")?.focus();
    }
  }, [wrapperRef, open]);

  if (!open) {
    return (
      <Button aria-label="Search" icon="Search" onClick={() => setOpen(true)} />
    );
  }
  return (
    <Wrapper ref={wrapperRef}>
      <Input
        icon="Search"
        type="text"
        onChange={(e) => setQuery(e.target.value)}
        value={query}
      />
      <Button
        aria-label="Clear"
        icon="Close"
        onClick={() => {
          setOpen(false);
          setQuery("");
        }}
      />
    </Wrapper>
  );
};
