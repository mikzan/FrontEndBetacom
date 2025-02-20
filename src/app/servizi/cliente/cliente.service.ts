import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from '../../interfacce/Cliente';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  listAll(): Observable<Cliente[]> {
    const url = this.authService.getURL('cliente/listAll');
    return this.http.get<Cliente[]>(url);
  }

  getCliente(idCliente: number): Observable<Cliente> {
    const url = this.authService.getURL('cliente/listById?id=') + idCliente;
    console.log('URL completo', url);
    return this.http.get<Cliente>(url);
  }

  updateCliente(body: {}): Observable<Cliente> {
    const url = this.authService.getURL('cliente/update');
    return this.http.post<Cliente>(url, body);
  }

  createCliente(body: {}): Observable<Cliente> {
    const url = this.authService.getURL('cliente/create');
    return this.http.post<Cliente>(url, body);
  }
}
