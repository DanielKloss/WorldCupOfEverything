import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
<<<<<<< HEAD
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
=======
>>>>>>> e0c723bf6b58469b7e45758755af840a0914b137

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServerComponent } from './server/server.component';
import { HomeComponent } from './home/home.component';
import { ClientComponent } from './client/client.component';

@NgModule({
  declarations: [
    AppComponent,
    ServerComponent,
    HomeComponent,
    ClientComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
<<<<<<< HEAD
    FormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatListModule
=======
    FormsModule
>>>>>>> e0c723bf6b58469b7e45758755af840a0914b137
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
