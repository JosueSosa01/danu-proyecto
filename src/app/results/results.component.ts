import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  // Mapas
  map!: mapboxgl.Map;
  mapNacional!: mapboxgl.Map;
  selectedFeatureProps: any = null;
  mapStyle: 'antes' | 'despues' = 'despues'; // Estado del mapa

  // Filtros
  filters = {
    fechaInicio: '',
    fechaFin: '',
    estados: [] as string[]
  };

  estadosDisponibles: string[] = [
    "Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua",
    "Ciudad de México", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco",
    "México", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro",
    "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala",
    "Veracruz", "Yucatán", "Zacatecas"
  ];

  // Datos del backend
  topProductos: any[] = [];
  productosPorDia: any[] = [];
  porZona: any[] = [];
  resumenTabla: any[] = [];
  resumen: any[] = [];
  resumenKpi: any = null;

  // Gráficas
  barChartDataProductos: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  barChartDataDia: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  pieChartDataZona: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };

  barChartType: ChartType = 'bar';
  pieChartType: ChartType = 'pie';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.setSection('dashboard');
    this.applyFilters(); // Mostrar datos por defecto
  }

  applyFilters(): void {
    const params = new HttpParams()
      .set('fecha_inicio', this.filters.fechaInicio || '')
      .set('fecha_fin', this.filters.fechaFin || '')
      .set('estados', this.filters.estados.join(','));

    // TOP PRODUCTOS
    this.http.get<any[]>('https://backend-danu.onrender.com/api/top_productos', { params })
      .subscribe(data => {
        this.topProductos = data;
        this.barChartDataProductos = {
          labels: data.map(p => p.producto),
          datasets: [{
            data: data.map(p => p.cantidad),
            label: 'Cantidad',
            backgroundColor: 'rgba(54, 162, 235, 0.6)'
          }]
        };
      });

    // PRODUCTOS POR DÍA
    this.http.get<any[]>('https://backend-danu.onrender.com/api/por_dia', { params })
      .subscribe(data => {
        this.productosPorDia = data;
        this.barChartDataDia = {
          labels: data.map(p => p.dia),
          datasets: [{
            data: data.map(p => p.productos_entregados),
            label: 'Total',
            backgroundColor: 'rgba(75, 192, 192, 0.6)'
          }]
        };
      });

    // PIE CHART
    this.http.get<any[]>('https://backend-danu.onrender.com/api/por_zona', { params })
      .subscribe(data => {
        this.porZona = data;
        this.pieChartDataZona = {
          labels: data.map(p => p.zona),
          datasets: [{
            data: data.map(p => p.porcentaje),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#66BB6A', '#BA68C8']
          }]
        };
      });

    // TABLA
    this.http.get<any[]>('https://backend-danu.onrender.com/api/resumen_tabla', { params })
      .subscribe(data => this.resumenTabla = data);

    // KPIs
    this.http.get<any[]>('https://backend-danu.onrender.com/api/resumen', { params })
      .subscribe(data => {
        this.resumen = data;
        this.setResumenKPI(data);
      });
  }

  setResumenKPI(data: any[]): void {
    if (!data || data.length === 0) return;
    const kpis = data[0];
    this.resumenKpi = {
      totalOrders: kpis.total_orders ?? 0,
      orderChange: kpis.order_change ?? 0,
      avgDeliveryTime: kpis.avg_delivery_time ?? 0,
      avgDeliveryChange: kpis.avg_delivery_change ?? 0,
      onTime: kpis.on_time_percentage ?? 0,
      onTimeChange: kpis.on_time_change ?? 0,
      delayed: kpis.delayed_percentage ?? 0,
      delayedChange: kpis.delayed_change ?? 0,
      centros: kpis.total_centros ?? 0
    };
  }

  setSection(section: string): void {
    this.activeSection = section;

    if (section === 'dashboard') {
      setTimeout(() => this.initializeMap(), 0);
    } else if (section === 'dashboard-nacional') {
      setTimeout(() => this.initializeMapNacional(), 0);
    }
  }

  ngAfterViewInit(): void {
    if (this.activeSection === 'dashboard') {
      this.initializeMap();
    } else if (this.activeSection === 'dashboard-nacional') {
      this.initializeMapNacional();
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

    // ⚠️ CORREGIDO: los estilos estaban invertidos
    const styleAntes = 'mapbox://styles/nataliagquintanilla/cmbaaszy401aw01qy84dyhja7'; // Era el de después
    const styleDespues = 'mapbox://styles/nataliagquintanilla/cmbadahuh009h01qoe5taeykn'; // Era el de antes

    const styleToUse = this.mapStyle === 'antes' ? styleAntes : styleDespues;

    this.mapNacional = new mapboxgl.Map({
      container: 'mapNacional',
      style: styleToUse,
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

  cambiarEstiloMapa(estilo: 'antes' | 'despues'): void {
    this.mapStyle = estilo;
    if (this.mapNacional) {
      this.mapNacional.remove();
    }
    setTimeout(() => this.initializeMapNacional(), 0);
  }
}
