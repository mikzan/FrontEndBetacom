import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './componenti/navbar/navbar.component';
import { FooterComponent } from './componenti/footer/footer.component';
import { HomeComponent } from './pagine/home/home.component';
import { ProdottiComponent } from './pagine/prodotti/prodotti.component';
import { ProfiloComponent } from './pagine/profilo/profilo.component';
import { DettaglioProdottoComponent } from './pagine/dettaglio-prodotto/dettaglio-prodotto.component';
import { RecensioneComponent } from './componenti/recensione/recensione.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CarrelloComponent } from './pagine/carrello/carrello.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    ProdottiComponent,
    ProfiloComponent,
    DettaglioProdottoComponent,
    RecensioneComponent,
    DashboardComponent,
    CarrelloComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatAccordion, MatExpansionModule
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
