import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Prodotto } from '../../interfacce/Prodotto';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-card',
  standalone: false,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent implements OnInit {
  @Input() prodotto: Prodotto;
  @Input() responsive: boolean;
  @Input() cartBadge: { [idProdotto: number]: number };
  @Input() isWishlistPage: boolean = false;
  isLoggedOut: boolean = true;

  @Input() isInWishlist: boolean;
  @Output() toggleWishlist = new EventEmitter<Prodotto>();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isLoggedOut = this.authService.isAuthenticated();
  }

  preferitiWishlist(): void {
    this.toggleWishlist.emit(this.prodotto);
  }
}
