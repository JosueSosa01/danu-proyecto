import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NAV_LINKS } from './nav-links';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NgIf, NgFor],
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
        console.log('[Router URL]', url); // ✅ Verifica en consola

        this.showNavbar = !(url === '/login');
      });
  }
}
