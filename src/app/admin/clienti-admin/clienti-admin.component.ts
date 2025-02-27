import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogUtenteComponent } from '../../dialog/dialog-utente/dialog-utente/dialog-utente.component';
import { ClienteService } from '../../servizi/cliente/cliente.service';
import { UtenteService } from '../../servizi/utente/utente.service';
import { DialogStringaComponent } from '../../dialog/dialog-stringa/dialog-stringa.component';
import { DialogConfermaComponent } from '../../dialog/dialog-conferma/dialog-conferma/dialog-conferma.component';
import { PopUpComponent } from '../../dialog/pop-up/pop-up.component';

@Component({
  selector: 'app-clienti-admin',
  templateUrl: './clienti-admin.component.html',
  styleUrls: ['./clienti-admin.component.css'],
  standalone: false,
})
export class ClientiAdminComponent {
  clienti: any[] = [];
  campoSelezionato: string = '';
  tipoRicerca: string = '';
  ruoloSelezionato: string = '';

  constructor(
    private clienteService: ClienteService,
    private utenteService: UtenteService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.caricaDatiClienti();
  }

  caricaDatiClienti(): void {
    this.clienteService.listAllClienti().subscribe(
      (response: any) => {
        if (response.rc === true && response.dati) {
          this.clienti = response.dati;
        } else {
          this.showPopUp('Errore', 'Impossibile caricare i dati dei clienti.');
        }
      },
      (errore) => {
        console.error('Errore nel caricamento dei clienti:', errore);
        this.showPopUp('Errore', 'Errore nel caricamento dei clienti.');
      }
    );
  }

  modificaCliente(idCliente: number): void {
    const cliente = this.clienti.find((c) => c.idCliente === idCliente);

    if (cliente) {
      const dialogRef = this.dialog.open(DialogUtenteComponent, {
        minWidth: '500px',
        data: { cliente },
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('Dialogo chiuso con risultato: ', result);
        this.caricaDatiClienti();
      });
    }
  }
  eliminaCliente(idCliente: number): void {
    const cliente = this.clienti.find((c) => c.idCliente === idCliente);
    if (cliente) {
      const clienteBody = { idCliente: cliente.idCliente };

      // Elimina il cliente
      this.clienteService.deleteCliente(clienteBody).subscribe(
        (response: any) => {
          console.log('Risposta eliminazione cliente: ', response); // Log della risposta
          if (response.rc === true) {
            console.log('Cliente eliminato con successo');

            // Rimuovi il cliente eliminato dalla lista
            this.clienti = this.clienti.filter(
              (c) => c.idCliente !== idCliente
            );

            // Mostra il pop-up di conferma
            this.showPopUp('Conferma', response.msg);
          } else {
            this.showPopUp(
              'Errore',
              "Errore durante l'eliminazione del cliente."
            );
          }
        },
        (errore) => {
          console.error("Errore durante l'eliminazione del cliente:", errore);
          this.showPopUp(
            'Errore',
            "Errore durante l'eliminazione del cliente."
          );
        }
      );
    }
  }

  cercaNome(): void {
    this.tipoRicerca = 'nome';
    this.openDialog();
  }

  cercaCognome(): void {
    this.tipoRicerca = 'cognome';
    this.openDialog();
  }

  cercaCap() {
    this.tipoRicerca = 'cap';
    this.openDialog();
  }

  cercaEmail() {
    this.tipoRicerca = 'email';
    this.openDialog();
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogStringaComponent, {
      minWidth: '500px',
      data: { nome: this.campoSelezionato, tipoRicerca: this.tipoRicerca },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.campoSelezionato = result;
      if (this.campoSelezionato) {
        console.log(
          `Hai cercato un ${this.tipoRicerca}: ${this.campoSelezionato}`
        );
        this.cercaClientiDopoCheck(this.campoSelezionato, this.tipoRicerca);
      }
    });
  }

  cercaProvincia() {
    this.tipoRicerca = 'provincia';
    this.openDialog();
  }

  cercaComune() {
    this.tipoRicerca = 'comune';
    this.openDialog();
  }

  cercaClientiDopoCheck(query: string, tipoRicerca: string): void {
    // Prepara i parametri per la ricerca
    let nome = tipoRicerca === 'nome' ? query : '';
    let cognome = tipoRicerca === 'cognome' ? query : '';
    let cap = tipoRicerca === 'cap' ? query : '';
    let provincia = tipoRicerca === 'provincia' ? query : '';
    let comune = tipoRicerca === 'comune' ? query : '';
    let email = tipoRicerca === 'email' ? query : '';

    if (tipoRicerca === 'email' || tipoRicerca === 'username') {
      this.utenteService.listAllUtenti(email).subscribe((response: any) => {
        if (response.rc === true && response.dati) {
          this.clienti = [];
          response.dati.forEach((utente: any) => {
            const idCliente = utente.cliente.idCliente;
            if (idCliente) {
              this.getClienteById(idCliente);
            }
          });
        } else {
          this.showPopUp('Errore', 'Nessun utente trovato.');
        }
      });
    } else {
      this.clienteService
        .listAllClienti(nome, cognome, cap, provincia, comune)
        .subscribe((response: any) => {
          if (response.rc === true && response.dati) {
            this.clienti = response.dati;
          } else {
            this.showPopUp('Errore', 'Nessun cliente trovato.');
          }
        });
    }
  }

  getClienteById(idCliente: number): void {
    this.clienteService.getCliente(idCliente).subscribe(
      (clienteResponse: any) => {
        if (clienteResponse.rc === true && clienteResponse.dati) {
          this.clienti.push(clienteResponse.dati);
        }
      },
      (errore) => {
        console.error(
          'Errore nel recupero del cliente per idCliente: ',
          idCliente,
          errore
        );
      }
    );
  }

  setRuolo(ruolo: string) {
    this.ruoloSelezionato = ruolo;
    this.utenteService.utentePerRuolo(ruolo).subscribe(
      (response: any) => {
        if (response.rc === true && response.dati) {
          const utenti = response.dati;
          this.clienti = [];
          utenti.forEach((utente: { cliente: { idCliente: number } }) => {
            const idCliente = utente.cliente.idCliente;
            if (idCliente) {
              this.clienteService.getCliente(idCliente).subscribe(
                (clienteResponse: any) => {
                  if (clienteResponse.rc === true && clienteResponse.dati) {
                    this.clienti.push(clienteResponse.dati);
                  }
                },
                (errore) => {
                  console.error(
                    'Errore nel recupero del cliente per idCliente: ',
                    idCliente,
                    errore
                  );
                }
              );
            }
          });
        }
      },
      (errore) => {
        console.error('Errore nel recupero degli utenti per ruolo: ', errore);
      }
    );
  }

  reset(): void {
    this.clienti = [];
    this.caricaDatiClienti();
  }

  showPopUp(titolo: string, messaggio: string): void {
    this.dialog.open(PopUpComponent, {
      width: '400px',
      data: {
        titolo: titolo,
        msg: messaggio,
        reload: false,
      },
    });
  }
}
