import { Component, OnInit } from '@angular/core';
import { ProdottiService } from '../../servizi/prodotti/prodotti.service';
import { Router } from '@angular/router';
import { Prodotto } from '../../interfacce/Prodotto';
import { CarrelloService } from '../../servizi/carrello/carrello.service';
import { LoaderService } from '../../servizi/loader.service';
import { WishlistService } from '../../servizi/wishlist/wishlist.service';
import { PopUpComponent } from '../../dialog/pop-up/pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { catchError, retry } from 'rxjs';
import { error } from 'console';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-prodotti',
  standalone: false,
  templateUrl: './prodotti.component.html',
  styleUrl: './prodotti.component.css',
})
export class ProdottiComponent implements OnInit {
  response: any;
  data: Prodotto[];
  listaFormati: string[] = [];
  listaGeneri: string[] = [];
  listaArtisti: string[] = [];
  isLoading: boolean;
  filtriPresenti: boolean = false;
  idCliente: number = 0;
  cartBadge: { [idProdotto: number]: number } = {};
  pagine: number = 0;
  paginaCorrente = 0;
  wishlistId: number[] = [];

  constructor(
    private service: ProdottiService,
    private router: Router,
    private serviceCarrello: CarrelloService,
    private loader: LoaderService,
    private wishlistService: WishlistService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loader.loaderState.subscribe((state) => {
      this.isLoading = state;
    });
    this.idCliente = this.authService.getClienteIdSessione();
    this.getTuttiProdotti();
    this.getTuttiProdottiVetrina(1);

    this.getProdottiCarrello();
    this.caricaWishlist();
  }

  getProdottiCarrello() {
    if (
      !this.authService.isAuthenticated() ||
      this.authService.isAdminNotCliente()
    ) {
      return;
    }

    this.serviceCarrello.listaProdotti(this.idCliente).subscribe({
      next: (r: any) => {
        this.loader.startLoader();
        if (r.rc) {
          r.dati.prodotti.forEach((p: any) => {
            p.prodotto.prodottiCarrello.forEach((pc: any) => {
              if (p.id == pc.id) {
                this.cartBadge[p.prodotto.idProdotto] = pc.quantita;
              }
            });
          });
        }
        this.loader.stopLoader();
      },
      error: (err) => {
        this.router.navigate(['/error500']);
      },
    });
  }

  getTuttiProdotti() {
    this.loader.startLoader();
    this.service.listAll().subscribe((resp) => {
      this.response = resp;
      if (this.response.rc === true) {
        let data = this.response.dati;
        this.pagine = Math.round(data.length / 12);
      } else {
        this.openDialog(this.response);
      }
      this.loader.stopLoader();
    });
  }

  getTuttiProdottiVetrina(i: number) {
    this.loader.startLoader();
    this.service.listAllVetrina(i).subscribe((resp) => {
      this.response = resp;
      if (this.response.rc === true) {
        this.data = this.response.dati;
        this.paginaCorrente = i;
      } else {
        this.openDialog(this.response);
      }
      this.loader.stopLoader();
    });
  }

  dettagliProdotto(idProdotto: number) {
    this.router.navigate(['/dettaglio-prodotto', idProdotto]);
  }

  //Logica Filtri

  filtriMostrati() {
    this.filtriPresenti = true;
  }

  togliFiltri() {
    this.filtriPresenti = false;
    this.getTuttiProdotti();
  }

  // Logica dei Formati
  getFormati() {
    this.data?.forEach((p) => {
      this.listaFormati.push(p.formato);
    });

    this.listaFormati = [...new Set(this.listaFormati)];
  }

  prodottoPerFormato(formato: string) {
    this.filtriMostrati();
    this.isLoading = true;
    this.service.prodottoPerFormato(formato).subscribe((resp) => {
      this.response = resp;

      this.response.rc === true ? (this.data = this.response.dati) : null;
      this.isLoading = false;
    });
  }

  // Logica dei Generi
  getGeneri() {
    this.data?.forEach((p) => {
      this.listaGeneri.push(p.genere);
    });
    this.listaGeneri = [...new Set(this.listaGeneri)];
  }

  prodottoPerGenere(genere: string) {
    this.filtriMostrati();
    this.isLoading = true;
    this.service.prodottoPerGenere(genere).subscribe((resp) => {
      this.response = resp;

      this.response.rc === true ? (this.data = this.response.dati) : null;
      this.isLoading = false;
    });
  }

  // Logica degli artisti
  getArtisti() {
    this.data?.forEach((p) => {
      this.listaArtisti.push(p.artista);
    });
    this.listaArtisti = [...new Set(this.listaArtisti)];
  }

  prodottoPerArtista(artista: string) {
    this.filtriMostrati();
    this.isLoading = true;
    this.service.prodottoPerArtista(artista).subscribe((resp) => {
      this.response = resp;

      this.response.rc === true ? (this.data = this.response.dati) : null;
      this.isLoading = false;
    });
  }

  //Aggiungi prodotto al carrello
  aggiungiProdotto(idProdotto: number) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/signin']);
      return;
    }

    if (this.authService.isAdminNotCliente()) {
      this.openDialog({
        titolo: 'Errore',
        msg: 'Devi essere un cliente per aggiungere prodotti al carrello.',
      });
      return;
    }

    this.serviceCarrello
      .addProdotto({
        idProdotto: idProdotto,
        idCliente: this.idCliente,
        quantita: 1,
      })
      .subscribe((resp: any) => {
        if (resp.rc) {
          this.openDialog({ titolo: 'Conferma', msg: resp.msg, reload: true });
        } else {
          this.openDialog({ titolo: 'Errore', msg: resp.msg });
        }
      });
  }

  //Prodotti preferiti della wishlist
  preferitiWishlist(prodotto: Prodotto) {
    if (this.wishlistId.includes(prodotto.idProdotto)) {
      this.removeFromWishlist(prodotto);
    } else {
      this.addToWishlist(prodotto);
    }
  }

  addToWishlist(prodotto: Prodotto) {
    this.noAzioniPerAdminNonCliente();

    this.wishlistService
      .addProductToWishlist(this.idCliente, [prodotto.idProdotto])
      .subscribe({
        next: () => {
          this.wishlistId.push(prodotto.idProdotto);
          this.getTuttiProdotti();
        },
        error: (error) => {
          console.error("Errore durante l'aggiunta alla wishlist:", error);
        },
      });
  }

  removeFromWishlist(prodotto: Prodotto) {
    this.noAzioniPerAdminNonCliente();
    this.wishlistService
      .removeProductFromWishlist(this.idCliente, prodotto.idProdotto)
      .subscribe({
        next: () => {
          this.wishlistId = this.wishlistId.filter(
            (id) => id !== prodotto.idProdotto
          );
          this.getTuttiProdotti();
        },
        error: (error) => {
          console.error('Errore durante la rimozione dalla wishlist:', error);
        },
      });
  }

  caricaWishlist() {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.wishlistService.getWishlist(this.idCliente).subscribe({
      next: (data) => {
        this.wishlistId = data.dati.map((p: Prodotto) => p.idProdotto);
      },
      error: (error) => {
        console.error('Errore nel recupero della wishlist:', error);
      },
    });
  }

  openDialog(inputDialog: any) {
    this.dialog.open(PopUpComponent, {
      width: '400px',
      data: {
        titolo: inputDialog.titolo,
        msg: inputDialog.msg,
        reload: inputDialog.reload,
      },
    });
  }

  noAzioniPerAdminNonCliente(): void {
    if (this.authService.isAdminNotCliente()) {
      this.openDialog({
        titolo: 'Errore',
        msg: 'Devi essere un cliente per effettuare questa operazione.',
      });
      return;
    }
  }
}
