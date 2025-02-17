import { Component, OnInit } from '@angular/core';
import { CarrelloService } from '../../servizi/carrello/carrello.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carrello',
  standalone: false,
  templateUrl: './carrello.component.html',
  styleUrl: './carrello.component.css',
})
export class CarrelloComponent implements OnInit {
  prodotti: any;
  totale: number = 0;
  idCliente = 1;
  msg: string = '';
  rc: boolean = true;
  isLoading: boolean;

  constructor(private serv: CarrelloService, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.serv.listaProdotti(this.idCliente).subscribe((r: any) => {
      if (r.rc) {
        this.totale = r.dati.totale;
        if (this.totale == 0) {
          this.rc = false;
          this.msg= "Il carrello è vuoto, inizia a fare acquisti da noi!"
        } else {
          this.prodotti = r.dati.prodotti;
        }
      } else {
        this.rc = r.rc;
        this.msg = r.msg;
      }
      this.isLoading = false
    });
  }

  svuotaCarrello() {
    let request = {
      idCliente: this.idCliente,
    };
    this.serv.svuotaCarrello(request).subscribe((r: any) => {
      this.msg = r.msg;
      this.rc = r.rc;
      this.router.navigate(['/carrello']).then(() => {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      });
    });
  }

  dettagliProdotto(idProdotto: number) {
    this.router.navigate(['/dettaglio-prodotto', idProdotto]);
  }

  rimuoviProdotto(idProdotto: number) {
    let request = {
      idCliente : this.idCliente,
      idProdotto : idProdotto,
      quantita: 1
    }
    this.serv.removeProdotto(request).subscribe((r:any) => {
      this.msg = r.msg;
      this.rc = r.rc;
      this.router.navigate(['/carrello']).then(() => {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      });
    })
  }

  aggiungiProdotto(idProdotto: number) {
    let request = {
      idCliente : this.idCliente,
      idProdotto : idProdotto,
      quantita: 1
    }
    this.serv.addProdotto(request).subscribe((r:any) => {
      this.msg = r.msg;
      this.rc = r.rc;
      this.router.navigate(['/carrello']).then(() => {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      });
    })
  }

  eliminaProdotto(idProdotto: number, quantita: number){
    let request = {
      idCliente : this.idCliente,
      idProdotto : idProdotto,
      quantita: quantita
    }
    this.serv.removeProdotto(request).subscribe((r:any) => {
      this.msg = r.msg;
      this.rc = r.rc;
      this.router.navigate(['/carrello']).then(() => {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      });
    })
  }
}
