import { NgModule } from '@angular/core';
import { ImageViewerComponent } from './imageviewer.component';
import { IMAGEVIEWER_CONFIG, IMAGEVIEWER_CONFIG_DEFAULT } from './imageviewer.config';
import { HammerModule } from '@angular/platform-browser';

@NgModule({
  providers: [{ provide: IMAGEVIEWER_CONFIG, useValue: IMAGEVIEWER_CONFIG_DEFAULT }],
  imports: [HammerModule],
  declarations: [ImageViewerComponent],
  exports: [ImageViewerComponent],
})
export class ImageViewerModule { }
