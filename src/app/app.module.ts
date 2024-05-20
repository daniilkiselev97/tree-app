import { NgDompurifySanitizer } from "@tinkoff/ng-dompurify";
import { TuiRootModule, TuiDialogModule, TuiAlertModule, TUI_SANITIZER } from "@taiga-ui/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from '@angular/common/http';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TuiCheckboxLabeledModule, TuiInputModule, TuiTreeModule} from '@taiga-ui/kit';
import {TuiMapperPipeModule} from '@taiga-ui/cdk';
import { RecursiveComponent } from './recursive/recursive.component';
import { StackComponent } from './stack/stack.component';
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";




@NgModule({
  declarations: [
    AppComponent,
    RecursiveComponent,
    StackComponent,
  ],
  imports: [
    	BrowserModule,
      BrowserAnimationsModule,
      TuiRootModule,
      TuiDialogModule,
      TuiAlertModule,
			TuiTreeModule,
			HttpClientModule,
			FormsModule,
			ReactiveFormsModule,
			TuiCheckboxLabeledModule,
			TuiMapperPipeModule,
			TuiInputModule,
			AppRoutingModule
],
  providers: [{provide: TUI_SANITIZER, useClass: NgDompurifySanitizer}],
  bootstrap: [AppComponent]
})
export class AppModule { }
