import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Recensione } from '../../interfacce/Recensione';
import { RecensioneService } from '../../servizi/recensione/recensione.service';
import { MatDialog } from '@angular/material/dialog';
import { FormRecensioneComponent } from '../../dialog/form-recensione/form-recensione.component';
import { ProdottiService } from '../../servizi/prodotti/prodotti.service';
import { PopUpComponent } from '../../dialog/pop-up/pop-up.component';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-recensioni',
  standalone: false,
  templateUrl: './recensioni.component.html',
  styleUrl: './recensioni.component.css',
})
export class RecensioniComponent implements OnInit {
  constructor(
    private serv: RecensioneService,
    private serviceProdotto: ProdottiService,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  idCliente: number = 0;
  msg: string = '';
  rc: boolean = true;
  isLoading: boolean;
  recensioni: Recensione[];

  ngOnInit(): void {
    this.isLoading = true;
    this.idCliente = this.authService.getClienteIdSessione();
    this.serv.listaRecensioniUtente(this.idCliente).subscribe((r: any) => {
      if (r.rc) {
        this.recensioni = r.dati;
      }
      if (this.recensioni.length == 0) {
        this.openDialog({
          titolo: 'Attenzione',
          msg: 'Non hai ancora fatto acquisti da noi',
        });
      }
    });
    this.isLoading = false;
  }

  modificaRecensione(idRecensione: number | null, idProdotto: number | null) {
    this.isLoading = true;
    if (idRecensione != null) {
      this.openDialogModifica(idRecensione);
    } else {
      this.openDialogCreazione(idProdotto);
    }
    this.isLoading = false;
  }

  eliminaRecensione(id: number) {
    this.isLoading = true;
    let request = {
      idRecensione: id,
    };
    this.serv.eliminaRecensione(request).subscribe((r: any) => {
      if (r.rc) {
        this.openDialog({ titolo: 'Conferma', msg: r.msg, reload: true });
      } else {
        this.openDialog({ titolo: 'Errore', msg: r.msg });
      }
    });
    this.isLoading = false;
  }

  openDialogModifica(idRecensione: number) {
    this.serv.getRecensioneById(idRecensione).subscribe((resp) => {
      console.log(resp);
      this.dialog.open(FormRecensioneComponent, {
        width: '400px',
        data: { recensione: resp },
      });
    });
  }

  openDialogCreazione(idProdotto: number) {
    this.serviceProdotto.prodottoPerId(idProdotto).subscribe((resp) => {
      this.dialog.open(FormRecensioneComponent, {
        width: '400px',
        data: { prodotto: resp },
      });
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
}
