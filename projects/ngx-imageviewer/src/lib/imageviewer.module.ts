import {NgModule} from '@angular/core';
import {ImageViewerComponent} from './imageviewer.component';
import {IMAGEVIEWER_CONFIG, IMAGEVIEWER_CONFIG_DEFAULT} from './imageviewer.config';
import {HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerModule} from '@angular/platform-browser';

export class HammerConfig extends HammerGestureConfig {
  // This configuration makes the (pan) event trigger after 1px of movement instead of 10px. It makes the UX more responsive.
  overrides = {pan: {threshold: 1}};
}

@NgModule({
  providers: [
    { provide: IMAGEVIEWER_CONFIG, useValue: IMAGEVIEWER_CONFIG_DEFAULT },
    {provide: HAMMER_GESTURE_CONFIG, useClass: HammerConfig}
  ],
  imports: [HammerModule],
  declarations: [ImageViewerComponent],
  exports: [ImageViewerComponent],
})
export class ImageViewerModule { }
