import { Component } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { NgFor } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NAV_LINKS } from './nav-links';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NgFor],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  navLinks = NAV_LINKS;
  showNavbar = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        this.showNavbar = !(url === '/login'); // Oculta solo si es exactamente /login
      });
  }
}
