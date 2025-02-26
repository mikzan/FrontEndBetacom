import { Component } from '@angular/core';
import { ClienteService } from '../../../servizi/cliente/cliente.service';
import { UtenteService } from '../../../servizi/utente/utente.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { MailService } from '../../../servizi/mail/mail.service';
import { ProfiloService } from '../../../servizi/profilo/profilo.service';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogConfermaComponent } from '../../../dialog/dialog-conferma/dialog-conferma/dialog-conferma.component';
import { Observable, catchError, of, switchMap } from 'rxjs';
import { PopUpComponent } from '../../../dialog/pop-up/pop-up.component';

@Component({
  selector: 'app-associa-cliente',
  standalone: false,
  templateUrl: './associa-cliente.component.html',
  styleUrls: ['./associa-cliente.component.css'],
})
export class AssociaClienteComponent {
  clienteId: number = 0;
  utenteId: number = 0;
  clienteForm!: FormGroup;
  dataRegistrazione: string = localStorage.getItem('dataRegistrazione');
  immagineDefault: string =
    'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
  passwordVisibile: boolean = false;
  randomPassword: string = '';

  constructor(
    private clienteService: ClienteService,
    private utenteService: UtenteService,
    private router: Router,
    private authService: AuthService,
    private mailService: MailService,
    private profiloService: ProfiloService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.inizializzaForm();
    console.log('Componente AssociaCliente inizializzato');
  }

  inizializzaForm(): void {
    console.log('Inizializzazione del form Cliente');
    this.clienteForm = new FormGroup({
      nome: new FormControl('', [Validators.required]),
      cognome: new FormControl('', [Validators.required]),
      immagineCliente: new FormControl(''),
      telefono: new FormControl('', [Validators.required]),
      via: new FormControl('', [Validators.required]),
      comune: new FormControl('', [Validators.required]),
      provincia: new FormControl('', [Validators.required]),
      cap: new FormControl('', [Validators.required]),
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

  onSubmit(): void {
    console.log('Submit del form cliente');
    this.creaClienteEAssociaIdCliente();
  }

  creaClienteEAssociaIdCliente(): void {
    console.log('Creazione cliente e associazione idCliente...');
    const clienteFormData = this.creaClienteFormData();

    this.clienteService
      .createCliente(clienteFormData)
      .pipe(
        switchMap((clienteResponse: any) => {
          console.log('Risposta dalla creazione del cliente:', clienteResponse);

          const clienteId = clienteResponse?.dati?.idCliente;
          if (!clienteId) {
            console.error('Errore: idCliente non trovato nella risposta');
            throw new Error('idCliente non trovato nella risposta');
          }

          console.log('idCliente ottenuto:', clienteId);
          return this.associaIdClienteAUtente(clienteId);
        }),
        catchError((errore) => {
          console.error(
            'Errore durante la creazione cliente o aggiornamento utente:',
            errore
          );
          return this.gestisciErrore(
            errore,
            'Errore durante la creazione cliente o aggiornamento utente:'
          );
        })
      )
      .subscribe((utenteResponse) => {
        console.log("Risposta dopo l'associazione utente:", utenteResponse);
        this.gestisciRispostaRegistrazione(utenteResponse);
      });
  }

  creaClienteFormData(): any {
    console.log('Creazione dei dati del cliente per la registrazione');
    return {
      nome: this.clienteForm.value.nome,
      cognome: this.clienteForm.value.cognome,
      immagineCliente:
        this.clienteForm.value.immagineCliente || this.immagineDefault,
      telefono: this.clienteForm.value.telefono,
      via: this.clienteForm.value.via,
      comune: this.clienteForm.value.comune,
      provincia: this.clienteForm.value.provincia,
      cap: this.clienteForm.value.cap,
    };
  }

  associaIdClienteAUtente(clienteId: number): Observable<any> {
    console.log(
      'Associazione idCliente:',
      clienteId,
      'con utente:',
      localStorage.getItem('idUtente')
    );
    const utenteUpdateForm = {
      idCliente: clienteId,
      idUtente: localStorage.getItem('idUtente'),
      email: 'riccardobelloni98@gmail.com',
      username: localStorage.getItem('username'),
    };

    return this.utenteService.updateUtente(utenteUpdateForm);
  }

  gestisciRispostaRegistrazione(utenteResponse: any): void {
    if (utenteResponse) {
      console.log('Associazione completata con successo');
      this.inviaEmailRegistrazione();
      this.openDialog({
        titolo: 'Conferma',
        msg: 'Cliente associato correttamente.Fai logout per accedere alla funzionalità',
        reload: true,
      });
      this.router.navigate(['/']);
    } else {
      console.log("Non è stato possibile associare il cliente all'utente");
      this.openDialog({
        titolo: 'Errore',
        msg: utenteResponse.msg,
        reload: false,
      });
    }
  }

  inviaEmailRegistrazione(): void {
    console.log("Invio dell'email di conferma registrazione...");
    const mailRequest = {
      toEmail: this.clienteForm.value.email,
      nome: this.clienteForm.value.nome,
      cognome: this.clienteForm.value.cognome,
      password: this.randomPassword,
    };

    this.mailService.confermaRegistrazione(mailRequest).subscribe(
      (response) => {
        console.log('Email di conferma registrazione inviata:', response);
      },
      (error) => {
        console.error("Errore durante l'invio dell'email:", error);
      }
    );
  }

  gestisciErrore(errore: any, erroreMsg: string): Observable<any> {
    console.error(erroreMsg, errore);
    this.openDialog({
      titolo: 'Errore',
      msg: erroreMsg,
      reload: false,
    });
    return of(null);
  }
}
