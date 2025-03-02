import { ClienteService } from './../../servizi/cliente/cliente.service';
import { Component, Input, OnInit } from '@angular/core';
import { WishlistService } from '../../servizi/wishlist/wishlist.service';
import { Prodotto } from '../../interfacce/Prodotto';
import { CarrelloService } from '../../servizi/carrello/carrello.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-wishlist',
  standalone: false,
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
})
export class WishlistComponent implements OnInit {
  wishlist: Prodotto[] = [];
  isLoading: boolean = true;
  currentUserId: number | null = null;
  wishlistNonEsiste: boolean = false;
  nomeCliente: string | null = null;

  @Input() prodotto: Prodotto;
  @Input() responsive: boolean;
  cartBadge: { [idProdotto: number]: number } = {};

  constructor(
    private wishlistService: WishlistService,
    private carrelloService: CarrelloService,
    private clientService: ClienteService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.inizializzaWishlist();
    this.recuperaCliente();
  }

  inizializzaWishlist(): void {
    const storedUserId = this.authService.getClienteIdSessione();

    if (storedUserId) {
      this.currentUserId = +storedUserId;
      this.checkOrCreateWishlist();
    } else {
      console.error('Nessun utente loggato trovato.');
      this.isLoading = false;
    }
  }

  checkOrCreateWishlist(): void {
    if (!this.currentUserId) {
      console.error('Errore: Nessun utente loggato.');
      return;
    }

    this.wishlistService.getWishlist(this.currentUserId).subscribe({
      next: (data) => {
        if (data && Array.isArray(data.dati) && data.dati.length > 0) {
          this.wishlist = data.dati;
          this.wishlistNonEsiste = false;
        } else {
          console.log('Wishlist non trovata.');
          this.wishlistNonEsiste = true;
        }
      },
      error: (error) => {
        console.error('Errore nel recupero della wishlist:', error);
        if (error.status === 500) {
          console.error(
            'Errore interno del server. Potrebbe esserci un problema con il backend.'
          );
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  createWishlist(): void {
    if (!this.currentUserId) {
      console.error('Nessun utente loggato.');
      return;
    }

    this.wishlistService.createWishlist(this.currentUserId).subscribe({
      next: (response) => {
        console.log('Wishlist creata con successo:', response);
        this.wishlist = [];
        this.wishlistNonEsiste = false;
      },
      error: (error) => {
        console.error('Errore durante la creazione della wishlist:', error);
      },
    });
  }

  addToCarrello(prodotto: Prodotto): void {
    let request = {
      idCliente: this.currentUserId,
      idProdotto: prodotto.idProdotto,
      quantita: 1,
    };

    this.carrelloService.addProdotto(request).subscribe({
      next: (response) => {
        console.log('Prodotto aggiunto al carrello:', response);
        this.removeFromWishlist(prodotto);
      },
      error: (error) => {
        console.error("Errore durante l'aggiunta al carrello:", error);
      },
    });
  }

  removeFromWishlist(prodotto: Prodotto): void {
    console.log('Rimuovo prodotto con idProdotto:', prodotto.idProdotto);
    this.wishlistService
      .removeProductFromWishlist(this.currentUserId, prodotto.idProdotto)
      .subscribe({
        next: () => {
          this.wishlist = this.wishlist.filter(
            (item) => item.idProdotto !== prodotto.idProdotto
          );
          this.inizializzaWishlist();
          console.log('Prodotto rimosso dalla wishlist nel DB');
        },
        error: (error) => {
          console.error(
            'Errore durante la rimozione del prodotto dalla wishlist:',
            error
          );
        },
      });
  }

  trackById(index: number, item: Prodotto): number {
    return item.idProdotto;
  }

  clearAllFromWishlist(): void {
    if (!this.currentUserId) {
      console.error('Nessun utente loggato.');
      return;
    }

    console.log('Svuoto la wishlist per idCliente:', this.currentUserId);
    this.wishlistService.clearAllWishlist(this.currentUserId).subscribe({
      next: (response) => {
        console.log('Risposta dal server:', response);
        this.wishlist = [];
        console.log(
          'Tutti i prodotti sono stati rimossi dalla wishlist nel DB'
        );
      },
      error: (error) => {
        console.error('Errore durante lo svuotamento della wishlist:', error);
      },
    });
  }
  recuperaCliente(): void {
    const idCliente = this.currentUserId;

    if (idCliente) {
      this.clientService.getCliente(idCliente).subscribe(
        (response: any) => {
          // Controlla e assegna "nome" dalla risposta, considerando che "rc" e "dati" sono presenti.
          if (response.rc && response.dati) {
            this.nomeCliente = response.dati.nome; // Aggiunto "dati" e "nome"
            console.log('Nome Cliente Recuperato:', this.nomeCliente);
          } else {
            console.error('Formato della risposta cliente non valido.');
          }
        },
        (error) => {
          console.error('Errore nel recupero del cliente:', error);
        }
      );
    } else {
      console.error('ID cliente non disponibile.');
    }
  }
}
