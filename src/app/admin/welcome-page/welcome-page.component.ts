import { Component } from '@angular/core';
import { ProfiloService } from '../../servizi/profilo/profilo.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-welcome-page',
  standalone: false,
  templateUrl: './welcome-page.component.html',
  styleUrl: './welcome-page.component.css',
})
export class WelcomePageComponent {
  username: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
  }
}
