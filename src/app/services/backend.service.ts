import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private apiUrl = 'https://backend-danu.onrender.com/api';

  constructor(private http: HttpClient) {}

  getTopProductos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/top_productos`);
  }

  getPorDia(): Observable<any> {
    return this.http.get(`${this.apiUrl}/por_dia`);
  }

  getPorZona(): Observable<any> {
    return this.http.get(`${this.apiUrl}/por_zona`);
  }

  getResumenTabla(): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumen_tabla`);
  }

  getResumen(): Observable<any> {
    return this.http.get(`${this.apiUrl}/resumen`);
  }
}
