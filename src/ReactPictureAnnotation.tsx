import React, { MouseEventHandler, TouchEventHandler } from "react";
import pdfjs from "pdfjs-dist";
import { PDFDocument, rgb, PDFPage, degrees } from "pdf-lib";
import parseColor from "parse-color";
import { IAnnotation } from "./Annotation";
import { IAnnotationState } from "./annotation/AnnotationState";
import { DefaultAnnotationState } from "./annotation/DefaultAnnotationState";
import DefaultInputSection from "./DefaultInputSection";
import { IShape, IShapeBase, RectShape } from "./Shape";
import Transformer, { ITransformer } from "./Transformer";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdf-hub-bundles.cogniteapp.com/dependencies/pdfjs-dist@2.4.456/build/pdf.worker.min.js`;

export type RenderItemPreviewFunc = (
  editable: boolean,
  annotation: IAnnotation,
  onChange: (value: string) => void,
  onDelete: () => void,
  height: React.CSSProperties["maxHeight"]
) => React.ReactElement;

interface IReactPictureAnnotationProps {
  annotationData?: IAnnotation[];
  selectedId?: string | null;
  onChange?: (annotationData: IAnnotation[]) => void;
  onSelect: (id: string | null) => void;
  width: number;
  height: number;
  usePercentage?: boolean;
  page?: number;
  image?: string;
  pdf?: string;
  editable: boolean;
  creatable?: boolean;
  hoverable?: boolean;
  drawLabel: boolean;
  renderItemPreview: RenderItemPreviewFunc;
  onAnnotationUpdate?: (annotation: IAnnotation) => void;
  onAnnotationCreate?: (annotation: IAnnotation) => void;
  onAnnotationDelete?: (annotation: IAnnotation) => void;
  onPDFLoaded?: (props: { pages: number }) => void;
  onLoading: (loading: boolean) => void;
}

interface IStageState {
  scale: number;
  originX: number;
  originY: number;
}

const defaultState: IStageState = {
  scale: 1,
  originX: 0,
  originY: 0,
};

export default class ReactPictureAnnotation extends React.Component<
  IReactPictureAnnotationProps
> {
  set selectedId(value: string | null) {
    const { onSelect } = this.props;
    if (this.selectedIdTrueValue !== value) {
      onSelect(value);
    }
    this.selectedIdTrueValue = value;
  }

  get selectedId() {
    return this.selectedIdTrueValue;
  }

  get selectedItem() {
    if (!this.props.annotationData) {
      return;
    }
    return this.props.annotationData.find(
      (el) => el.id === this.selectedIdTrueValue
    );
  }
  public static defaultProps = {
    renderItemPreview: (
      editable: boolean,
      annotation: IAnnotation,
      onChange: (value: string) => void,
      onDelete: () => void
    ) => (
      <DefaultInputSection
        editable={editable}
        annotation={annotation}
        onChange={onChange}
        onDelete={onDelete}
      />
    ),
    editable: false,
    creatable: false,
    drawLabel: true,
    usePercentage: true,
    onLoading: () => true,
  };

  public shapes: IShape[] = [];
  public currentTransformer: ITransformer;
  public pendingShapeId: string | null = null;

  public state = {
    inputPosition: { left: 0, right: 0, maxHeight: 0 } as React.CSSProperties,
    showInput: false,
  };
  private currentAnnotationData: IAnnotation[] = [];
  private selectedIdTrueValue: string | null = null;
  private canvasRef = React.createRef<HTMLCanvasElement>();
  private canvas2D?: CanvasRenderingContext2D | null;
  private imageCanvasRef = React.createRef<HTMLCanvasElement>();
  private imageCanvas2D?: CanvasRenderingContext2D | null;
  private currentImageElement?: HTMLImageElement;
  private currentAnnotationState: IAnnotationState = new DefaultAnnotationState(
    this
  );
  private scaleState = defaultState;
  private startDrag?: {
    x: number;
    y: number;
    originX: number;
    originY: number;
  } = undefined;
  private lastPinchLength?: number;

  private _PDF_DOC?: pdfjs.PDFDocumentProxy;

  public componentDidMount = async () => {
    const currentCanvas = this.canvasRef.current;
    const currentImageCanvas = this.imageCanvasRef.current;
    if (this.props.pdf) {
      this._PDF_DOC = await pdfjs.getDocument({ url: this.props.pdf }).promise;
      if (this.props.onPDFLoaded) {
        this.props.onPDFLoaded({ pages: this._PDF_DOC.numPages });
      }
    }
    if (currentCanvas && currentImageCanvas) {
      this.setCanvasDPI();

      this.canvas2D = currentCanvas.getContext("2d");
      this.imageCanvas2D = currentImageCanvas.getContext("2d");
      this.onImageChange();

      currentCanvas.addEventListener("wheel", this.onWheel, { passive: false });
    }

    this.syncAnnotationData();
    this.syncSelectedId();
  };

  public componentDidUpdate = async (
    prevProps: IReactPictureAnnotationProps
  ) => {
    const { width, height, image, pdf, page } = this.props;
    if (prevProps.width !== width || prevProps.height !== height) {
      this.setCanvasDPI();
      this.onShapeChange();
      this.onImageChange();
    }
    if (prevProps.pdf !== pdf) {
      if (pdf) {
        this._PDF_DOC = await pdfjs.getDocument({ url: pdf }).promise;
        if (this.props.onPDFLoaded) {
          this.props.onPDFLoaded({ pages: this._PDF_DOC.numPages });
        }
      } else {
        this._PDF_DOC = undefined;
      }
    }
    if (image && prevProps.image !== image) {
      this.cleanImage();
      if (!this.currentImageElement) {
        this.reset();
      }
      if (this.currentImageElement && image) {
        this.currentImageElement.src = image;
      }
    }
    if (pdf && (prevProps.pdf !== pdf || prevProps.page !== page)) {
      if (!this.currentImageElement) {
        this.reset();
      }
      if (this.currentImageElement && this._PDF_DOC) {
        this.currentImageElement.src = await this.loadPDFPage();
      }
    }

    this.syncAnnotationData();
    this.syncSelectedId();
  };

  public componentWillUnmount = () => {
    if (this.canvasRef.current) {
      this.canvasRef.current.removeEventListener("wheel", this.onWheel);
    }
  };

  public calculateMousePosition = (positionX: number, positionY: number) => {
    const { originX, originY, scale } = this.scaleState;
    return {
      positionX: (positionX - originX) / scale,
      positionY: (positionY - originY) / scale,
    };
  };

  public getOriginalImageSize = (): { width: number; height: number } => {
    if (this.currentImageElement) {
      return {
        width: this.currentImageElement.width,
        height: this.currentImageElement.height,
      };
    }
    return {
      width: 1,
      height: 1,
    };
  };

  public calculateShapePositionNoOffset = (
    shapeData: IShapeBase
  ): IShapeBase => {
    const { x, y, width, height } = shapeData;
    let scaledX = x;
    let scaledWidth = width;
    let scaledY = y;
    let scaledHeight = height;
    if (
      this.currentImageElement &&
      width < 1 &&
      height < 1 &&
      width > 0 &&
      height > 0
    ) {
      scaledX = x * this.currentImageElement.width;
      scaledWidth = width * this.currentImageElement.width;
      scaledY = y * this.currentImageElement.height;
      scaledHeight = height * this.currentImageElement.height;
    }
    return {
      x: scaledX,
      y: scaledY,
      width: scaledWidth,
      height: scaledHeight,
    };
  };

  public calculateShapePosition = (shapeData: IShapeBase): IShapeBase => {
    const { originX, originY, scale } = this.scaleState;
    const { x, y, width, height } = this.calculateShapePositionNoOffset(
      shapeData
    );
    return {
      x: x * scale + originX,
      y: y * scale + originY,
      width: width * scale,
      height: height * scale,
    };
  };

  public render() {
    const { width, height, renderItemPreview, editable } = this.props;
    const { showInput, inputPosition } = this.state;
    return (
      <div className="rp-stage">
        <canvas
          style={{ width, height }}
          className="rp-image"
          ref={this.imageCanvasRef}
          width={width * 2}
          height={height * 2}
        />
        <canvas
          className="rp-shapes"
          style={{ width, height }}
          ref={this.canvasRef}
          width={width * 2}
          height={height * 2}
          onMouseDown={this.onMouseDown}
          onMouseMove={this.onMouseMove}
          onMouseUp={this.onMouseUp}
          onMouseLeave={this.onMouseLeave}
          onTouchStart={this.onTouchStart}
          onTouchEnd={this.onTouchEnd}
          onTouchMove={this.onTouchMove}
        />
        {showInput && this.selectedItem && (
          <div
            className="rp-selected-input"
            style={inputPosition}
            onMouseEnter={() => {
              this.selectedId = this.selectedItem!.id;
              if (!this.props.hoverable) {
                this.currentAnnotationState.onMouseUp();
              }
            }}
          >
            {renderItemPreview(
              editable,
              this.selectedItem,
              this.onInputCommentChange,
              this.onDelete,
              inputPosition.maxHeight
            )}
          </div>
        )}
      </div>
    );
  }

  public setAnnotationState = (annotationState: IAnnotationState) => {
    this.currentAnnotationState = annotationState;
  };

  public onShapeChange = () => {
    if (this.canvas2D && this.canvasRef.current) {
      this.canvas2D.clearRect(
        0,
        0,
        this.canvasRef.current.width,
        this.canvasRef.current.height
      );

      let hasSelectedItem = false;

      if (this.getOriginalImageSize().width === 1) {
        return;
      }

      for (const item of this.shapes) {
        const isSelected = item.getAnnotationData().id === this.selectedId;
        const { scale } = this.scaleState;
        const { x, y, height, width } = item.paint(
          this.canvas2D,
          this.calculateShapePosition,
          isSelected,
          this.props.drawLabel,
          scale,
          false
        );

        if (isSelected) {
          if (
            !this.currentTransformer ||
            this.currentTransformer.id !== item.getAnnotationData().id
          ) {
            this.currentTransformer = new Transformer(
              item,
              this.props.editable,
              this.getOriginalImageSize,
              this.calculateShapePositionNoOffset
            );
          }

          hasSelectedItem = true;

          this.currentTransformer.paint(
            this.canvas2D,
            this.calculateShapePosition
          );
          const { width: containerWidth, height: containerHeight } = this.props;

          const leftOfMiddle = x < containerWidth / 2;
          const topOfMiddle = y < containerHeight / 2;

          const { strokeWidth = 4 } = item.getAnnotationData().mark;
          const margin = strokeWidth + 10;

          this.setState({
            showInput: true,
            inputPosition: {
              ...(leftOfMiddle
                ? { left: x }
                : { right: containerWidth - (x + width) }),
              // ...(leftOfMiddle?{paddingLeft: margin}:{paddingRight:margin}),
              ...(topOfMiddle
                ? { top: y + height + strokeWidth }
                : { bottom: -y + strokeWidth }),
              ...(topOfMiddle
                ? { paddingTop: margin }
                : { paddingBottom: margin }),
              ...(topOfMiddle && {
                maxHeight: `calc(${this.props.height}px - ${
                  y + height + 2 * margin
                }px)`,
              }),
              ...(!topOfMiddle && { maxHeight: `calc(${y - 2 * margin}px)` }),
              overflow: "visible",
              zIndex: 1000,
            },
          });
        }
      }

      if (!hasSelectedItem) {
        this.setState({
          showInput: false,
          inputComment: "",
        });
      }
    }

    this.currentAnnotationData = this.shapes.map((item) =>
      item.getAnnotationData()
    );
    const { onChange } = this.props;
    if (onChange) {
      onChange(this.currentAnnotationData);
    }
  };

  public onDelete = (id = this.selectedId) => {
    const { onAnnotationDelete, editable } = this.props;
    if (editable) {
      const deleteTarget = this.shapes.findIndex(
        (shape) => shape.getAnnotationData().id === id
      );
      if (deleteTarget >= 0) {
        this.shapes.splice(deleteTarget, 1);
        this.onShapeChange();
        const annotation = this.shapes.find(
          (shape) => shape.getAnnotationData().id === id
        );
        if (onAnnotationDelete && annotation) {
          onAnnotationDelete(annotation.getAnnotationData());
        }
      }
      this.selectedId = null;
      this.onShapeChange();
    }
  };

  public zoomIn = () => {
    if (this.scaleState.scale > 10) {
      this.scaleState.scale = 10;
    } else if (this.scaleState.scale < 0.1) {
      this.scaleState.scale = 0.1;
    } else {
      this.scaleState.scale += this.scaleState.scale * 0.2;
      this.scaleState.scale = Math.max(
        Math.min(this.scaleState.scale, 10),
        0.1
      );
    }

    this.setState({ imageScale: this.scaleState });

    requestAnimationFrame(() => {
      this.onShapeChange();
      this.onImageChange();
    });
  };

  public zoomOut = () => {
    if (this.scaleState.scale > 10) {
      this.scaleState.scale = 10;
    } else if (this.scaleState.scale < 0.1) {
      this.scaleState.scale = 0.1;
    } else {
      this.scaleState.scale -= this.scaleState.scale * 0.2;
      this.scaleState.scale = Math.max(
        Math.min(this.scaleState.scale, 10),
        0.1
      );
    }

    this.setState({ imageScale: this.scaleState });

    requestAnimationFrame(() => {
      this.onShapeChange();
      this.onImageChange();
    });
  };

  public reset = async () => {
    this.props.onLoading(true);
    const nextImageNode =
      this.currentImageElement || document.createElement("img");
    const loadProperDimentions = () => {
      const { width, height } = nextImageNode;
      const imageNodeRatio = height / width;
      const { width: canvasWidth, height: canvasHeight } = this.props;
      const canvasNodeRatio = canvasHeight / canvasWidth;
      if (!isNaN(imageNodeRatio) && !isNaN(canvasNodeRatio)) {
        if (imageNodeRatio < canvasNodeRatio) {
          const scale = canvasWidth / width;
          this.scaleState = {
            originX: 0,
            originY: (canvasHeight - scale * height) / 2,
            scale,
          };
        } else {
          const scale = canvasHeight / height;
          this.scaleState = {
            originX: (canvasWidth - scale * width) / 2,
            originY: 0,
            scale,
          };
        }
      }
      this.onImageChange();
      this.onShapeChange();
    };
    if (this.currentImageElement) {
      loadProperDimentions();
    } else {
      nextImageNode.addEventListener("load", () => {
        this.currentImageElement = nextImageNode;
        loadProperDimentions();
      });
      nextImageNode.alt = "";
      if (this.props.image) {
        nextImageNode.src = this.props.image;
      } else if (this._PDF_DOC) {
        nextImageNode.src = await this.loadPDFPage();
      }
    }
    this.props.onLoading(false);
  };

  public downloadFile = async (
    fileName: string,
    drawText: boolean = true,
    drawBox: boolean = true,
    drawCustom: boolean = true,
    immediateDownload: boolean = true
  ) => {
    if (!this._PDF_DOC || !this.currentImageElement) {
      return;
    }
    const { annotationData } = this.props;

    const pdfDoc = await PDFDocument.load(await this._PDF_DOC!.getData());

    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const pageNum = this.props.page ? this.props.page - 1 : 0;
    const currentPage = pages[pageNum];
    const fontSize = 12;
    const pageRotation = this.getPageRotation(currentPage) % 360;

    // Get the width and height of the first page
    const { width: pageWidth, height: pageHeight } = currentPage.getSize();

    const DOWNLOAD_SCALE = 4;

    const bCanvas = document.createElement("canvas");
    const bCtx = bCanvas.getContext("2d")!;

    bCanvas.width = pageWidth * DOWNLOAD_SCALE;
    bCanvas.height = pageHeight * DOWNLOAD_SCALE;

    if (annotationData) {
      await Promise.all(
        annotationData.map(async (el) => {
          const color = parseColor(el.mark.strokeColor || "blue").rgb;

          let { x, y, width, height } = this.calculateShapePositionNoOffset(
            el.mark
          );

          x = x / (this.currentImageElement?.width || 1);
          width = width / this.currentImageElement!.width;
          y = y / (this.currentImageElement?.height || 1);
          height = height / this.currentImageElement!.height;
          // rotations are dumb!

          // These coords are now from bottom/left
          const coordsFromBottomLeft: { x: number; y: number } = {
            x,
            y: 1 - y,
          };

          let drawX = null;
          let drawY = null;
          if (pageRotation === 90) {
            drawX = 1 - coordsFromBottomLeft.y;
            drawY = coordsFromBottomLeft.x;
            const tmpWidth = width;
            width = height;
            height = -tmpWidth;
          } else if (pageRotation === 180) {
            drawX = 1 - coordsFromBottomLeft.x;
            drawY = 1 - coordsFromBottomLeft.y;
            height = -height;
            width = -width;
          } else if (pageRotation === 270) {
            drawX = coordsFromBottomLeft.y;
            drawY = 1 - coordsFromBottomLeft.x;
            const tmpWidth = width;
            width = -height;
            height = tmpWidth;
          } else {
            // no rotation
            drawX = coordsFromBottomLeft.x;
            drawY = coordsFromBottomLeft.y;
          }

          const noXYRotate = !(pageRotation === 90 || pageRotation === 270);
          if (el.mark.draw) {
            const newX = drawX * pageWidth * DOWNLOAD_SCALE;
            const newY = (1 - drawY) * pageHeight * DOWNLOAD_SCALE;
            bCtx.translate(0, 0);
            bCtx.save();
            bCtx.translate(newX, newY);
            bCtx.rotate((-pageRotation * Math.PI) / 180);
            el.mark.draw(
              bCtx,
              0,
              0,
              width * pageWidth * DOWNLOAD_SCALE,
              height * pageHeight * DOWNLOAD_SCALE,
              this.scaleState.scale * 2 * DOWNLOAD_SCALE,
              true
            );
            bCtx.restore();
            return;
          }
          if (!!el.comment && drawText) {
            currentPage.drawText(el.comment, {
              x:
                (drawX + (noXYRotate ? 0 : width)) * pageWidth +
                (noXYRotate ? 2 : -fontSize),
              y:
                (drawY + (noXYRotate ? -height : 0)) * pageHeight +
                (noXYRotate ? -fontSize : -2),
              size: fontSize,
              rotate: degrees(pageRotation),
            });
          }
          if (drawBox) {
            currentPage.drawRectangle({
              x: drawX * pageWidth,
              y: drawY * pageHeight,
              width: width * pageWidth,
              height: -height * pageHeight,
              borderWidth: el.mark.strokeWidth || 2,
              borderColor: rgb(color[0] / 255, color[1] / 255, color[2] / 255),
            });
          }
        })
      );
    }
    document.body.append(bCanvas);

    // draw custom ones
    if (drawCustom) {
      const bData = await new Promise((resolve) => {
        bCanvas.toBlob((blb) => {
          blb?.arrayBuffer().then(resolve);
        });
      });

      const bImage = await pdfDoc.embedPng(bData as ArrayBuffer);

      currentPage.drawImage(bImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });
    }

    // Draw a string of text diagonally across the first page

    if (immediateDownload) {
      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.style.display = "none";
      a.click();
      a.remove();

      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    }
    return pdfDoc;
  };

  private syncAnnotationData = () => {
    const { annotationData } = this.props;
    if (annotationData) {
      const refreshShapesWithAnnotationData = () => {
        const nextShapes = annotationData.map(
          (eachAnnotationData) =>
            new RectShape(
              eachAnnotationData,
              this.onShapeChange,
              this.getOriginalImageSize
            )
        );
        this.shapes = nextShapes;
        if (
          !nextShapes.find(
            (el) => el.getAnnotationData().id === this.selectedId
          )
        ) {
          this.selectedId = null;
        }
        this.onShapeChange();
      };

      if (annotationData.length !== this.shapes.length) {
        refreshShapesWithAnnotationData();
      } else {
        for (const annotationDataItem of annotationData) {
          const targetShape = this.shapes.find(
            (item) => item.getAnnotationData().id === annotationDataItem.id
          );
          if (
            targetShape &&
            targetShape.equal(annotationDataItem) &&
            JSON.stringify(targetShape.getAnnotationData().mark) ===
              JSON.stringify(annotationDataItem.mark)
          ) {
            continue;
          } else {
            refreshShapesWithAnnotationData();
            break;
          }
        }
      }
    }
  };

  private syncSelectedId = () => {
    const { selectedId } = this.props;

    if (selectedId && selectedId !== this.selectedId) {
      this.selectedId = selectedId;
      this.onShapeChange();
    }
  };

  private setCanvasDPI = () => {
    const currentCanvas = this.canvasRef.current;
    const currentImageCanvas = this.imageCanvasRef.current;
    if (currentCanvas && currentImageCanvas) {
      const currentCanvas2D = currentCanvas.getContext("2d");
      const currentImageCanvas2D = currentImageCanvas.getContext("2d");
      if (currentCanvas2D && currentImageCanvas2D) {
        currentCanvas2D.resetTransform();
        currentImageCanvas2D.resetTransform();
        currentCanvas2D.scale(2, 2);
        currentImageCanvas2D.scale(2, 2);
      }
    }
  };

  private onInputCommentChange = (comment: string) => {
    if (this.props.editable) {
      const selectedShapeIndex = this.shapes.findIndex(
        (item) => item.getAnnotationData().id === this.selectedId
      );
      this.shapes[selectedShapeIndex].getAnnotationData().comment = comment;
      this.selectedId = null;
      this.onShapeChange();
    }
  };

  private cleanImage = () => {
    if (this.imageCanvas2D && this.imageCanvasRef.current) {
      this.imageCanvas2D.clearRect(
        0,
        0,
        this.imageCanvasRef.current.width,
        this.imageCanvasRef.current.height
      );
    }
  };

  private onImageChange = async () => {
    this.cleanImage();
    if (this.imageCanvas2D && this.imageCanvasRef.current) {
      const { originX, originY, scale } = this.scaleState;
      if (this.currentImageElement) {
        this.imageCanvas2D.drawImage(
          this.currentImageElement,
          originX,
          originY,
          this.currentImageElement.width * scale,
          this.currentImageElement.height * scale
        );
      } else {
        this.reset();
      }
    }
  };

  private createContext = (page: pdfjs.PDFPageProxy) => {
    const viewport = page.getViewport({
      scale: Math.min(
        Math.max(
          this.props.width / (page.view[2] / 4),
          this.props.height / (page.view[3] / 4),
          1
        ),
        8
      ),
    });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    return { canvas, ctx, viewport };
  };

  private loadPDFPage = async (pageNum = this.props.page || 1) => {
    if (this._PDF_DOC) {
      const page = await this._PDF_DOC.getPage(pageNum);

      const { canvas, ctx, viewport } = this.createContext(page);

      await page.render({ canvasContext: ctx, viewport }).promise;
      const data = canvas.toDataURL("image/png", 1);

      return data;
    }
    return "";
  };

  private onMouseDown: MouseEventHandler<HTMLCanvasElement> = (event) => {
    const { editable, creatable } = this.props;
    const { offsetX, offsetY } = event.nativeEvent;
    const { positionX, positionY } = this.calculateMousePosition(
      offsetX,
      offsetY
    );
    this.currentAnnotationState.onMouseDown(positionX, positionY);
    if (!(creatable || editable) || event.shiftKey) {
      const { originX, originY } = this.scaleState;
      this.startDrag = { x: offsetX, y: offsetY, originX, originY };
    }
  };

  private onMouseMove: MouseEventHandler<HTMLCanvasElement> = (event) => {
    const { offsetX, offsetY } = event.nativeEvent;
    const { positionX, positionY } = this.calculateMousePosition(
      offsetX,
      offsetY
    );
    this.currentAnnotationState.onMouseMove(positionX, positionY);
    if (this.startDrag) {
      this.scaleState.originX =
        this.startDrag.originX + (offsetX - this.startDrag.x);
      this.scaleState.originY =
        this.startDrag.originY + (offsetY - this.startDrag.y);

      this.setState({ imageScale: this.scaleState });

      requestAnimationFrame(() => {
        this.onShapeChange();
        this.onImageChange();
      });
    }
  };

  private onMouseUp: MouseEventHandler<HTMLCanvasElement> = () => {
    this.currentAnnotationState.onMouseUp();
    this.startDrag = undefined;
  };

  private onTouchStart: TouchEventHandler<HTMLCanvasElement> = (event) => {
    const { editable } = this.props;
    const { clientX, clientY } = event.touches[0];
    const { positionX, positionY } = this.calculateMousePosition(
      clientX,
      clientY
    );

    this.currentAnnotationState.onMouseDown(positionX, positionY);
    if (!editable) {
      const { touches } = event;
      if (touches.length === 2) {
        this.lastPinchLength = getPinchLength(touches);
      } else if (touches.length === 1) {
        this.lastPinchLength = undefined;
        const { originX, originY } = this.scaleState;
        this.startDrag = { x: clientX, y: clientY, originX, originY };
      }
    }

    // suppress viewport scaling on iOS
    tryCancelEvent(event);
  };

  private onTouchMove: TouchEventHandler<HTMLCanvasElement> = (event) => {
    const { editable } = this.props;
    const { clientX, clientY } = event.touches[0];
    const { positionX, positionY } = this.calculateMousePosition(
      clientX,
      clientY
    );
    if (editable) {
      this.currentAnnotationState.onMouseMove(positionX, positionY);
    } else {
      const { touches } = event;
      if (touches.length === 2) {
        this.handlePinchChange(touches);
      } else if (touches.length === 1) {
        if (this.startDrag) {
          this.scaleState.originX =
            this.startDrag.originX + (clientX - this.startDrag.x);
          this.scaleState.originY =
            this.startDrag.originY + (clientY - this.startDrag.y);

          this.setState({ imageScale: this.scaleState });

          requestAnimationFrame(() => {
            this.onShapeChange();
            this.onImageChange();
          });
        }
      }
    }

    // suppress viewport scaling on iOS
    tryCancelEvent(event);
  };

  private onTouchEnd: TouchEventHandler<HTMLCanvasElement> = () => {
    this.currentAnnotationState.onMouseUp();
    this.startDrag = undefined;
  };

  private handlePinchChange = (touches: React.TouchList) => {
    const length = getPinchLength(touches);
    const midpoint = getPinchMidpoint(touches);
    let scale = this.lastPinchLength
      ? (this.scaleState.scale * length) / this.lastPinchLength // sometimes we get a touchchange before a touchstart when pinching
      : this.scaleState.scale;

    if (scale > 10) {
      scale = 10;
    }
    if (scale < 0.1) {
      scale = 0.1;
    }

    const { originX, originY } = this.scaleState;

    this.scaleState.originX =
      midpoint.x - ((midpoint.x - originX) / this.scaleState.scale) * scale;
    this.scaleState.originY =
      midpoint.y - ((midpoint.y - originY) / this.scaleState.scale) * scale;
    this.scaleState.scale = scale;

    this.setState({ imageScale: this.scaleState });

    requestAnimationFrame(() => {
      this.onShapeChange();
      this.onImageChange();
    });
  };

  private onMouseLeave: MouseEventHandler<HTMLCanvasElement> = () => {
    this.currentAnnotationState.onMouseLeave();
  };

  private onWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
    // https://stackoverflow.com/a/31133823/9071503
    // const { clientHeight, scrollTop, scrollHeight,ctrlKey } = event;
    // if (clientHeight + scrollTop + event.deltaY > scrollHeight) {
    //   // event.preventDefault();
    //   event.currentTarget.scrollTop = scrollHeight;
    // } else if (scrollTop + event.deltaY < 0) {
    //   // event.preventDefault();
    //   event.currentTarget.scrollTop = 0;
    // }

    const { scale: preScale } = this.scaleState;
    // this.scaleState.scale -= event.deltaY * 0.005;
    const { offsetX, offsetY, ctrlKey, deltaY, deltaX } = event;

    if (ctrlKey) {
      if (this.scaleState.scale > 10) {
        this.scaleState.scale = 10;
      } else if (this.scaleState.scale < 0.1) {
        this.scaleState.scale = 0.1;
      } else {
        this.scaleState.scale -= deltaY * 0.01;
        this.scaleState.scale = Math.max(
          Math.min(this.scaleState.scale, 10),
          0.1
        );
      }
      const { originX, originY, scale } = this.scaleState;
      this.scaleState.originX =
        offsetX - ((offsetX - originX) / preScale) * scale;
      this.scaleState.originY =
        offsetY - ((offsetY - originY) / preScale) * scale;
    } else {
      this.scaleState.originX -= deltaX * 2;
      this.scaleState.originY -= deltaY * 2;
    }

    this.setState({ imageScale: this.scaleState });

    requestAnimationFrame(() => {
      this.onShapeChange();
      this.onImageChange();
    });
  };

  private getPageRotation = (page: PDFPage) => {
    let rotation: number = 0;

    // Check for Rotate on the page itself
    const isRotated = !!page.getRotation();
    if (isRotated) {
      rotation = page.getRotation().angle;
    }

    // A rotation of 0 is the default
    if (rotation === undefined) {
      rotation = 0;
    }

    return rotation;
  };
}

export const getPinchMidpoint = (touches: React.TouchList) => {
  const touch1 = touches[0];
  const touch2 = touches[1];
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  };
};

export const getPinchLength = (touches: React.TouchList) => {
  const touch1 = touches[0];
  const touch2 = touches[1];
  return Math.sqrt(
    Math.pow(touch1.clientY - touch2.clientY, 2) +
      Math.pow(touch1.clientX - touch2.clientX, 2)
  );
};

export const tryCancelEvent = (event: React.TouchEvent) => {
  if (event.cancelable === false) {
    return false;
  }

  event.preventDefault();
  return true;
};
