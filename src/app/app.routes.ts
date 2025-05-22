import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { ResultsComponent } from './results/results.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // redirige '/' a '/home'
  { path: 'home', component: HomePageComponent },       // ruta para Inicio
  { path: 'resultados', component: ResultsComponent }   // ruta para Resultados
];
