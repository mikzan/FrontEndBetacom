import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClienteService } from '../../../servizi/cliente/cliente.service';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { UtenteService } from '../../../servizi/utente/utente.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfermaComponent } from '../../../dialog/dialog-conferma/dialog-conferma/dialog-conferma.component';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-cancella-account',
  templateUrl: './cancella-account.component.html',
  styleUrls: ['./cancella-account.component.css'],
  standalone: false,
})
export class CancellaAccountComponent {
  passwordForm!: FormGroup;
  passwordCorrenteVisibile: boolean = false;
  passwordDiConfermaVisibile: boolean = false;
  messaggioErrore: string | null = null;
  idUtente: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private utenteService: UtenteService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.inizializzaForm();
    this.idUtente = this.authService.getUtenteIdSessione();
  }

  inizializzaForm(): void {
    this.passwordForm = new FormGroup(
      {
        passwordCorrente: new FormControl('', [
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

  createUtenteFormData(): any {
    return {
      idUtente: this.idUtente,
    };
  }

  toggleVisibilitaPasswordCorrente(): void {
    this.passwordCorrenteVisibile = !this.passwordCorrenteVisibile;
  }

  toggleVisibilitaPasswordConferma(): void {
    this.passwordDiConfermaVisibile = !this.passwordDiConfermaVisibile;
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      return;
    }

    const passwordCorrente = this.passwordForm.get('passwordCorrente')?.value;
    const utenteInvioForm = this.createUtenteFormData();
    const idUtente = this.idUtente;
    this.utenteService
      .verifyCurrentPassword(idUtente, passwordCorrente)
      .subscribe(
        (response) => {
          const dialogRef = this.dialog.open(DialogConfermaComponent, {
            minWidth: '500px',
            data: {
              messaggio: 'Sei sicuro di voler eliminare il tuo account?',
            },
          });

          dialogRef.afterClosed().subscribe((confirmed) => {
            if (confirmed) {
              console.log('Utente ha confermato la cancellazione');
              this.eliminaAccount(utenteInvioForm);
            } else {
              //console.log('Utente ha annullato la cancellazione');
            }
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
      const password = formGroup.get('passwordCorrente')?.value;
      const confirmPassword = formGroup.get('passwordDiConferma')?.value;
      if (password !== confirmPassword) {
        console.log('Le password non corrispondono');
        formGroup.get('passwordDiConferma')?.setErrors({ mismatch: true });
      } else {
        console.log('Le password corrispondono');
        formGroup.get('passwordDiConferma')?.setErrors(null);
      }
    };
  }

  eliminaAccount(idUtente: number): void {
    this.utenteService.deleteUtente(idUtente).subscribe(
      (response) => {
        this.authService.logout();

        localStorage.clear();

        this.router.navigate(['/']);
      },
      (errore) => {
        this.messaggioErrore = "Errore durante l'eliminazione dell'account";
        this.gestisciErrore(
          errore,
          "Errore durante l'eliminazione dell'account"
        );
      }
    );
  }

  gestisciErrore(errore: any, erroreMsg: string): Observable<any> {
    console.error(erroreMsg, errore);
    return of(null);
  }
}
