import { Component } from '@angular/core';
import { ClienteService } from '../../servizi/cliente/cliente.service';
import { UtenteService } from '../../servizi/utente/utente.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { MailService } from '../../servizi/mail/mail.service';
import { ProfiloService } from '../../servizi/profilo/profilo.service';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, catchError, of, switchMap } from 'rxjs';
import { PopUpComponent } from '../../dialog/pop-up/pop-up.component';

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
  dataRegistrazione: string = '';
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
    this.dataRegistrazione = this.authService.getDataRegistrazione();
    this.utenteId = this.authService.getUtenteIdSessione();
  }

  inizializzaForm(): void {
    const telefonoRegex =
      '^\\+?\\d{1,3}[\\s-]?\\(?\\d{1,4}\\)?[\\s-]?\\d{1,4}[\\s-]?\\d{1,4}$';
    this.clienteForm = new FormGroup({
      nome: new FormControl('', [Validators.required]),
      cognome: new FormControl('', [Validators.required]),
      immagineCliente: new FormControl(''),
      telefono: new FormControl('', [
        Validators.required,
        Validators.pattern(telefonoRegex),
      ]),
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
    this.creaClienteEAssociaIdCliente();
  }

  creaClienteEAssociaIdCliente(): void {
    const clienteFormData = this.creaClienteFormData();

    this.clienteService
      .createCliente(clienteFormData)
      .pipe(
        switchMap((clienteResponse: any) => {
          const clienteId = clienteResponse?.dati?.idCliente;
          if (!clienteId) {
            throw new Error('idCliente non trovato nella risposta');
          }

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
        this.gestisciRispostaRegistrazione(utenteResponse);
      });
  }

  creaClienteFormData(): any {
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
    const utenteUpdateForm = {
      idCliente: clienteId,
      idUtente: this.utenteId,
      email: this.authService.getEmail(),
      username: this.authService.getUsername(),
    };

    return this.utenteService.updateUtente(utenteUpdateForm);
  }

  gestisciRispostaRegistrazione(utenteResponse: any): void {
    if (utenteResponse) {
      this.inviaEmailRegistrazione();
      this.openDialog({
        titolo: 'Conferma',
        msg: 'Cliente associato correttamente.Fai logout per accedere alla funzionalità',
        reload: true,
      });
      this.router.navigate(['/']);
    } else {
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
        //console.log('Email di conferma registrazione inviata:', response);
      },
      (error) => {
        //console.error("Errore durante l'invio dell'email:", error);
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
