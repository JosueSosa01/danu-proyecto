import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgFor } from '@angular/common'; // Necesario para *ngFor

import { NAV_LINKS } from './nav-links';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NgFor], // <- ¡IMPORTANTE!
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  navLinks = NAV_LINKS;
}
