import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription, tap } from 'rxjs';
import { SignIn } from '../interfacce/SignIn';
import { Router } from '@angular/router';
import { ConfigService } from '../servizi/config/config.service';
import { LocalStorageService } from '../servizi/localstorage/localstorage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private signInUrl: string = 'http://localhost:9090/rest/utente/signin';
  private authSignInUrl: string = 'http://localhost:9090/rest/auth/login';
  private logoutSubject: Subject<void> = new Subject<void>();
  private subscriptions: Subscription[] = [];
  isRcLog: boolean = false;
  isRcReg: boolean = false;
  errorMessage: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private config: ConfigService,
    private localStorage: LocalStorageService
  ) {}

  // Versione per JWT token
  signInAuthUtente(username: string, password: string): void {
    this.http.post<any>(this.authSignInUrl, { username, password }).subscribe({
      next: (response) => {
        if (response.rc) {
          this.setSessione(response.dati);
          this.isRcLog = true;
          this.router.navigate([this.getRedirectionRoute()]).then(() => {
            window.location.reload();
          });
        } else {
          this.errorMessage = response.msg;
        }
      },
      error: (err) => {
        this.errorMessage = 'Errore durante la connessione: ' + err.message;
      },
    });
  }

  // Nuovo metodo per gestire la sessione
  private setSessione(dati: any): void {
    console.log('Salvataggio dei dati nel localStorage:', dati); // Verifica i dati che stai salvando

    localStorage.setItem('token', dati.token);
    localStorage.setItem('dati_utente', JSON.stringify(dati));
    localStorage.setItem('ruoloUtente', dati.role);

    // Verifica che i dati siano memorizzati correttamente
    console.log('Token memorizzato:', localStorage.getItem('token'));
    console.log(
      'Dati utente memorizzati:',
      localStorage.getItem('dati_utente')
    );
    console.log('Ruolo memorizzato:', localStorage.getItem('ruoloUtente'));
  }

  // Recupera l'ID del cliente dalla sessione
  getClienteIdSessione(): number | null {
    const datiUtente = localStorage.getItem('dati_utente');
    const utente = datiUtente ? JSON.parse(datiUtente) : null;
    return utente ? utente.idCliente : null;
  }

  // Recupera l'ID dell'utente dalla sessione
  getUtenteIdSessione(): number | null {
    const datiUtente = localStorage.getItem('dati_utente');
    if (datiUtente) {
      const utente = JSON.parse(datiUtente);
      return utente.idUtente ?? null; // Access the idUtente directly
    }
    return null;
  }

  // Controlla se l'utente è un "Admin"
  isAdmin(): boolean {
    return localStorage.getItem('ruoloUtente') === 'ADMIN';
  }

  // Controlla se l'utente è un "Utente"
  isUtente(): boolean {
    return localStorage.getItem('ruoloUtente') === 'UTENTE';
  }

  // Ottieni il token JWT
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // LOGOUT - Rimuove il token e reindirizza al login
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('dati_utente');
    localStorage.removeItem('ruoloUtente');
    console.log('🚪 Logout effettuato!');
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  // Imposta la rotta da seguire dopo il login in base al ruolo
  getRedirectionRoute(): string {
    if (this.isAdmin()) {
      return '/admin/dashboard';
    } else if (this.isUtente() && this.getClienteIdSessione() != null) {
      return '/profilo';
    } else {
      return '/signin';
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken(); // Se esiste un token, l'utente è autenticato
  }

  // Metodo per verificare se l'utente è un ADMIN e non ha un cliente associato
  isAdminNotCliente(): boolean {
    const datiUtente = this.getDatiUtente();
    return datiUtente && datiUtente.role === 'ADMIN' && !datiUtente.idCliente;
  }
  getRuoloUtente(): string | null {
    return localStorage.getItem('ruoloUtente');
  }

  getDataRegistrazione(): string | null {
    const datiUtente = localStorage.getItem('dati_utente');
    if (datiUtente) {
      const utente = JSON.parse(datiUtente);
      return utente.dataRegistrazione || null;
    }
    return null;
  }

  getEmail(): string | null {
    const datiUtente = localStorage.getItem('dati_utente');
    if (datiUtente) {
      const utente = JSON.parse(datiUtente);
      return utente.email || null;
    }
    return null;
  }

  // Metodo per verificare se l'utente è autenticato
  isLoggedOut(): boolean {
    return !this.getToken(); // Se non esiste un token, l'utente è "loggato fuori"
  }

  getUsername(): string | null {
    const datiUtente = this.getDatiUtente();
    return datiUtente ? datiUtente.username : null;
  }
  getDatiUtente(): any {
    const datiUtente = localStorage.getItem('dati_utente');
    return datiUtente ? JSON.parse(datiUtente) : null;
  }

  // Metodo per ottenere l'URL base
  private buildURL(): void {
    this.config.getConfig().subscribe((response: any) => {
      if (response && response.domain && response.port) {
        const url = `http://${response.domain}:${response.port}/rest/`;
        localStorage.setItem('config', url);
      } else {
        console.error('Config non valido:', response);
      }
    });
  }

  // Ottieni l'URL completo per il componente
  getURL(component: string): string {
    const config = localStorage.getItem('config');
    if (!config) this.buildURL();
    return config ? config + component : '';
  }

  // Gestione configurazione
  private gestisciConfig(): void {
    const valoreConfig = localStorage.getItem('config');
    if (!valoreConfig) {
      this.buildURL();
    }
  }
}
