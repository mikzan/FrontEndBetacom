import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pagine/home/home.component';
import { CarrelloComponent } from './pagine/carrello/carrello.component';
import { ProfiloComponent } from './pagine/profilo/profilo.component';
import { ProdottiComponent } from './pagine/prodotti/prodotti.component';
import { DettaglioProdottoComponent } from './pagine/dettaglio-prodotto/dettaglio-prodotto.component';
import { WishlistComponent } from './componenti/wishlist/wishlist.component';
import { Pagina404Component } from './pagine/pagina404/pagina404.component';
import { SigninComponent } from './pagine/signin/signin.component';
import { CheckoutComponent } from './pagine/checkout/checkout.component';
import { PaginaCarrelloComponent } from './pagine/pagina-carrello/pagina-carrello.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CreaProdottoComponent } from './admin/crea-prodotto/crea-prodotto.component';
import { OrdiniComponent } from './pagine/ordini/ordini.component';
import { RecensioniComponent } from './pagine/recensioni/recensioni.component';
import { RegistrazioneComponent } from './pagine/registrazione/registrazione.component';
import { OrdiniAdminComponent } from './admin/ordini-admin/ordini-admin.component';
import { AuthGuard } from './auth/auth.guard';
import { Pagina403Component } from './pagine/pagina403/pagina403.component';
import { ClientiAdminComponent } from './admin/clienti-admin/clienti-admin.component';
import { ModificaProdottoComponent } from './admin/modifica-prodotto/modifica-prodotto.component';
import { ProdottiAdminComponent } from './admin/prodotti-admin/prodotti-admin.component';
import { CambiaPasswordComponent } from './pagine/cambia-password/cambia-password/cambia-password.component';
import { CreaAdminComponent } from './admin/crea-admin/crea-admin/crea-admin.component';
import { WelcomePageComponent } from './admin/welcome-page/welcome-page.component';
import { RegistraUtenteAdminComponent } from './admin/registra-utente-admin/registra-utente-admin.component';
import { AssociaClienteComponent } from './admin/associa-cliente/associa-cliente.component';
import { CancellaAccountComponent } from './pagine/cancella-account/cancella-account/cancella-account.component';
import { Pagina500Component } from './pagine/pagina500/pagina500.component';
import { PaginaCarrelloVuotoComponent } from './pagine/pagina-carrello-vuoto/pagina-carrello-vuoto.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'registrazione', component: RegistrazioneComponent },
  {
    path: 'carrello',
    data: { roles: ['UTENTE', 'ADMIN'] },
    component: PaginaCarrelloComponent,
    children: [
      { path: '', component: CarrelloComponent },
      { path: 'checkout', component: CheckoutComponent },
    ],
  },
  { path: 'carrello-guest', component: PaginaCarrelloVuotoComponent },
  { path: 'prodotti', component: ProdottiComponent },
  {
    path: 'admin/dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'welcome-page', pathMatch: 'full' },
      { path: 'crea-prodotto', component: CreaProdottoComponent },
      { path: 'ordini', component: OrdiniAdminComponent },
      { path: 'clienti', component: ClientiAdminComponent },
      { path: 'modifica-prodotto', component: ModificaProdottoComponent },
      { path: 'prodotti-admin', component: ProdottiAdminComponent },
      { path: 'crea-admin', component: CreaAdminComponent },
      { path: 'welcome-page', component: WelcomePageComponent },
      {
        path: 'registra-utente-admin',
        component: RegistraUtenteAdminComponent,
      },
    ],
  },
  {
    path: 'admin/associa-cliente',
    component: AssociaClienteComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] },
  },

  {
    path: 'dettaglio-prodotto/:idProdotto',
    component: DettaglioProdottoComponent,
  },
  {
    path: 'profilo',
    component: ProfiloComponent,
    canActivate: [AuthGuard],
    data: { roles: ['UTENTE', 'ADMIN'] },
  },
  {
    path: 'cambia-password',
    component: CambiaPasswordComponent,
    canActivate: [AuthGuard],
    data: { roles: ['UTENTE', 'ADMIN'] },
  },
  {
    path: 'elimina-account',
    component: CancellaAccountComponent,
    canActivate: [AuthGuard],
    data: { roles: ['UTENTE', 'ADMIN'] },
  },
  {
    path: 'profilo/ordini',
    component: OrdiniComponent,
    canActivate: [AuthGuard],
    data: { roles: ['UTENTE', 'ADMIN'] },
  },
  {
    path: 'profilo/recensioni',
    component: RecensioniComponent,
    canActivate: [AuthGuard],
    data: { roles: ['UTENTE', 'ADMIN'] },
  },
  {
    path: 'wishlist',
    component: WishlistComponent,
    canActivate: [AuthGuard],
    data: { roles: ['UTENTE', 'ADMIN'] },
  },
  { path: 'forbidden', component: Pagina403Component },
  { path: 'error500', component: Pagina500Component },
  { path: '**', component: Pagina404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
