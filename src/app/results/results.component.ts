// src/app/home-page/results/results.component.ts
import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent {
  activeSection: string = 'dashboard';

  csvHeaders: string[] = [];
  csvData: string[][] = [];

  constructor(private http: HttpClient) {}

  // Método para cambiar la sección activa del sidebar
  setSection(section: string): void {
    this.activeSection = section;

    // Si entramos a File Manager y aún no se ha cargado el CSV
    if (section === 'fileManager' && this.csvData.length === 0) {
      this.loadCsvFromAssets();
    }
  }

  // Carga del archivo CSV precargado desde assets
  loadCsvFromAssets(): void {
    this.http.get('assets/data/database_NL.csv', { responseType: 'text' }).subscribe({
      next: (data: string) => {
        const lines = data.split('\n').filter(line => line.trim() !== '');
        this.csvHeaders = lines[0].split(',').map(header => header.trim());
        this.csvData = lines.slice(1).map(line =>
          line.split(',').map(cell => cell.trim())
        );
      },
      error: error => {
        console.error('Error al cargar el archivo CSV:', error);
      }
    });
  }
}
