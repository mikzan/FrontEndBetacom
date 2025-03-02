import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MailService } from '../../servizi/mail/mail.service';
import { UtenteService } from '../../servizi/utente/utente.service';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { PopUpComponent } from '../../dialog/pop-up/pop-up.component';

@Component({
  selector: 'app-registra-utente-admin',
  standalone: false,
  templateUrl: './registra-utente-admin.component.html',
  styleUrls: ['./registra-utente-admin.component.css'],
})
export class RegistraUtenteAdminComponent {
  utenteForm!: FormGroup;
  passwordVisibile: boolean = false;
  randomPassword: string = '';

  constructor(
    private utenteService: UtenteService,
    private router: Router,
    private mailService: MailService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.inizializzaForm();
  }

  inizializzaForm(): void {
    this.utenteForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      username: new FormControl('', Validators.required),
    });
  }

  onSubmit(): void {
    console.log('Submit del form...');
    this.registraUtente();
  }

  registraUtente(): void {
    const utenteInvioForm = this.createUtenteFormData();

    this.utenteService
      .createUtente(utenteInvioForm)
      .pipe(
        catchError((errore) => {
          return this.gestisciErrore(
            errore,
            "Errore durante la registrazione dell'utente:"
          );
        })
      )
      .subscribe((utenteResponse) => {
        this.gestioneRispostaRegistrazione(utenteResponse);
      });
  }

  createUtenteFormData(): any {
    this.randomPassword = this.generateRandomPassword(12);

    const formData = {
      email: this.utenteForm.value.email,
      password: this.randomPassword,
      username: this.utenteForm.value.username,
      roles: 'ADMIN',
    };
    return formData;
  }

  gestioneRispostaRegistrazione(utenteResponse: any): void {
    if (utenteResponse && utenteResponse.rc) {
      this.invioEmailRegistrazione();
      this.openDialog({
        titolo: 'Conferma',
        msg: 'Registrazione utente completata con successo.',
        reload: true,
      });
      this.router.navigate(['/admin/dashboard/welcome-page']);
    } else {
      this.openDialog({
        titolo: 'Errore',
        msg:
          utenteResponse.msg ||
          'Si è verificato un errore durante la registrazione.',
        reload: false,
      });
      this.router.navigate(['/admin/dashboard/crea-admin']);
    }
  }

  generateRandomPassword(length: number): string {
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  gestisciErrore(errore: any, erroreMsg: string): Observable<any> {
    this.openDialog({
      titolo: 'Errore',
      msg: erroreMsg,
      reload: false,
    });
    return of(null);
  }

  invioEmailRegistrazione(): void {
    const mailRequest = {
      toEmail: this.utenteForm.value.email,
      username: this.utenteForm.value.username,
      password: this.randomPassword,
    };
    this.mailService
      .confermaRegistrazioneAdminNonCliente(mailRequest)
      .subscribe(
        (response) => {
          //console.log('Email di conferma registrazione inviata:', response);
        },
        (error) => {
          //console.error("Errore nell'invio della email:", error);
        }
      );
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

    dialogRef.afterClosed().subscribe(() => {
      if (inputDialog.reload) {
        window.location.reload();
      } else {
        this.router.navigate(['/']);
      }
    });
  }
}
