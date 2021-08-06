import {ButtonConfig, ButtonStyle, ImageViewerConfig, Point} from './imageviewer.config';
import {Subject} from 'rxjs';

export interface UserDefinedButton {
  polygon: Array<Point>;
  button: Button;
}

export class Button {
  //#region Properties
  sortId = 0;

  icon: string;
  tooltip: string;

  // hover state
  hover: boolean | (() => boolean) = false;

  // show/hide button
  display = true;

  // drawn on position
  private drawPosition = null;
  private drawRadius = 0;

  private path: Path2D = null;
  // private polygonAccountedForRenderOnFile: Array<Point> = null;
  //#endregion

  //#region Lifecycle events
  constructor(
    config: ButtonConfig,
    private style: ButtonStyle
  ) {
    this.sortId = config?.sortId;
    this.display = config?.show;
    this.icon = config?.icon;
    this.tooltip = config?.tooltip;
  }
  //#endregion

  //#region Events
  // click action
  onClick(evt) { alert('no click action set!'); return true; }

  // mouse down action
  onMouseDown(evt) { return false; }
  //#endregion

  //#region Draw Button
  drawAsCircle(ctx, x, y, radius) {
    this.drawPosition = { x: x, y: y };
    this.drawRadius = radius;

    // preserve context
    ctx.save();

    // drawing settings
    const isHover = (typeof this.hover === 'function') ? this.hover() : this.hover;
    ctx.globalAlpha = (isHover) ? this.style.hoverAlpha : this.style.alpha;
    ctx.fillStyle = this.style.bgStyle;
    ctx.lineWidth = 0;

    // draw circle
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
    if (this.style.borderWidth > 0) {
      ctx.lineWidth = this.style.borderWidth;
      ctx.strokeStyle = this.style.borderStyle;
      ctx.stroke();
    }

    // draw icon
    if (this.icon !== null && this.icon !== undefined) {
      ctx.save();
      // ctx.globalCompositeOperation = 'destination-out';
      this.drawIconFont(ctx, x, y, radius);
      ctx.restore();
    }

    // restore context
    ctx.restore();
  }

  drawAsPolygon(ctx, polygon: Array<Point>) {
    // preserve context
    ctx.save();

    // drawing settings
    const isHover = (typeof this.hover === 'function') ? this.hover() : this.hover;
    ctx.globalAlpha = (isHover) ? this.style.hoverAlpha : this.style.alpha;
    ctx.fillStyle = this.style.bgStyle;
    ctx.lineWidth = 0;

    // draw polygon
    const path: Path2D = new Path2D();
    polygon.forEach((point, index) => {
      if (index === 0) {
        path.moveTo(point.x, point.y);
      } else {
        path.lineTo(point.x, point.y);
      }
    });
    path.closePath();
    ctx.fill(path);
    if (this.style.borderWidth > 0) {
      ctx.lineWidth = this.style.borderWidth;
      ctx.strokeStyle = this.style.borderStyle;
      ctx.stroke(path);
    }
    this.path = path;

    // restore context
    ctx.restore();
  }

  private drawIconFont(ctx, centreX, centreY, size) {
    // font settings
    ctx.font = size + 'px ' + this.style.iconFontFamily;
    ctx.fillStyle = this.style.iconStyle;

    // calculate position
    const textSize = ctx.measureText(this.icon);
    const x = centreX - textSize.width / 2;
    const y = centreY + size / 2;

    // draw it
    ctx.fillText(this.icon, x, y);
  }
  //#endregion

  //#region Utils
  isWithinBounds(ctx, x, y) {
    if (this.path !== null) { // If button is a polygon
      return ctx.isPointInPath(this.path, x, y);
    }

    if (this.drawPosition !== null) { // If button is a circle
      const dx = Math.abs(this.drawPosition.x - x), dy = Math.abs(this.drawPosition.y - y);
      return dx * dx + dy * dy <= this.drawRadius * this.drawRadius;
    }

    return false;
  }

  accountForViewPort(polygon: Array<Point>, viewport: Viewport, image): Array<Point> {
    const accountedForZoom: Array<Point> = this.accountForZoom(polygon, viewport, image);

    // rotate around center of canvas
    const rotationPoint: Point = {
      x: viewport.x + viewport.width / 2,
      y: viewport.y + viewport.height / 2
    };
    const accountedForRotation: Array<Point> = this.accountForRotation(accountedForZoom, viewport.rotation, rotationPoint);

    return accountedForRotation;
  }

  private accountForZoom(polygon: Array<Point>, viewport: Viewport, image): Array<Point> {
    return polygon.map((point, i) => {
      const x = point.x * viewport.scale;
      const y = point.y * viewport.scale;

      const xMove = (viewport.x + viewport.width / 2) - (image.width / 2 * viewport.scale);
      const yMove = (viewport.y + viewport.height / 2) - (image.height / 2 * viewport.scale);

      return {
        x: x + xMove,
        y: y + yMove
      };
    });
  }

  private accountForRotation(polygon: Array<Point>, rotation: number, rotationPoint: Point): Array<Point> {
    const angle = rotation * Math.PI / 180;
    return polygon.map((point) => {
      const xRotated = rotationPoint.x + Math.cos(angle) * (point.x - rotationPoint.x) - Math.sin(angle) * (point.y - rotationPoint.y);
      const yRotated = rotationPoint.y + Math.sin(angle) * (point.x - rotationPoint.x) + Math.cos(angle) * (point.y - rotationPoint.y);
      return {
        x: xRotated,
        y: yRotated
      };
    });
  }
  //#endregion
}

export class Viewport {
  constructor(
    public width: number,
    public height: number,
    public scale: number,
    public rotation: number,
    public x: number,
    public y: number
  ) {}
}

export interface Dimension { width: number; height: number; }

export abstract class ResourceLoader {
  public src: string;
  public sourceDim: { width: number, height: number };
  public viewport: Viewport = { width: 0, height: 0, scale: 1, rotation: 0, x: 0, y: 0 };
  public minScale = 0;
  public maxScale = 4;
  public currentItem = 1;
  public totalItem = 1;
  public showItemsQuantity = false;
  public loaded = false;
  public loading = false;
  public rendering = false;

  protected _image;
  protected resourceChange = new Subject<string>();

  abstract setUp();
  abstract loadResource();

  public resetViewport(canvasDim: Dimension): boolean {
    if (!this.loaded || !canvasDim) { return; }

    const rotation = this.viewport ? this.viewport.rotation : 0;
    const inverted = toSquareAngle(rotation) / 90 % 2 !== 0;
    const canvas = {
      width: !inverted ? canvasDim.width : canvasDim.height,
      height: !inverted ? canvasDim.height : canvasDim.width
    };

    if (((canvas.height / this._image.height) * this._image.width) <= canvas.width) {
      this.viewport.scale = canvas.height / this._image.height;
    } else {
      this.viewport.scale = canvas.width / this._image.width;
    }
    this.minScale = this.viewport.scale / 4;
    this.maxScale = this.viewport.scale * 4;

    // start point to draw image
    this.viewport.width = this._image.width * this.viewport.scale;
    this.viewport.height = this._image.height * this.viewport.scale;
    this.viewport.x = (canvasDim.width - this.viewport.width) / 2;
    this.viewport.y = (canvasDim.height - this.viewport.height) / 2;
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    config: ImageViewerConfig,
    canvasDim: Dimension,
    drawCallbacks: Array<(ctx: CanvasRenderingContext2D) => void>,
    userDefinedButtons: Array<UserDefinedButton>,
    onFinish: (ctx, config, canvasDim) => void
  ) {
    // clear canvas
    ctx.clearRect(0, 0, canvasDim.width, canvasDim.height);

    // Draw background color;
    ctx.fillStyle = config.bgStyle;
    ctx.fillRect(0, 0, canvasDim.width, canvasDim.height);

    // draw image (transformed, rotate and scaled)
    if (!this.loading && this.loaded) {
      ctx.save();
      ctx.translate(this.viewport.x + this.viewport.width / 2, this.viewport.y + this.viewport.height / 2);
      ctx.rotate(this.viewport.rotation * Math.PI / 180);
      ctx.scale(this.viewport.scale, this.viewport.scale);
      ctx.translate(-this._image.width / 2, -this._image.height / 2);
      ctx.drawImage(this._image, 0, 0);

      // execute user defined draw callbacks
      if (drawCallbacks) {
        drawCallbacks.forEach((cb) => {
          cb(ctx);
        });
      }
      // draw user defined buttons on file
      if (userDefinedButtons) {
        ctx.restore();
        userDefinedButtons.forEach((btnObject) => {
          btnObject.button.drawAsPolygon(
            ctx,
            btnObject.button.accountForViewPort(btnObject.polygon, this.viewport, this._image)
          );
        });
      }
    } else {
      ctx.fillStyle = '#333';
      ctx.font = '25px Verdana';
      ctx.textAlign = 'center';
      ctx.fillText(config.loadingMessage || 'Loading...', canvasDim.width / 2, canvasDim.height / 2);
    }
    onFinish(ctx, config, canvasDim);
  }

  public onResourceChange() { return this.resourceChange.asObservable(); }
}

export function toSquareAngle(angle: number) {
  return 90 * ((Math.trunc(angle / 90) + (Math.trunc(angle % 90) > 45 ? 1 : 0)) % 4);
}
