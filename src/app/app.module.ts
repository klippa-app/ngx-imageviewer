import {BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { GettingStartedComponent } from './gettingstarted/gettingstarted.component';
import { SharedModule } from './shared/shared.module';
import { BasicUsageComponent } from './basicusage/basicusage.component';
import { AutoResizeComponent } from './autoresize/autoresize.component';
import { UploadPreviewComponent } from './uploadpreview/uploadpreview.component';
import { ConditionalDisplayComponent } from './conditionaldisplay/conditionaldisplay.component';

import { HammerModule } from '@angular/platform-browser';

export class HammerConfig extends HammerGestureConfig {
  // This configuration makes the (pan) event trigger after 1px of movement instead of 10px. It makes the UX more responsive.
  overrides = {pan: {threshold: 1}};
}

@NgModule({
  declarations: [
    AppComponent,
    GettingStartedComponent,
    BasicUsageComponent,
    AutoResizeComponent,
    UploadPreviewComponent,
    ConditionalDisplayComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    HammerModule
  ],
  providers: [{provide: HAMMER_GESTURE_CONFIG, useClass: HammerConfig}],
  bootstrap: [AppComponent]
})
export class AppModule { }
