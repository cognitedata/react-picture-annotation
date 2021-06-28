import React, { useState, useEffect } from "react";
import { Input, Button } from "@cognite/cogs.js";
import { useViewerQuery } from "./FileViewerContext";
import styled from "styled-components";

export const SearchField = () => {
  const [open, setOpen] = useState(false);
  const { query, setQuery } = useViewerQuery();

  const wrapperRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    if (open && wrapperRef && wrapperRef.current) {
      wrapperRef.current.querySelector("input")?.focus();
    }
  }, [wrapperRef, open]);

  if (open) {
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
  }
  return (
    <Button aria-label="Search" icon="Search" onClick={() => setOpen(true)} />
  );
};

const Wrapper = styled.div`
  display: flex;
  align-items: stretch;
  input {
    height: 32px;
  }
`;
