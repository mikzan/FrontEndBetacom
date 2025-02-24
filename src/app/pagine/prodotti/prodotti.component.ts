import { Component, OnInit } from '@angular/core';
import { ProdottiService } from '../../servizi/prodotti/prodotti.service';
import { Router } from '@angular/router';
import { Prodotto } from '../../interfacce/Prodotto';
import { CarrelloService } from '../../servizi/carrello/carrello.service';
import { LoaderService } from '../../servizi/loader.service';
import { WishlistService } from '../../servizi/wishlist/wishlist.service';
import { Wishlist } from '../../interfacce/Wishlist';

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
  idCliente = +localStorage.getItem('idCliente')!;
  cartBadge: { [idProdotto: number]: number } = {};

  constructor(
    private service: ProdottiService,
    private route: Router,
    private serviceCarrello: CarrelloService,
    private loader: LoaderService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.loader.loaderState.subscribe((state) => {
      this.isLoading = state;
    });
    this.getTuttiProdotti();
    this.getProdottiCarrello();
  }

  getProdottiCarrello() {
    this.serviceCarrello.listaProdotti(this.idCliente).subscribe((r: any) => {
      this.loader.startLoader();
      if (r.rc) {
        r.dati.prodotti.forEach((p: any) => {
          p.prodotto.prodottiCarrello.forEach((pc:any) =>{
            if (p.id == pc.id) {
              this.cartBadge[p.prodotto.idProdotto] = pc.quantita
            }
          })
        });
      }
      this.loader.stopLoader();
    });
  }

  getTuttiProdotti() {
    this.loader.startLoader();
    this.service.listAll().subscribe((resp) => {
      this.response = resp;
      if (this.response.rc === true) {
        this.data = this.response.dati;
      }
      this.loader.stopLoader();
    });
  }

  dettagliProdotto(idProdotto: number) {
    this.route.navigate(['/dettaglio-prodotto', idProdotto]);
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
    this.serviceCarrello
      .addProdotto({
        idProdotto: idProdotto,
        idCliente: this.idCliente,
        quantita: 1,
      })
      .subscribe((resp) => {
        this.response = resp;
      });
  }


  addToWishlist(prodotto: Prodotto): void {
    console.log('Adding product to wishlist:', prodotto);
    const idCliente = +localStorage.getItem('idCliente')!;
    this.wishlistService.addProductToWishlist(idCliente, [prodotto.idProdotto]).subscribe({
      next: (response) => {
        console.log('Prodotto aggiunto alla wishlist:', response);
      },
      error: (error) => {
        console.error('Errore durante l\'aggiunta alla wishlist:', error);
      }
    });
  }

  removeFromWishlist(prodotto: Prodotto): void {
    console.log('Removing product from wishlist:', prodotto);
    const idCliente = +localStorage.getItem('idCliente')!;
    this.wishlistService.removeProductFromWishlist(idCliente, prodotto.idProdotto).subscribe({
      next: (response) => {
        console.log('Prodotto rimosso dalla wishlist:', response);
        // Eventualmente aggiorna la lista dei prodotti per riflettere lo stato
      },
      error: (error) => {
        console.error('Errore durante la rimozione dalla wishlist:', error);
      }
    });
  }

}
