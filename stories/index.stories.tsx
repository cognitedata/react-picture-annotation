import { withA11y } from "@storybook/addon-a11y";
import { addDecorator, storiesOf } from "@storybook/react";
import React, { useEffect, useState } from "react";
import { action } from "@storybook/addon-actions";

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
      x: 229,
      y: 92,
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
      x: 0.4,
      y: 0.4,
    },
  },
  {
    id: "test2",
    comment: "percentages 2 ",
    mark: {
      type: "RECT",
      width: 0.5,
      height: 0.1,
      x: 0.1,
      y: 0.5,
    },
  },
];

addDecorator((storyFn) => <div>{storyFn()}</div>);

storiesOf("Annotator", module)
  .addDecorator(withA11y)
  .add("No Edit", () => {
    const AnnotationComponent = () => {
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
      action("onSelect");
      return (
        <ReactPictureAnnotation
          width={size.width}
          height={size.height}
          annotationData={annotationData}
          onChange={(data) => setAnnotationData(data)}
          selectedId={selectedId}
          onSelect={(e) => {
            setSelectedId(e);
          }}
          image="https://unsplash.it/1200/600"
        />
      );
    };

    return <AnnotationComponent />;
  })
  .add("PDF", () => {
    const AnnotationComponent = () => {
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
      action("onSelect");
      const [total, setTotal] = useState<number>(1);
      const annotationRef = React.createRef<ReactPictureAnnotation>();
      return (
        <>
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
        </>
      );
    };

    return <AnnotationComponent />;
  })
  .add("Hoverable", () => {
    const AnnotationComponent = () => {
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
      action("onSelect");
      return (
        <ReactPictureAnnotation
          width={size.width}
          height={size.height}
          annotationData={annotationData}
          onChange={(data) => setAnnotationData(data)}
          selectedId={selectedId}
          onSelect={(e) => {
            setSelectedId(e);
          }}
          hoverable={true}
          image="https://unsplash.it/1200/600"
        />
      );
    };

    return <AnnotationComponent />;
  })
  .add("Refresh", () => {
    const AnnotationComponent = () => {
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
      action("onSelect");
      return (
        <>
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
            }}
            hoverable={true}
            image={image}
          />
        </>
      );
    };

    return <AnnotationComponent />;
  })
  .add("Editable", () => {
    const AnnotationComponent = () => {
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
          onSelect={(e) => setSelectedId(e)}
          editable={true}
          image="https://unsplash.it/1200/600"
        />
      );
    };

    return <AnnotationComponent />;
  })
  .add("Creatable", () => {
    const AnnotationComponent = () => {
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
          onSelect={(e) => setSelectedId(e)}
          creatable={true}
          editable={false}
          image="https://unsplash.it/1200/600"
        />
      );
    };

    return <AnnotationComponent />;
  })
  .add("No Labels", () => {
    const AnnotationComponent = () => {
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
        <ReactPictureAnnotation
          width={size.width}
          height={size.height}
          annotationData={annotationData}
          onChange={(data) => setAnnotationData(data)}
          selectedId={selectedId}
          onSelect={(e) => setSelectedId(e)}
          editable={true}
          drawLabel={false}
          image="https://unsplash.it/1200/600"
        />
      );
    };

    return <AnnotationComponent />;
  })
  .add("Colors", () => {
    const AnnotationComponent = () => {
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
        <>
          <button onClick={changeColor}>Change Color</button>
          <ReactPictureAnnotation
            width={size.width}
            height={size.height}
            annotationData={annotationData}
            onChange={(data) => setAnnotationData(data)}
            selectedId={selectedId}
            onSelect={(e) => setSelectedId(e)}
            image="https://unsplash.it/1200/600"
          />
        </>
      );
    };

    return <AnnotationComponent />;
  })
  .add("Buttons", () => {
    const AnnotationComponent = () => {
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
        <>
          <ReactPictureAnnotation
            width={size.width}
            height={size.height}
            annotationData={annotationData}
            onChange={(data) => setAnnotationData(data)}
            selectedId={selectedId}
            onSelect={(e) => setSelectedId(e)}
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
        </>
      );
    };

    return <AnnotationComponent />;
  });
