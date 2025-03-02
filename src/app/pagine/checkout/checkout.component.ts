import { Component, OnInit } from '@angular/core';
import { CarrelloService } from '../../servizi/carrello/carrello.service';
import { Router } from '@angular/router';
import { ClienteService } from '../../servizi/cliente/cliente.service';
import { ProdottoCarrello } from '../../interfacce/ProdottoCarrello';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { OrdineService } from '../../servizi/ordine/ordine.service';
import { MailService } from '../../servizi/mail/mail.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: false,
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  constructor(
    private carrelloServ: CarrelloService,
    private clienteServ: ClienteService,
    private ordineServ: OrdineService,
    private mailServ: MailService,
    private authServ: AuthService,
    private router: Router
  ) {}

  idCliente: number = 0;
  isLoading: boolean;
  prodottiCarrello: ProdottoCarrello[];
  totale = 0;
  clienteForm!: FormGroup;
  msg: string = '';
  rc: boolean = true;

  ngOnInit(): void {
    this.isLoading = true;
    this.idCliente = this.authServ.getClienteIdSessione();
    this.carrelloServ.listaProdotti(this.idCliente).subscribe((r: any) => {
      this.prodottiCarrello = r.dati.prodotti;
      this.totale = r.dati.totale;
    });
    this.clienteForm = new FormGroup({
      nome: new FormControl('', [Validators.required]),
      cognome: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      telefono: new FormControl('', [Validators.required]),
      via: new FormControl('', [Validators.required]),
      comune: new FormControl('', [Validators.required]),
      provincia: new FormControl('', [Validators.required]),
      cap: new FormControl('', [Validators.required]),
    });
    this.clienteServ.getCliente(this.idCliente).subscribe((r: any) => {
      const clienteData = r.dati;
      this.clienteForm.patchValue({
        nome: clienteData.nome,
        cognome: clienteData.cognome,
        email: clienteData.utente.email,
        telefono: clienteData.telefono,
        via: clienteData.via,
        comune: clienteData.comune,
        provincia: clienteData.provincia,
        cap: clienteData.cap,
      });
    });
    this.isLoading = false;
  }

  onSubmit() {
    this.isLoading = true;
    let request = {
      idCliente: this.idCliente,
    };
    this.ordineServ.inviaOrdine(request).subscribe((r: any) => {
      this.msg = r.msg;
      this.rc = r.rc;
      if (r.rc) {
        let mailRequest = {
          toEmail: this.clienteForm.value.email,
          nome: this.clienteForm.value.nome,
          cognome: this.clienteForm.value.cognome,
          prodotti: this.prodottiCarrello,
          totale: this.totale,
        };
        this.mailServ.confermaOrdine(mailRequest).subscribe();
      }
      this.router.navigate(['/carrello']).then(() => {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      });
    });
    this.isLoading = false;
  }
}
