import { Component, OnInit } from '@angular/core';
import { ProdottiService } from '../../servizi/prodotti/prodotti.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Prodotto } from '../../interfacce/Prodotto';
import { response } from 'express';
import { CarrelloService } from '../../servizi/carrello/carrello.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoaderService } from '../../servizi/loader.service';
import { PopUpComponent } from '../../dialog/pop-up/pop-up.component';
import { MatDialog } from '@angular/material/dialog';
import { WishlistService } from '../../servizi/wishlist/wishlist.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-dettaglio-prodotto',
  standalone: false,
  templateUrl: './dettaglio-prodotto.component.html',
  styleUrl: './dettaglio-prodotto.component.css',
})
export class DettaglioProdottoComponent implements OnInit {
  idProdotto: number;
  prodottoSelezionato: Prodotto;
  recensioni: [];
  isLoading: boolean;
  response: any;
  qnt: number;
  idCliente: number = 0;
  qntForm: FormGroup;
  stelle: number = 0;
  cartBadge: { [idProdotto: number]: number } = {};
  wishlistId: number[] = [];
  isInWishlist: boolean = false;

  constructor(
    private service: ProdottiService,
    private route: ActivatedRoute,
    private serviceCarrello: CarrelloService,
    private formBuilder: FormBuilder,
    private loader: LoaderService,
    private wishlistService: WishlistService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    this.idProdotto = +this.route.snapshot.paramMap.get('idProdotto')!;
  }

  ngOnInit(): void {
    this.loader.loaderState.subscribe((state) => {
      this.isLoading = state;
    });
    this.idCliente = this.authService.getClienteIdSessione();
    this.qntForm = this.formBuilder.group({
      qnt: 0,
    });

    this.getProdotto();
    this.getProdottiCarrello();
    this.caricaWishlist();
  }

  getProdottiCarrello() {
    this.serviceCarrello.listaProdotti(this.idCliente).subscribe((r: any) => {
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
    });
  }

  getProdotto() {
    this.loader.startLoader();
    this.service.prodottoPerId(this.idProdotto).subscribe((resp) => {
      console.log('Response ricevuta:', resp);
      this.response = resp;

      if (this.response.rc === true) {
        this.prodottoSelezionato = this.response.dati[0];

        this.recensioni = this.response.dati[0].recensioni;
        if (this.recensioni.length == 0) {
          this.stelle = 0;
        } else {
          this.stelle =
            this.recensioni?.reduce((sum, r: any) => sum + r.stelle, 0) || 0;
          this.stelle = Math.round(this.stelle / this.recensioni.length);
          console.log(this.stelle);
        }
        this.qnt = this.prodottoSelezionato.quantita;
      }
      this.loader.stopLoader();
    });
  }

  aggiungiProdotto() {
    if (this.qntForm.value.qnt > 0) {
      let request = {
        idCliente: this.idCliente,
        idProdotto: this.idProdotto,
        quantita: this.qntForm.value.qnt,
      };

      this.serviceCarrello.addProdotto(request).subscribe((r: any) => {
        if (r.rc) {
          this.openDialog({ titolo: 'Conferma', msg: r.msg, reload: true });
        } else {
          this.openDialog({ titolo: 'Errore', msg: r.msg });
        }
      });
    }
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

  //WISHLIST
  addToWishlist(prodotto: Prodotto) {
    this.wishlistService
      .addProductToWishlist(this.idCliente, [prodotto.idProdotto])
      .subscribe({
        next: () => {
          this.wishlistId.push(prodotto.idProdotto);
          this.getProdotto();
        },
        error: (error) => {
          console.error("Errore durante l'aggiunta alla wishlist:", error);
        },
      });
  }

  removeFromWishlist(prodotto: Prodotto) {
    console.log('Tentativo di rimozione dalla wishlist:', prodotto.idProdotto);

    this.wishlistService
      .removeProductFromWishlist(this.idCliente, prodotto.idProdotto)
      .subscribe({
        next: (response) => {
          console.log('Risposta dal server:', response);

          if (response.rc === true) {
            console.log('Prodotto rimosso con successo dalla wishlist');

            this.wishlistId = this.wishlistId.filter(
              (id) => id !== prodotto.idProdotto
            );

            console.log('Nuova lista wishlistId:', this.wishlistId);

            this.caricaWishlist();
          } else {
            console.warn('Errore nella rimozione:', response.msg);
          }
        },
        error: (error) => {
          console.error(
            'Errore nella chiamata API removeProductFromWishlist:',
            error
          );
        },
      });
  }

  caricaWishlist() {
    this.wishlistService.getWishlist(this.idCliente).subscribe({
      next: (data) => {
        this.wishlistId = data.dati.map((p: Prodotto) => p.idProdotto);
      },
      error: (error) => {
        console.error('Errore nel recupero della wishlist:', error);
      },
    });
  }
}
