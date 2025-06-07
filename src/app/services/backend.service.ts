import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private apiUrl = 'https://backend-danu.onrender.com';

  constructor(private http: HttpClient) {}

  // === KPIs generales ===
  getKpis(semestre?: string, tipo_centro?: string): Observable<any> {
    let params = '';
    if (semestre) params += `semestre=${encodeURIComponent(semestre)}`;
    if (tipo_centro) params += (params ? '&' : '') + `tipo_centro=${encodeURIComponent(tipo_centro)}`;
    return this.http.get(`${this.apiUrl}/kpis${params ? '?' + params : ''}`);
  }

  // === Emisiones CO₂ por mes ===
  getEmisionesCo2(semestre?: string, tipo_centro?: string): Observable<any> {
    let params = '';
    if (semestre) params += `semestre=${encodeURIComponent(semestre)}`;
    if (tipo_centro) params += (params ? '&' : '') + `tipo_centro=${encodeURIComponent(tipo_centro)}`;
    return this.http.get(`${this.apiUrl}/charts/co2${params ? '?' + params : ''}`);
  }

  // === Gasto gasolina por mes ===
  getGastoGasolina(semestre?: string, tipo_centro?: string): Observable<any> {
    let params = '';
    if (semestre) params += `semestre=${encodeURIComponent(semestre)}`;
    if (tipo_centro) params += (params ? '&' : '') + `tipo_centro=${encodeURIComponent(tipo_centro)}`;
    return this.http.get(`${this.apiUrl}/charts/gasolina${params ? '?' + params : ''}`);
  }

  // === Histograma de distancias ===
  getDistancias(semestre?: string, tipo_centro?: string): Observable<any> {
    let params = '';
    if (semestre) params += `semestre=${encodeURIComponent(semestre)}`;
    if (tipo_centro) params += (params ? '&' : '') + `tipo_centro=${encodeURIComponent(tipo_centro)}`;
    return this.http.get(`${this.apiUrl}/charts/distancia${params ? '?' + params : ''}`);
  }
}

