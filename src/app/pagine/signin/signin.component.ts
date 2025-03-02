import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
  standalone: false,
})
export class SigninComponent {
  signinForm: FormGroup;
  messaggioErrore: string | null = null;
  passwordVisibile: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const usernamePattern = '^[a-zA-Z0-9-_]{3,15}$'; // Solo lettere, numeri, trattini, underscores, 3-15 caratteri

    this.signinForm = this.formBuilder.group({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(15),
        Validators.pattern(usernamePattern),
      ]),
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  toggleVisibilitaPassword() {
    this.passwordVisibile = !this.passwordVisibile;
  }

  onSubmit(): void {
    if (this.signinForm.invalid) {
      return;
    }

    const { username, password } = this.signinForm.value;

    // Effettua il login attraverso il servizio AuthService
    this.authService.signInAuthUtente(username, password);

    // Gestisci l'esito del login
    if (this.authService.isRcLog) {
      this.messaggioErrore = null;
      this.router
        .navigate([this.authService.getRedirectionRoute()])
        .then(() => {
          window.location.reload(); // Ricarica la pagina per applicare correttamente i cambiamenti
        });
    } else {
      this.messaggioErrore =
        this.authService.errorMessage || 'Credenziali non valide';
    }
  }
}
