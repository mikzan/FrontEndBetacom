import { Component, OnInit } from '@angular/core';
import { ProdottiService } from '../../servizi/prodotti/prodotti.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Prodotto } from '../../interfacce/Prodotto';
import { response } from 'express';
import { CarrelloService } from '../../servizi/carrello/carrello.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoaderService } from '../../servizi/loader.service';

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
  idCliente = +localStorage.getItem('idCliente')!;
  qntForm: FormGroup;
  stelle: number = 0;
  cartBadge: { [idProdotto: number]: number } = {};

  constructor(
    private service: ProdottiService,
    private route: ActivatedRoute,
    private serviceCarrello: CarrelloService,
    private formBuilder: FormBuilder,
    private loader: LoaderService
  ) {
    this.idProdotto = +this.route.snapshot.paramMap.get('idProdotto')!;
  }

  ngOnInit(): void {
    this.loader.loaderState.subscribe((state) => {
      this.isLoading = state;
    });
    this.qntForm = this.formBuilder.group({
      qnt: 0,
    });

    this.getProdotto();
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
        // this.msg = r.msg;
        // this.rc = r.rc;
        // this.router.navigate(['/carrello']).then(() => {
        //   setTimeout(() => {
        //     window.location.reload();
        //   }, 1500);
        // });
      });
    }
  }
}
