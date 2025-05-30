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
  filteredData: string[][] = [];
  columnFilters: { [key: string]: string } = {};

  constructor(private http: HttpClient) {}

  setSection(section: string): void {
    this.activeSection = section;

    if (section === 'fileManager' && this.csvData.length === 0) {
      this.loadCsvFromAssets();
    }
  }

  loadCsvFromAssets(): void {
    this.http.get('assets/data/database_NL.csv', { responseType: 'text' }).subscribe({
      next: (data: string) => {
        const lines = data.split('\n').filter(line => line.trim() !== '');
        this.csvHeaders = lines[0].split(',').map(h => h.trim());
        this.csvData = lines.slice(1).map(line =>
          line.split(',').map(cell => cell.trim())
        );
        this.filteredData = [...this.csvData];
        this.csvHeaders.forEach(header => {
          this.columnFilters[header] = '';
        });
      },
      error: error => {
        console.error('Error al cargar el archivo CSV:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredData = this.csvData.filter(row =>
      this.csvHeaders.every((header, i) => {
        const filter = this.columnFilters[header];
        return !filter || row[i] === filter;
      })
    );
  }

  getUniqueValuesForColumn(index: number): string[] {
    const unique = new Set<string>();
    for (let row of this.csvData) {
      unique.add(row[index]);
    }
    return Array.from(unique).sort();
  }

  trackByIndex(index: number): number {
    return index;
  }
}
