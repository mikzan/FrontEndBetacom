import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MailService } from '../../../servizi/mail/mail.service';
import { UtenteService } from '../../../servizi/utente/utente.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { DialogConfermaComponent } from '../../../dialog/dialog-conferma/dialog-conferma/dialog-conferma.component';

@Component({
  selector: 'app-registra-utente-admin',
  standalone: false,
  templateUrl: './registra-utente-admin.component.html',
  styleUrl: './registra-utente-admin.component.css',
})
export class RegistraUtenteAdminComponent {
  utenteId: number = 0;
  utenteForm!: FormGroup;
  passwordVisibile: boolean = false;
  randomPassword: string = '';

  constructor(
    private utenteService: UtenteService,
    private router: Router,
    private authService: AuthService,
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

    return {
      email: this.utenteForm.value.email,
      password: this.randomPassword,
      username: this.utenteForm.value.username,
      roles: 'ADMIN',
    };
  }

  gestioneRispostaRegistrazione(utenteResponse: any): void {
    if (utenteResponse) {
      this.invioEmailRegistrazione();
      this.router.navigate(['/']);
    } else {
      console.log("Non è stato possibile creare l'utente");
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
    console.error(erroreMsg, errore);
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
          console.log('Email di conferma registrazione inviata ', response);
        },
        (error) => {
          console.error("Errore durante l'invio della email:", error);
        }
      );
  }
}
