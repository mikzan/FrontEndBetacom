import { Component, Input, OnInit } from '@angular/core';
import { ClienteService } from '../../servizi/cliente/cliente.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UtenteService } from '../../servizi/utente/utente.service';
import { Observable, catchError, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { MailService } from '../../servizi/mail/mail.service';
import { ProfiloService } from '../../servizi/profilo/profilo.service';
import { MatDialog } from '@angular/material/dialog';
import { PopUpComponent } from '../../dialog/pop-up/pop-up.component';

@Component({
  selector: 'app-profilo',
  standalone: false,
  templateUrl: './profilo.component.html',
  styleUrls: ['./profilo.component.css'],
})
export class ProfiloComponent implements OnInit {
  clienteId: number = 0;
  utenteId: number = 0;
  clienteForm!: FormGroup;
  @Input() editMode: boolean = false;
  @Input() isRegistrazione: boolean = false;
  dataRegistrazione: string = '';
  immagineDefault: string =
    'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
  nomeClienteBenvenuto: string = '';
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
    this.loadDatiCliente();
    this.dataRegistrazione = this.authService.getDataRegistrazione();
  }

  inizializzaForm(): void {
    this.clienteForm = new FormGroup({
      nome: new FormControl('', [Validators.required]),
      cognome: new FormControl('', [Validators.required]),
      immagineCliente: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      telefono: new FormControl('', [Validators.required]),
      username: new FormControl(''),
      via: new FormControl('', [Validators.required]),
      comune: new FormControl('', [Validators.required]),
      provincia: new FormControl('', [Validators.required]),
      cap: new FormControl('', [Validators.required]),
    });
  }

  loadDatiCliente(): void {
    if (!this.isRegistrazione) {
      this.clienteId = this.authService.getClienteIdSessione();
      this.utenteId = this.authService.getUtenteIdSessione();

      this.clienteService
        .getCliente(this.clienteId)
        .pipe(
          catchError((errore) =>
            this.gestisciErrore(
              errore,
              "'Errore durante il caricamento dati del cliente:'"
            )
          )
        )
        .subscribe((response: any) =>
          this.populateFormWithDatiCliente(response)
        );
    }
  }

  populateFormWithDatiCliente(response: any): void {
    const clienteData = response.dati;
    this.profiloService.setNomeCliente(`${clienteData.nome}`);
    this.clienteForm.patchValue({
      nome: clienteData.nome,
      cognome: clienteData.cognome,
      immagineCliente: clienteData.immagineCliente,
      email: clienteData.utente.email,
      telefono: clienteData.telefono,
      username: clienteData.utente.username,
      via: clienteData.via,
      comune: clienteData.comune,
      provincia: clienteData.provincia,
      cap: clienteData.cap,
    });
  }

  onEditUser(): void {
    this.editMode = !this.editMode;
  }

  onSubmit(): void {
    this.invioDatiCliente();
  }

  invioDatiCliente(): void {
    const clienteInvioForm = this.createClienteFormData();
    const utenteInvioForm = this.createUtenteFormData();

    this.clienteService
      .updateCliente(clienteInvioForm)
      .pipe(
        switchMap((clienteResponse) => {
          return this.utenteService.updateUtente(utenteInvioForm);
        }),
        catchError((errore) => {
          return this.gestisciErrore(errore, "Errore durante l'aggiornamento:");
        })
      )
      .subscribe((utenteResponse) => {
        this.gestioneRispostaUpdate(utenteResponse);
      });
  }

  createClienteFormData(): any {
    return {
      idCliente: this.clienteId,
      nome: this.clienteForm.value.nome,
      cognome: this.clienteForm.value.cognome,
      immagineCliente: this.clienteForm.value.immagineCliente,
      telefono: this.clienteForm.value.telefono,
      via: this.clienteForm.value.via,
      comune: this.clienteForm.value.comune,
      provincia: this.clienteForm.value.provincia,
      cap: this.clienteForm.value.cap,
    };
  }

  createUtenteFormData(): any {
    return {
      idUtente: this.utenteId,
      idCliente: this.clienteId,
      email: this.clienteForm.value.email,
      username: this.clienteForm.value.username,
      roles: this.authService.isAdmin() ? 'ADMIN' : 'UTENTE',
    };
  }

  gestioneRispostaUpdate(utenteResponse: any): void {
    if (utenteResponse) {
      this.openDialog({
        titolo: 'Conferma',
        msg: 'Dati utente aggiornati con successo.',
        reload: true,
      });
      this.editMode = false;
    } else {
      this.openDialog({
        titolo: 'Errore',
        msg: utenteResponse.msg,
        reload: false,
      });
    }
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

  openDialog(inputDialog: any): void {
    const dialogRef = this.dialog.open(PopUpComponent, {
      width: '400px',
      data: {
        titolo: inputDialog.titolo,
        msg: inputDialog.msg,
        reload: inputDialog.reload,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.reload) {
        window.location.reload();
      }
    });
  }
}
