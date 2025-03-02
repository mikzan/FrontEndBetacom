import { Component, OnInit } from '@angular/core';
import { OrdineService } from '../../servizi/ordine/ordine.service';
import { Router } from '@angular/router';
import { Ordine } from '../../interfacce/Ordine';
import { MatDialog } from '@angular/material/dialog';
import { PopUpComponent } from '../../dialog/pop-up/pop-up.component';
import { DialogConfermaComponent } from '../../dialog/dialog-conferma/dialog-conferma/dialog-conferma.component';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-ordini',
  standalone: false,
  templateUrl: './ordini.component.html',
  styleUrl: './ordini.component.css',
})
export class OrdiniComponent implements OnInit {
  constructor(
    private serv: OrdineService,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}
  idCliente: number = 0;
  msg: string = '';
  rc: boolean = true;
  isLoading: boolean;
  ordini: Ordine[];
  totale: number = 0;

  ngOnInit(): void {
    this.isLoading = true;
    this.idCliente = this.authService.getClienteIdSessione();
    this.serv.listaOrdini(this.idCliente).subscribe((r: any) => {
      if (r.rc) {
        this.ordini = r.dati;
      } else {
        this.rc = r.rc;
        this.msg = r.msg;
      }
    });
    this.isLoading = false;
  }

  eliminaOrdine(id: number) {
    this.isLoading = true;
    let request = {
      idOrdine: id,
    };
    const dialogRef = this.dialog.open(DialogConfermaComponent, {
      minWidth: '500px',
      data: {
        messaggio: 'Sei sicuro di voler eliminare il tuo ordine?',
      },
    });
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.serv.eliminaOrdine(request).subscribe((r: any) => {
          if (r.rc) {
            this.openDialog({ titolo: 'Conferma', msg: r.msg, reload: true });
          } else {
            this.openDialog({ titolo: 'Errore', msg: r.msg });
          }
        });
      }
    });

    // this.serv.eliminaOrdine(request).subscribe((r:any) => {
    //   this.msg = r.msg;
    //   this.rc = r.rc;

    //   this.router.navigate(['/profilo/ordini']).then(() => {
    //     setTimeout(() => {
    //       window.location.reload();
    //     }, 1500);
    //   });
    this.isLoading = false;
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
