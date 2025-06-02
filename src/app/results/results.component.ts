import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, NgChartsModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements AfterViewInit, OnInit {
  activeSection: string = 'dashboard';
  csvHeaders: string[] = [];
  csvData: string[][] = [];
  filteredData: string[][] = [];
  columnFilters: { [key: string]: string } = {};

  map!: mapboxgl.Map;
  mapNacional!: mapboxgl.Map;
  selectedFeatureProps: any = null;

  // Datos del backend
  topProductos: any[] = [];
  productosPorDia: any[] = [];
  porZona: any[] = [];
  resumenTabla: any[] = [];
  resumen: any[] = [];

  // Configuración de gráficas
  barChartDataProductos: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  barChartDataDia: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  pieChartDataZona: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };

  barChartType: ChartType = 'bar';
  pieChartType: ChartType = 'pie';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('https://backend-danu.onrender.com/api/top_productos')
      .subscribe(data => {
        this.topProductos = data;
        this.barChartDataProductos = {
          labels: this.topProductos.map(p => p.producto),
          datasets: [
            {
              data: this.topProductos.map(p => p.cantidad),
              label: 'Cantidad',
              backgroundColor: 'rgba(54, 162, 235, 0.6)'
            }
          ]
        };
      });

    this.http.get<any[]>('https://backend-danu.onrender.com/api/por_dia')
      .subscribe(data => {
        this.productosPorDia = data;
        this.barChartDataDia = {
          labels: this.productosPorDia.map(p => p.fecha),
          datasets: [
            {
              data: this.productosPorDia.map(p => p.total),
              label: 'Total',
              backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }
          ]
        };
      });

    this.http.get<any[]>('https://backend-danu.onrender.com/api/por_zona')
      .subscribe(data => {
        this.porZona = data;
        this.pieChartDataZona = {
          labels: this.porZona.map(p => p.zona),
          datasets: [
            {
              data: this.porZona.map(p => p.porcentaje),
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#BA68C8']
            }
          ]
        };
      });

    this.http.get<any[]>('https://backend-danu.onrender.com/api/resumen_tabla')
      .subscribe(data => this.resumenTabla = data);

    this.http.get<any[]>('https://backend-danu.onrender.com/api/resumen')
      .subscribe(data => this.resumen = data);
  }

  ngAfterViewInit(): void {
    if (this.activeSection === 'dashboard') {
      this.initializeMap();
    } else if (this.activeSection === 'dashboard-nacional') {
      this.initializeMapNacional();
    }
  }

  setSection(section: string): void {
    this.activeSection = section;

    if (section === 'fileManager' && this.csvData.length === 0) {
      this.loadCsvFromAssets();
    }

    if (section === 'dashboard') {
      setTimeout(() => this.initializeMap(), 0);
    } else if (section === 'dashboard-nacional') {
      setTimeout(() => this.initializeMapNacional(), 0);
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

  initializeMapNacional(): void {
    mapboxgl.accessToken = 'pk.eyJ1IjoibmF0YWxpYWdxdWludGFuaWxsYSIsImEiOiJjbWI5eHlrOHUxODV1MmxwdDc2bnpha3VwIn0.2DeML5PLho772mJkGuhXzg';

    this.mapNacional = new mapboxgl.Map({
      container: 'mapNacional',
      style: 'mapbox://styles/nataliagquintanilla/cmbaaszy401aw01qy84dyhja7',
      center: [-102.5528, 23.6345],
      zoom: 4.5
    });

    this.mapNacional.on('load', () => {
      this.mapNacional.on('click', 'centros-distribucion-nacional', (e) => {
        const features = this.mapNacional.queryRenderedFeatures(e.point, {
          layers: ['centros-distribucion-nacional']
        });
        if (!features.length || !features[0].properties) return;
        this.selectedFeatureProps = features[0].properties;
      });

      this.mapNacional.on('mouseenter', 'centros-distribucion-nacional', () => {
        this.mapNacional.getCanvas().style.cursor = 'pointer';
      });

      this.mapNacional.on('mouseleave', 'centros-distribucion-nacional', () => {
        this.mapNacional.getCanvas().style.cursor = '';
      });
    });
  }

  loadCsvFromAssets(): void {
    this.http.get('assets/data/database_NL.csv', { responseType: 'text' }).subscribe({
      next: (data: string) => {
        const lines = data.split('\n').filter(line => line.trim() !== '');
        this.csvHeaders = lines[0].split(',').map(h => h.trim());
        this.csvData = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
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
