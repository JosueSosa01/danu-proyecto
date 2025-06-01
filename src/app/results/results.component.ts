import { Component, AfterViewInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements AfterViewInit {
  activeSection: string = 'dashboard'; // default

  csvHeaders: string[] = [];
  csvData: string[][] = [];
  filteredData: string[][] = [];
  columnFilters: { [key: string]: string } = {};

  map!: mapboxgl.Map;
  selectedFeatureProps: any = null;

  constructor(private http: HttpClient) {}

  ngAfterViewInit(): void {
    if (this.activeSection === 'dashboard') {
      this.initializeMap();
    }
  }

  setSection(section: string): void {
    this.activeSection = section;

    if (section === 'fileManager' && this.csvData.length === 0) {
      this.loadCsvFromAssets();
    }

    if (section === 'dashboard') {
      setTimeout(() => this.initializeMap(), 0);
    }
  }

  initializeMap(): void {
    mapboxgl.accessToken = 'pk.eyJ1IjoibmF0YWxpYWdxdWludGFuaWxsYSIsImEiOiJjbWI5eHlrOHUxODV1MmxwdDc2bnpha3VwIn0.2DeML5PLho772mJkGuhXzg';

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/nataliagquintanilla/cmbadctro016n01sdbtju3v3n',
      center: [-100.309475, 25.749408],
      zoom: 11
    });

    this.map.on('load', () => {
      this.map.on('click', 'centros-distribucion-nl-803fp6 copy', (e) => {
        const features = this.map.queryRenderedFeatures(e.point, {
          layers: ['centros-distribucion-nl-803fp6 copy']
        });

        if (!features.length || !features[0].properties) return;

        this.selectedFeatureProps = features[0].properties;
      });

      this.map.on('mouseenter', 'centros-distribucion-nl-803fp6 copy', () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });

      this.map.on('mouseleave', 'centros-distribucion-nl-803fp6 copy', () => {
        this.map.getCanvas().style.cursor = '';
      });
    });
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
