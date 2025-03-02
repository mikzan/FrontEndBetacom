import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UtenteService } from '../../../servizi/utente/utente.service';
import { AuthService } from '../../../auth/auth.service';
import { MailService } from '../../../servizi/mail/mail.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { ClienteService } from '../../../servizi/cliente/cliente.service';
import { DialogConfermaComponent } from '../../../dialog/dialog-conferma/dialog-conferma/dialog-conferma.component';
import { MatDialog } from '@angular/material/dialog';
import { PopUpComponent } from '../../../dialog/pop-up/pop-up.component';

@Component({
  selector: 'app-cambia-password',
  standalone: false,
  templateUrl: './cambia-password.component.html',
  styleUrl: './cambia-password.component.css',
})
export class CambiaPasswordComponent {
  passwordForm!: FormGroup;
  passwordCorrenteVisibile: boolean = false;
  passwordNuovaVisibile: boolean = false;
  passwordDiConfermaVisibile: boolean = false;

  messaggioErrore: string | null = null;
  logged: boolean = false;

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private authService: AuthService,
    private mailService: MailService,
    private utenteService: UtenteService,
    private dialog: MatDialog
  ) {}
  ngOnInit(): void {
    this.inizializzaForm();
  }

  inizializzaForm(): void {
    this.passwordForm = new FormGroup(
      {
        passwordCorrente: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
        ]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
        ]),
        passwordDiConferma: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
        ]),
      },
      { validators: this.passwordMatchValidator }
    );
  }

  toggleVisibilitaPasswordCorrente(): void {
    this.passwordCorrenteVisibile = !this.passwordCorrenteVisibile;
  }

  toggleVisibilitaPasswordNuova(): void {
    this.passwordNuovaVisibile = !this.passwordNuovaVisibile;
  }

  toggleVisibilitaPasswordConferma(): void {
    this.passwordDiConfermaVisibile = !this.passwordDiConfermaVisibile;
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      return;
    }
    const passwordCorrente = this.passwordForm.get('passwordCorrente')?.value;
    const nuovaPassword = this.passwordForm.get('password')?.value;
    const idUtente = this.authService.getUtenteIdSessione();
    this.utenteService
      .changePassword(idUtente, passwordCorrente, nuovaPassword)
      .subscribe(
        (response) => {
          this.resetPasswordAfterSubmit();
          const dialogRef = this.dialog.open(PopUpComponent, {
            minWidth: '500px',
            data: {
              titolo: 'Modifica della password',
              msg: response.msg,
            },
          });
          dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/profilo']);
          });
        },
        (errore) => {
          this.messaggioErrore = 'Password non corretta';
          this.gestisciErrore(
            errore,
            'Errore durante la modifica della password'
          );
        }
      );
  }

  get passwordMatchValidator(): any {
    return (formGroup: FormGroup) => {
      const password = formGroup.get('password')?.value;
      const confirmPassword = formGroup.get('passwordDiConferma')?.value;
      if (password !== confirmPassword) {
        formGroup.get('passwordDiConferma')?.setErrors({ mismatch: true });
      } else {
        formGroup.get('passwordDiConferma')?.setErrors(null);
      }
    };
  }

  resetPasswordAfterSubmit(): void {
    this.passwordForm.patchValue({
      password: '',
      passwordDiConferma: '',
    });
  }

  gestisciErrore(errore: any, erroreMsg: string): Observable<any> {
    //console.error(erroreMsg, errore);
    return of(null);
  }
}
