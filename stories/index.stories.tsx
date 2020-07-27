import { storiesOf } from "@storybook/react";
import React, { useEffect, useState } from "react";
import { action } from "@storybook/addon-actions";
import styled from "styled-components";
import { ReactPictureAnnotation } from "../src";
import { IAnnotation } from "../src/Annotation";
import { IShapeData } from "../src/Shape";

const defaultAnnotations = [
  {
    id: "a",
    comment: "Hello World",
    mark: {
      type: "RECT",
      width: 161,
      height: 165,
      x: 0.1,
      y: 0.1,
    },
  },
  {
    id: "b",
    comment: "Hello World",
    mark: {
      type: "RECT",
      width: 161,
      height: 165,
      x: 0,
      y: 0,
    },
  },
  {
    id: "test",
    comment: "percentages",
    mark: {
      type: "RECT",
      width: 0.2,
      height: 0.2,
      x: 0.5,
      y: 0.5,
    },
  },
  {
    id: "test2",
    comment: "percentages 2 ",
    mark: {
      type: "RECT",
      width: 0.5,
      height: 0.1,
      x: 0.9,
      y: 0.9,
    },
  },

  {
    id: "test2--a",
    comment: "percentages 2 ",
    mark: {
      type: "RECT",
      width: 0.5,
      height: 0.1,
      x: 0.25,
      y: 0.75,
    },
  },
  {
    id: "test2--b",
    comment: "percentages 2 ",
    mark: {
      type: "RECT",
      width: 0.5,
      height: 0.1,
      x: 0.75,
      y: 0.25,
    },
  },
];

storiesOf("Annotator", module)
  .add("No Edit", () => {
    const [size, setSize] = useState({
      width: window.innerWidth - 16,
      height: window.innerHeight - 16,
    });

    const [annotationData, setAnnotationData] = useState<
      IAnnotation<IShapeData>[]
    >(defaultAnnotations);

    const [selectedId, setSelectedId] = useState<string | null>("a");

    const onResize = () => {
      setSize({
        width: window.innerWidth - 16,
        height: window.innerHeight - 16,
      });
    };

    useEffect(() => {
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }, []);
    return (
      <Wrapper>
        <ReactPictureAnnotation
          width={size.width}
          height={size.height}
          annotationData={annotationData}
          onChange={(data) => setAnnotationData(data)}
          selectedId={selectedId}
          onSelect={(e) => {
            setSelectedId(e);
            action("onSelect")(e);
          }}
          image="https://unsplash.it/1200/600"
        />
      </Wrapper>
    );
  })
  .add("PDF", () => {
    const [size, setSize] = useState({
      width: window.innerWidth - 16,
      height: window.innerHeight - 16,
    });

    const [annotationData, setAnnotationData] = useState<
      IAnnotation<IShapeData>[]
    >(defaultAnnotations);

    const [selectedId, setSelectedId] = useState<string | null>("a");
    const [page, setPage] = useState<number>(1);

    const onResize = () => {
      setSize({
        width: window.innerWidth - 16,
        height: window.innerHeight - 16,
      });
    };

    useEffect(() => {
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }, []);
    const [total, setTotal] = useState<number>(1);
    const annotationRef = React.createRef<ReactPictureAnnotation>();
    return (
      <Wrapper>
        <ReactPictureAnnotation
          ref={annotationRef}
          hoverable={true}
          page={page}
          width={size.width}
          height={size.height}
          annotationData={annotationData}
          onChange={(data) => setAnnotationData(data)}
          selectedId={selectedId}
          onSelect={(e) => {
            setSelectedId(e);
            action("onSelect")(e);
          }}
          onPDFLoaded={({ pages }) => {
            setTotal(pages);
          }}
          pdf="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
        />
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            right: "50%",
          }}
        >
          <button onClick={() => setPage(page - 1)} disabled={page === 1}>
            Prev
          </button>
          <button onClick={() => setPage(page + 1)} disabled={page === total}>
            Next
          </button>
        </div>
      </Wrapper>
    );
  })
  .add("Hoverable", () => {
    const [size, setSize] = useState({
      width: window.innerWidth - 16,
      height: window.innerHeight - 16,
    });

    const [annotationData, setAnnotationData] = useState<
      IAnnotation<IShapeData>[]
    >([
      {
        id: "a",
        comment: "Hello World",
        mark: {
          type: "RECT",
          width: 161,
          height: 165,
          x: 229,
          y: 92,
        },
      },
    ]);

    const [selectedId, setSelectedId] = useState<string | null>("a");

    const onResize = () => {
      setSize({
        width: window.innerWidth - 16,
        height: window.innerHeight - 16,
      });
    };

    useEffect(() => {
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }, []);
    return (
      <ReactPictureAnnotation
        width={size.width}
        height={size.height}
        annotationData={annotationData}
        onChange={(data) => setAnnotationData(data)}
        selectedId={selectedId}
        onSelect={(e) => {
          setSelectedId(e);
          action("onSelect")(e);
        }}
        hoverable={true}
        image="https://unsplash.it/1200/600"
      />
    );
  })
  .add("Refresh", () => {
    const [size, setSize] = useState({
      width: window.innerWidth - 16,
      height: window.innerHeight - 16,
    });

    const [image, setImage] = useState("https://picsum.photos/id/1/200/300");

    const [annotationData, setAnnotationData] = useState<
      IAnnotation<IShapeData>[]
    >([
      {
        id: "a",
        comment: "Hello World",
        mark: {
          type: "RECT",
          width: 161,
          height: 165,
          x: 229,
          y: 92,
        },
      },
    ]);

    const [selectedId, setSelectedId] = useState<string | null>("a");

    const onResize = () => {
      setSize({
        width: window.innerWidth - 16,
        height: window.innerHeight - 16,
      });
    };

    useEffect(() => {
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }, []);
    return (
      <Wrapper>
        <button
          onClick={() =>
            setImage(
              `https://picsum.photos/id/${Math.round(
                Math.random() * 1000
              )}/200/300`
            )
          }
        >
          Change Image
        </button>
        <ReactPictureAnnotation
          width={size.width}
          height={size.height}
          annotationData={annotationData}
          onChange={(data) => setAnnotationData(data)}
          selectedId={selectedId}
          onSelect={(e) => {
            setSelectedId(e);
            action("onSelect")(e);
          }}
          hoverable={true}
          image={image}
        />
      </Wrapper>
    );
  })
  .add("Editable", () => {
    const [size, setSize] = useState({
      width: window.innerWidth - 16,
      height: window.innerHeight - 16,
    });

    const [annotationData, setAnnotationData] = useState<
      IAnnotation<IShapeData>[]
    >(defaultAnnotations);

    const [selectedId, setSelectedId] = useState<string | null>("a");

    const onResize = () => {
      setSize({
        width: window.innerWidth - 16,
        height: window.innerHeight - 16,
      });
    };

    useEffect(() => {
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }, []);

    return (
      <ReactPictureAnnotation
        width={size.width}
        height={size.height}
        annotationData={annotationData}
        onChange={(data) => setAnnotationData(data)}
        selectedId={selectedId}
        onSelect={(e) => {
          setSelectedId(e);
          action("onSelect")(e);
        }}
        editable={true}
        image="https://unsplash.it/1200/600"
      />
    );
  })
  .add("Creatable", () => {
    const [size, setSize] = useState({
      width: window.innerWidth - 16,
      height: window.innerHeight - 16,
    });

    const [annotationData, setAnnotationData] = useState<
      IAnnotation<IShapeData>[]
    >(defaultAnnotations);

    const [selectedId, setSelectedId] = useState<string | null>("a");

    const onResize = () => {
      setSize({
        width: window.innerWidth - 16,
        height: window.innerHeight - 16,
      });
    };

    useEffect(() => {
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }, []);

    return (
      <ReactPictureAnnotation
        width={size.width}
        height={size.height}
        annotationData={annotationData}
        onChange={(data) => setAnnotationData(data)}
        selectedId={selectedId}
        onSelect={(e) => {
          setSelectedId(e);
          action("onSelect")(e);
        }}
        creatable={true}
        editable={false}
        image="https://unsplash.it/1200/600"
      />
    );
  })
  .add("Custom Render", () => {
    const [size, setSize] = useState({
      width: window.innerWidth - 16,
      height: window.innerHeight - 16,
    });

    const [annotationData, setAnnotationData] = useState<
      IAnnotation<IShapeData>[]
    >(
      defaultAnnotations.map((el) => ({
        ...el,
        mark: {
          ...el.mark,
          draw: (canvas, x, y, width, height) => {
            canvas.beginPath();
            canvas.fillStyle = "green";
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
      }))
    );

    const [selectedId, setSelectedId] = useState<string | null>("a");

    const onResize = () => {
      setSize({
        width: window.innerWidth - 16,
        height: window.innerHeight - 16,
      });
    };

    useEffect(() => {
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }, []);

    return (
      <ReactPictureAnnotation
        width={size.width}
        height={size.height}
        annotationData={annotationData}
        onChange={(data) => setAnnotationData(data)}
        selectedId={selectedId}
        onSelect={(e) => {
          setSelectedId(e);
          action("onSelect")(e);
        }}
        image="https://unsplash.it/1200/600"
      />
    );
  })
  .add("No Labels", () => {
    const [size, setSize] = useState({
      width: window.innerWidth - 16,
      height: window.innerHeight - 16,
    });

    const [annotationData, setAnnotationData] = useState<
      IAnnotation<IShapeData>[]
    >([
      {
        id: "a",
        comment: "HA HA HA",
        mark: {
          type: "RECT",
          width: 161,
          height: 165,
          x: 229,
          y: 92,
        },
      },
    ]);

    const [selectedId, setSelectedId] = useState<string | null>("a");

    const onResize = () => {
      setSize({
        width: window.innerWidth - 16,
        height: window.innerHeight - 16,
      });
    };

    useEffect(() => {
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }, []);

    return (
      <Wrapper>
        <ReactPictureAnnotation
          width={size.width}
          height={size.height}
          annotationData={annotationData}
          onChange={(data) => setAnnotationData(data)}
          selectedId={selectedId}
          onSelect={(e) => {
            setSelectedId(e);
            action("onSelect")(e);
          }}
          drawLabel={false}
          image="https://unsplash.it/1200/600"
        />
      </Wrapper>
    );
  })
  .add("Colors", () => {
    const [size, setSize] = useState({
      width: window.innerWidth - 16,
      height: window.innerHeight - 16,
    });
    const annotations = [
      {
        id: "a",
        comment: "HA HA HA",
        mark: {
          type: "RECT",
          width: 161,
          height: 165,
          x: 229,
          y: 92,
          strokeColor: "red",
          backgroundColor: "rgba(255,0,0,0.2)",
        },
      },
      {
        id: "b",
        comment: "HA HA HA 2",
        mark: {
          type: "RECT",
          width: 116,
          height: 116,
          x: 429,
          y: 192,
          strokeColor: "green",
          backgroundColor: "rgba(0,255,0,0.2)",
        },
      },
    ];

    const [annotationData, setAnnotationData] = useState<
      IAnnotation<IShapeData>[]
    >(annotations);

    const [selectedId, setSelectedId] = useState<string | null>("a");

    const onResize = () => {
      setSize({
        width: window.innerWidth - 16,
        height: window.innerHeight - 16,
      });
    };

    useEffect(() => {
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }, []);

    const changeColor = () => {
      annotations[0].mark.strokeColor = "blue";
      setAnnotationData(annotations);
    };

    return (
      <Wrapper>
        <button onClick={changeColor}>Change Color</button>
        <ReactPictureAnnotation
          width={size.width}
          height={size.height}
          annotationData={annotationData}
          onChange={(data) => setAnnotationData(data)}
          selectedId={selectedId}
          onSelect={(e) => {
            setSelectedId(e);
            action("onSelect")(e);
          }}
          image="https://unsplash.it/1200/600"
        />
      </Wrapper>
    );
  })
  .add("Custom Render using scale", () => {
    const AnnotationComponent = () => {
      const [size, setSize] = useState({
        width: window.innerWidth - 16,
        height: window.innerHeight - 16,
      });

      const [annotationData, setAnnotationData] = useState<
        IAnnotation<IShapeData>[]
      >(
        defaultAnnotations.map((el) => ({
          ...el,
          mark: {
            ...el.mark,
            draw: (canvas, x, y, _, _2, scale) => {
              const fontSize = 16 * (scale || 0);
              canvas.font = `${fontSize}px verdana`;

              canvas.fillStyle = "black";
              canvas.fillText("Scaled text", x, y);
            },
          },
        }))
      );

      const [selectedId, setSelectedId] = useState<string | null>("a");

      const onResize = () => {
        setSize({
          width: window.innerWidth - 16,
          height: window.innerHeight - 16,
        });
      };

      useEffect(() => {
        window.addEventListener("resize", onResize);
        return () => {
          window.removeEventListener("resize", onResize);
        };
      }, []);

      return (
        <ReactPictureAnnotation
          width={size.width}
          height={size.height}
          annotationData={annotationData}
          onChange={(data) => setAnnotationData(data)}
          selectedId={selectedId}
          onSelect={(e) => setSelectedId(e)}
          image="https://unsplash.it/1200/600"
        />
      );
    };

    return <AnnotationComponent />;
  })
  .add("Buttons", () => {
    const [size, setSize] = useState({
      width: window.innerWidth - 16,
      height: window.innerHeight - 16,
    });

    const [annotationData, setAnnotationData] = useState<
      IAnnotation<IShapeData>[]
    >([
      {
        id: "a",
        comment: "HA HA HA",
        mark: {
          type: "RECT",
          width: 161,
          height: 165,
          x: 229,
          y: 92,
        },
      },
      {
        id: "b",
        comment: "HA HA HA 2",
        mark: {
          type: "RECT",
          width: 116,
          height: 116,
          x: 429,
          y: 192,
        },
      },
    ]);

    const [selectedId, setSelectedId] = useState<string | null>("a");

    const onResize = () => {
      setSize({
        width: window.innerWidth - 16,
        height: window.innerHeight - 16,
      });
    };

    useEffect(() => {
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }, []);

    const annotationRef = React.createRef<ReactPictureAnnotation>();

    return (
      <Wrapper>
        <ReactPictureAnnotation
          width={size.width}
          height={size.height}
          annotationData={annotationData}
          onChange={(data) => setAnnotationData(data)}
          selectedId={selectedId}
          onSelect={(e) => {
            setSelectedId(e);
            action("onSelect")(e);
          }}
          image="https://unsplash.it/1200/600"
          ref={annotationRef}
        />
        <div style={{ position: "absolute", zIndex: 1000 }}>
          <button
            onClick={() => {
              if (annotationRef.current) {
                annotationRef.current.zoomIn();
              }
            }}
          >
            Zoom In
          </button>
          <button
            onClick={() => {
              if (annotationRef.current) {
                annotationRef.current.zoomOut();
              }
            }}
          >
            Zoom Out
          </button>
          <button
            onClick={() => {
              if (annotationRef.current) {
                annotationRef.current.reset();
              }
            }}
          >
            Reset
          </button>
        </div>
      </Wrapper>
    );
  })
  .add("Download", () => {
    const [size, setSize] = useState({
      width: window.innerWidth - 16,
      height: window.innerHeight - 16,
    });

    const [annotationData, setAnnotationData] = useState<
      IAnnotation<IShapeData>[]
    >(
      defaultAnnotations
        .map(
          (el, i) =>
            ({
              ...el,
              mark: {
                ...el.mark,
                draw: (ctx, x, y, _, _2, scale) => {
                  const fontsize = scale * 28;
                  const fontface = "verdana";
                  const text = `Hello! - ${i}`;

                  ctx.font = fontsize + "px " + fontface;
                  const textWidth = ctx.measureText(text).width + 8;

                  ctx.textAlign = "left";
                  ctx.textBaseline = "top";
                  ctx.fillStyle = "red";
                  ctx.fillRect(x, y, textWidth, fontsize + 4);
                  ctx.fillStyle = "white";
                  ctx.fillText(text, x + 4, y + 2);
                },
              },
            } as IAnnotation<IShapeData>)
        )
        .concat([
          {
            id: "additional",
            comment: "Hello World2",
            mark: {
              type: "RECT",
              width: 0.2,
              height: 0.3,
              x: 0.1,
              y: 0.25,
            },
          } as IAnnotation<IShapeData>,
        ])
    );

    const [selectedId, setSelectedId] = useState<string | null>(null);

    const onResize = () => {
      setSize({
        width: window.innerWidth - 16,
        height: window.innerHeight - 16,
      });
    };

    useEffect(() => {
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }, []);

    const annotationRef = React.createRef<ReactPictureAnnotation>();

    return (
      <Wrapper>
        <ReactPictureAnnotation
          width={size.width}
          height={size.height}
          annotationData={annotationData}
          onChange={(data) => setAnnotationData(data)}
          selectedId={selectedId}
          onSelect={(e) => {
            setSelectedId(e);
            action("onSelect")(e);
          }}
          pdf="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
          ref={annotationRef}
        />
        <div style={{ position: "absolute", zIndex: 1000 }}>
          <button
            onClick={() => {
              if (annotationRef.current) {
                annotationRef.current.downloadFile("sample.pdf");
              }
            }}
          >
            Download
          </button>
        </div>
      </Wrapper>
    );
  });

const Wrapper = styled.div`
  height: 800px;
  width: 100%;
`;
