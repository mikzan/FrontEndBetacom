import { Component, OnInit } from '@angular/core';
import { CarrelloService } from '../../servizi/carrello/carrello.service';
import { Router } from '@angular/router';
import { ProdottoCarrello } from '../../interfacce/ProdottoCarrello';
import { PopUpComponent } from '../../dialog/pop-up/pop-up.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-carrello',
  standalone: false,
  templateUrl: './carrello.component.html',
  styleUrl: './carrello.component.css',
})
export class CarrelloComponent implements OnInit {
  prodottiCarrello: ProdottoCarrello[];
  totale: number = 0;
  idCliente = +localStorage.getItem('idCliente')!;
  msg: string = '';
  rc: boolean = true;
  isLoading: boolean;

  constructor(private serv: CarrelloService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.serv.listaProdotti(this.idCliente).subscribe({
      next: (r: any) => {
        if (r.rc) {
          this.totale = r.dati.totale;
          if (this.totale == 0) {
            this.rc = false;
          } else {
            this.prodottiCarrello = r.dati.prodotti;
          }
        } else {
          this.rc = r.rc;
        }
        
        this.isLoading = false
    }, error: (err) => {
      this,this.router.navigate(['/error500']);
    }
  });
  }

  svuotaCarrello() {
    let request = {
      idCliente: this.idCliente,
    };
    this.serv.svuotaCarrello(request).subscribe((r: any) => {
      if (r.rc) {
        this.openDialog({titolo: "Conferma", msg : r.msg, reload : true })
      } else {
        this.openDialog({titolo: "Errore", msg : r.msg })
      }
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
      if (r.rc) {
        this.openDialog({titolo: "Conferma", msg : r.msg, reload : true })
      } else {
        this.openDialog({titolo: "Errore", msg : r.msg })
      }
    })
  }

  aggiungiProdotto(idProdotto: number) {
    let request = {
      idCliente : this.idCliente,
      idProdotto : idProdotto,
      quantita: 1
    }
    this.serv.addProdotto(request).subscribe((r:any) => {
      if (r.rc) {
        this.openDialog({titolo: "Conferma", msg : r.msg, reload : true })
      } else {
        this.openDialog({titolo: "Errore", msg : r.msg })
      }
    })
  }

  eliminaProdotto(idProdotto: number, quantita: number){
    let request = {
      idCliente : this.idCliente,
      idProdotto : idProdotto,
      quantita: quantita
    }
    this.serv.removeProdotto(request).subscribe((r:any) => {
      if (r.rc) {
        this.openDialog({titolo: "Conferma", msg : r.msg, reload : true })
      } else {
        this.openDialog({titolo: "Errore", msg : r.msg })
      }
    })
  }

  ordina(){
    this.router.navigate(['carrello/checkout']);
  }

  openDialog(inputDialog: any) {
    this.dialog.open(PopUpComponent, {
      width: '400px',
      data: { titolo: inputDialog.titolo,
        msg: inputDialog.msg,
        reload: inputDialog.reload },
    });
  }
}
