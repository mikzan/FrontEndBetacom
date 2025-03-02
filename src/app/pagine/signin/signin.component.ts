import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
    this.signinForm = this.formBuilder.group({
      username: ['', Validators.required],
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
