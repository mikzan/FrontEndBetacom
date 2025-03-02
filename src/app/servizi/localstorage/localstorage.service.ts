import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private tokenKey = 'auth_token';
  private datiUtenteKey = 'dati_utente';
  private ruoloUtenteKey = 'ruoloUtente';

  // Salva il token in LocalStorage
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  // Recupera il token da LocalStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Rimuove il token (logout)
  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  // Salva i dati dell'utente in LocalStorage
  setDatiUtente(dati: any): void {
    localStorage.setItem(this.datiUtenteKey, JSON.stringify(dati));
  }

  // Recupera i dati dell'utente da LocalStorage
  getDatiUtente(): any {
    const dati = localStorage.getItem(this.datiUtenteKey);
    return dati ? JSON.parse(dati) : null;
  }

  // Salva il ruolo dell'utente in LocalStorage
  setRuoloUtente(ruolo: string): void {
    localStorage.setItem(this.ruoloUtenteKey, ruolo);
  }

  // Recupera il ruolo dell'utente da LocalStorage
  getRuoloUtente(): string | null {
    return localStorage.getItem(this.ruoloUtenteKey);
  }
}
