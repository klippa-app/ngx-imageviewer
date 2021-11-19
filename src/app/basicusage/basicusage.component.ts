import {AfterViewInit, Component, ViewChild} from '@angular/core';
import { ImageViewerComponent, ButtonStyle, Point } from '@mxa30/ngx-imageviewer';

@Component({
  selector: 'app-basicusage',
  templateUrl: './basicusage.component.html'
})
export class BasicUsageComponent implements AfterViewInit {

  @ViewChild('imageViewerComponent') imageViewerComponent: ImageViewerComponent;
  samples = [
    { label: 'PDF Test', url: 'https://emazv72.github.io/ngx-imageviewer/pdf-test.pdf' },
    { label: 'Image 1 (BIG)', url: 'https://emazv72.github.io/ngx-imageviewer/assets/imgs/sample-0.jpg' },
    { label: 'Image 2', url: 'https://emazv72.github.io/ngx-imageviewer/assets/imgs/sample-1.jpg' },
    { label: 'Image 3', url: 'https://emazv72.github.io/ngx-imageviewer/assets/imgs/sample-2.jpg' },
    { label: 'Image 4', url: 'https://emazv72.github.io/ngx-imageviewer/assets/imgs/sample-3.jpg' },
    { label: 'Image 5', url: 'https://emazv72.github.io/ngx-imageviewer/assets/imgs/sample-4.jpg' },
    { label: 'Image 6', url: 'https://emazv72.github.io/ngx-imageviewer/assets/imgs/sample-5.jpg' }
  ];

  canvasWidth = 800;
  canvasHeight = 600;
  imageSrc = this.samples[0].url;
  showDrawings = true;

  constructor() {}

  ngAfterViewInit() {
    this.imageViewerComponent.onResourceChanged.subscribe(() => {
      this.imageViewerComponent.eraseAll();
      this.setupButton();
      this.setupRect();
    });
  }

  toggleDrawings(showDrawings) {
    if (showDrawings) {
      this.setupButton();
      this.setupRect();
    } else {
      this.imageViewerComponent.eraseAll();
    }
  }

  setupButton() {
    const buttonStyle: ButtonStyle = {
      alpha: 0.4,
      hoverAlpha: 0.8,
      bgStyle: '#5aed58',
      borderStyle: '#5aed58',
      borderWidth: 3,
    };
    const scaleFactor = 1652 / this.imageViewerComponent.getCurrentPageInfo().width;
    const polygon: Array<Point> = [
      {
        'x': 123 / scaleFactor,
        'y': 279 / scaleFactor
      },
      {
        'x': 206 / scaleFactor,
        'y': 279 / scaleFactor
      },
      {
        'x': 206 / scaleFactor,
        'y': 313 / scaleFactor
      },
      {
        'x': 123 / scaleFactor,
        'y': 313 / scaleFactor
      }
    ];

    const callback = (evt) => {
      console.log('Button pressed!');
      return false;
    };
    this.imageViewerComponent.drawButtonOnFile(polygon, null, buttonStyle, callback);
  }

  setupRect() {
    this.imageViewerComponent.drawOnFile((ctx: CanvasRenderingContext2D) => {
      ctx.save();
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(500, 500, 100, 100);
      ctx.restore();
    });
  }

  logSelectBox(event) {
    console.log('selected position on image', event);
  }
}
