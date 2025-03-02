import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Recensione } from '../../interfacce/Recensione';
import { RecensioneService } from '../../servizi/recensione/recensione.service';
import { Prodotto } from '../../interfacce/Prodotto';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-form-recensione',
  standalone: false,
  templateUrl: './form-recensione.component.html',
  styleUrl: './form-recensione.component.css',
})
export class FormRecensioneComponent implements OnInit {
  prodottoSelezionato: Prodotto;
  recensioneSelezionata: Recensione;
  recensioneModificaForm: FormGroup;
  recensioneCreazioneForm: FormGroup;
  form: FormGroup;
  msg: string;
  rc: boolean;
  response: any;
  idCliente: number = 0;

  constructor(
    private authService: AuthService,
    private serv: RecensioneService,
    public dialogRef: MatDialogRef<FormRecensioneComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.idCliente = this.authService.getClienteIdSessione();
    this.initDati(this.data);
    console.log('recensione', this.recensioneSelezionata);

    if (this.recensioneSelezionata) {
      this.recensioneModificaForm = this.recensioneModificaFormInit();
      this.formConDatiPassati();
      this.form = this.recensioneModificaForm;
    } else {
      this.recensioneCreazioneForm = this.recensioneCreazioneFormInit();
      this.form = this.recensioneCreazioneForm;
    }
  }

  onSubmit() {
    if (this.recensioneSelezionata) {
      const request = this.recensioneModificaForm?.value;
      this.serv.modificaRecensione(request).subscribe((resp: any) => {
        this.response = resp;
        this.msg = resp.msg;
        this.rc = resp.rc;
        if (this.rc === true) {
          this.closeDialog();
        }
      });
    } else {
      this.serv
        .creaRecensione(this.recensioneCreazioneForm.value)
        .subscribe((resp: any) => {
          this.response = resp;
          this.msg = resp.msg;
          this.rc = resp.rc;
          if (this.rc === true) {
            this.closeDialog();
          }
        });
    }
  }

  initDati(data: any) {
    console.log(data);
    if (data.recensione) {
      this.recensioneSelezionata = data?.recensione.dati;
    } else {
      this.prodottoSelezionato = data?.prodotto?.dati[0];
    }
  }

  formConDatiPassati() {
    this.recensioneModificaForm?.patchValue({
      idRecensione: this.recensioneSelezionata?.idRecensione,
      descrizione: this.recensioneSelezionata?.descrizione,
      stelle: this.recensioneSelezionata?.stelle,
    });
  }

  recensioneModificaFormInit() {
    return new FormGroup({
      idRecensione: new FormControl('', [Validators.required]),
      descrizione: new FormControl('', [Validators.required]),
      stelle: new FormControl(0, [
        Validators.required,
        Validators.min(1),
        Validators.max(5),
      ]),
    });
  }

  recensioneCreazioneFormInit() {
    let idProdotto = this.prodottoSelezionato.idProdotto;
    return new FormGroup({
      idCliente: new FormControl(this.idCliente),
      descrizione: new FormControl('', [Validators.required]),
      stelle: new FormControl(0, [
        Validators.required,
        Validators.min(1),
        Validators.max(5),
      ]),
      idProdotto: new FormControl(idProdotto),
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
    window.location.reload();
  }
}
