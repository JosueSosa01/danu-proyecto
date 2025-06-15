// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { ResultsComponent } from './results/results.component';
import { LoginComponent } from './login/login.component';


export const routes: Routes = [
  { path: 'home', component: HomePageComponent },
  { path: 'resultados', component: ResultsComponent },
  { path: 'login', component: LoginComponent},
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home-page' }
];
