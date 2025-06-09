import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, NgChartsModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.css']
})
export class ResultsComponent implements AfterViewInit, OnInit {
  activeSection: string = 'dashboard-nacional';

  // Mapas
  map!: mapboxgl.Map;
  mapNacional!: mapboxgl.Map;
  selectedFeatureProps: any = null;
  mapStyle: 'antes' | 'despues' = 'antes';

  // Filtro activo
  tipoCentro: string = 'Nuevos';

  resumenKpi: any = null;

  // KPI dummy para nacional
  kpisAntes = {
    totalOrders: 1248,
    orderChange: 15.3,
    avgDeliveryTime: 1.9,
    avgDeliveryChange: -0.5,
    onTime: 97.5,
    onTimeChange: 3.3,
    delayed: 2.5,
    delayedChange: -3.0,
    centros: 7
  };
  kpisDespues = {
    totalOrders: 1248,
    orderChange: 12.5,
    avgDeliveryTime: 2.4,
    avgDeliveryChange: 0.3,
    onTime: 94.2,
    onTimeChange: 2.1,
    delayed: 5.8,
    delayedChange: 2.1,
    centros: 7
  };

  // Gráficas
  lineChartLabelsGasolina: string[] = [];
  lineChartDataGasolina: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };

  areaChartLabelsDistancia: string[] = [];
  areaChartDataDistancia: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };

  barChartLabelsCo2: string[] = [];
  barChartDataCo2: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.setSection('dashboard-nacional'); // 👈 Nacional primero
  }

  setSection(section: string): void {
    this.activeSection = section;

    setTimeout(() => {
      if (section === 'dashboard') {
        this.cargarDatos(); // carga los KPIs locales
        this.initializeMap();
      } else if (section === 'dashboard-nacional') {
        this.cambiarEstiloMapa(this.mapStyle); // aplica estilo actual
      }
    }, 0);
  }

  cambiarEstiloMapa(estilo: 'antes' | 'despues'): void {
    this.mapStyle = estilo;
    this.resumenKpi = estilo === 'antes' ? this.kpisAntes : this.kpisDespues;

    setTimeout(() => {
      const container = document.getElementById('mapNacional');
      if (container) {
        if (this.mapNacional) {
          this.mapNacional.remove();
        }
        this.initializeMapNacional();
      }
    }, 100);
  }

  ngAfterViewInit(): void {
    if (this.activeSection === 'dashboard') {
      this.initializeMap();
    } else if (this.activeSection === 'dashboard-nacional') {
      this.cambiarEstiloMapa(this.mapStyle);
    }
  }

  cargarDatos(): void {
    const baseUrl = 'https://backend-danu.onrender.com';
    const ordenMeses = ['Jan 2018', 'Feb 2018', 'Mar 2018', 'Apr 2018', 'May 2018', 'Jun 2018'];

    const params = {
      tipo_centro: this.tipoCentro
    };

    // KPIs
    this.http.get<any>(`${baseUrl}/kpis`, { params }).subscribe(data => {
      this.resumenKpi = {
        km: data['Kilómetros recorridos'],
        co2: data['Emisiones de CO₂'],
        gasto: data['Gasto estimado en gasolina'],
        promedio: data['Costo promedio por ruta'],
        totalRutas: data['Total de rutas']
      };
    });

    // Gasto gasolina por centro
    this.http.get<any[]>(`${baseUrl}/charts/gasolina`, { params }).subscribe(data => {
      const grouped: any = {};
      const meses: Set<string> = new Set();

      data.forEach(d => {
        const centro = d.tipo_centro;
        if (!grouped[centro]) grouped[centro] = {};
        grouped[centro][d.mes] = d.gasto_gasolina;
        meses.add(d.mes);
      });

      const labels = ordenMeses.filter(m => meses.has(m));
      const datasets = Object.entries(grouped).map(([centro, values]: any) => ({
        label: centro === 'Viejos' ? 'Antiguos' : centro,
        data: labels.map(mes => values[mes] || 0),
        fill: false,
        borderColor: centro === 'Nuevos' ? '#36A2EB' : '#4BC0C0'
      }));

      this.lineChartLabelsGasolina = labels;
      this.lineChartDataGasolina = { labels, datasets };
    });

    // Distancia recorrida
    this.http.get<any[]>(`${baseUrl}/charts/distancia`, { params }).subscribe(data => {
      const labels = data.map(d => d.rango_km);
      const dataset = {
        label: 'Frecuencia',
        data: data.map(d => d.frecuencia),
        fill: true,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: '#4bc0c0',
        tension: 0.3
      };

      this.areaChartLabelsDistancia = labels;
      this.areaChartDataDistancia = { labels, datasets: [dataset] };
    });

    // CO2
    this.http.get<any[]>(`${baseUrl}/charts/co2`, { params }).subscribe(data => {
      const grouped: any = {};
      const meses: Set<string> = new Set();

      data.forEach(d => {
        const centro = d.tipo_centro;
        if (!grouped[centro]) grouped[centro] = {};
        grouped[centro][d.mes] = d.co2_emitido;
        meses.add(d.mes);
      });

      const labels = ordenMeses.filter(m => meses.has(m));
      const datasets = Object.entries(grouped).map(([centro, values]: any) => ({
        label: centro === 'Viejos' ? 'Antiguos' : centro,
        data: labels.map(mes => values[mes] || 0),
        backgroundColor: centro === 'Nuevos' ? '#36A2EB' : '#4BC0C0'
      }));

      this.barChartLabelsCo2 = labels;
      this.barChartDataCo2 = { labels, datasets };
    });
  }

  initializeMap(): void {
    mapboxgl.accessToken = 'pk.eyJ1IjoibmF0YWxpYWdxdWludGFuaWxsYSIsImEiOiJjbWI5eHlrOHUxODV1MmxwdDc2bnpha3VwIn0.2DeML5PLho772mJkGuhXzg';
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/nataliagquintanilla/cmbadctro016n01sdbtju3v3n',
      center: [-100.309475, 25.749408],
      zoom: 9.5
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

    const styleAntes = 'mapbox://styles/nataliagquintanilla/cmbaaszy401aw01qy84dyhja7';
    const styleDespues = 'mapbox://styles/nataliagquintanilla/cmbadahuh009h01qoe5taeykn';
    const styleToUse = this.mapStyle === 'antes' ? styleAntes : styleDespues;

    this.mapNacional = new mapboxgl.Map({
      container: 'mapNacional',
      style: styleToUse,
      center: [-102.5528, 23.6345],
      zoom: 4.5,
      attributionControl: false
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
}
