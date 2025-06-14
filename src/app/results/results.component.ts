import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartDataset  } from 'chart.js';
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
  tipoCentro: string = 'Antiguos';
  visualizacion: string = 'Agrupadas';
  centroEspecifico: string = 'Todos';
  listaCentros: string[] = [];

  map!: mapboxgl.Map;
  mapNacional!: mapboxgl.Map;
  mapStyle: 'antes' | 'despues' | 'modeloA' | 'modeloB' = 'antes';
  selectedFeatureProps: any = null;

  kpisAntes = {
    totalOrders: 100000,
    orderChange: 0.09,
    avgDeliveryTime: 2.1,
    onTime: 95.8,
    delayed: 4.2,
    centros: 7,
    kilometros: '4,620,000 ',
    kilometrosdif: '0 ',
    gasolina: '17,850,000 ',
    gasolinadif: '0 ',
    co2: '1,513,000 ',
    emisionesdif: '0 ',
    ruta: '1,614 ',
    rutadif: '0 '


  };
  kpisDespues = {
    totalOrders: 100000,
    orderChange: 0.09,
    avgDeliveryTime: 1.9,
    avgDeliveryChange: -0.2,
    onTime: 97.5,
    onTimeChange: 1.7,
    delayed: 2.5,
    delayedChange: -1.7,
    centros: 7,
    kilometros: '3,780,000 ',
    kilometrosdif: '-840,000 ',
    gasolina: '14,280,000 ',
    gasolinadif: '-3,570,000 ',
    co2: '1,238,000 ',
    emisionesdif: '-275,000 ',
    ruta: '1,291.14 ',
    rutadif: '-322.86 '

  };

  kpisModeloA = {
    totalOrders: 3000,
    avgDeliveryTime: 1.4,
    onTime: 98.6,
    delayed: 1.4,
    centros: 1,
    kilometros: '18,200 ',
    kilometrosdif: '0 ',
    gasolina: '65,500 ',
    gasolinadif: '0 ',
    co2: '6,600 ',
    emisionesdif: '0 ',
    ruta: '812 ',
    rutadif: '0 '
};

kpisModeloB = {
    totalOrders: '30,000 ',
    avgDeliveryTime: 1.6,
    onTime: 97.9,
    delayed: 2.1,
    centros: 3,
    kilometros: '162, 000 ',
    kilometrosdif: '0 ',
    gasolina: '585,000 ',
    gasolinadif: '0 ',
    co2: '59,000 ',
    emisionesdif: '0 ',
    ruta: '795 ',
    rutadif: '0 '
};

  resumenKpi: any = null;

  resumenKpiComparado: any[] = [
    { diferencia: '62,822 km reducidos' },
    { diferencia: '21,901 kg evitados' },
    { diferencia: '$269,834 ahorrados' },
    { diferencia: '$1174.93 por ruta' },
    { diferencia: '40 rutas menos' }
  ];

  barChartLabelsCo2: string[] = [];
  barChartDataCo2 = {
    labels: [] as string[],
    datasets: [] as ChartDataset<'bar' | 'line'>[]
  };


  lineChartLabelsGasolina: string[] = [];
  lineChartDataGasolina = {
    labels: [] as string[],
    datasets: [] as ChartDataset<'line'>[]
  };


  areaChartLabelsDistancia: string[] = [];
  areaChartDataDistancia = {
    labels: [] as string[],
    datasets: [] as ChartDataset<'line'>[]
  };


lineChartOptionsDistancia: ChartConfiguration<'line'>['options'] = {
  responsive: true,
  scales: {
    x: {
      type: 'linear',
      title: { display: true, text: 'Distancia (km)' },
      ticks: {
        stepSize: 100,
        callback: (value: any) => value + ' km'
      }
    },
    y: {
      beginAtZero: true,
      title: { display: true, text: 'Frecuencia' }
    }
  },
  elements: {
    line: {
      tension: 0,
      borderWidth: 1.5
    },
    point: {
      radius: 0
    }
  }
};


  readonly baseUrl = 'https://backend-danu.onrender.com';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.setSection(this.activeSection);
    if (this.tipoCentro === 'Antiguos') this.cargarCentros();
  }

  ngAfterViewInit(): void {
    if (this.activeSection === 'dashboard') this.initializeMap();
    else if (this.activeSection === 'dashboard-nacional') this.cambiarEstiloMapa(this.mapStyle);
  }

  setSection(section: string): void {
    this.activeSection = section;
    setTimeout(() => {
      if (section === 'dashboard') {
        this.tipoCentro = 'Antiguos';
        this.cargarDatos();
        this.initializeMap();
      } else if (section === 'dashboard-nacional') {
        this.cambiarEstiloMapa(this.mapStyle);
      }
    }, 0);
  }


cambiarEstiloMapa(estilo: 'antes' | 'despues' | 'modeloA' | 'modeloB'): void {
  this.mapStyle = estilo;

  // Asignar el resumenKPI correspondiente
  switch (estilo) {
    case 'antes':
      this.resumenKpi = this.kpisAntes;
      break;
    case 'despues':
      this.resumenKpi = this.kpisDespues;
      break;
    case 'modeloA':
      this.resumenKpi = this.kpisModeloA;
      break;
    case 'modeloB':
      this.resumenKpi = this.kpisModeloB;
      break;
  }

  // Actualizar mapa
  setTimeout(() => {
    const container = document.getElementById('mapNacional');
    if (container) {
      if (this.mapNacional) this.mapNacional.remove();
      this.initializeMapNacional();
    }
  }, 100);
}



  onFiltroChange(): void {
    this.cargarDatos();
    if (this.tipoCentro === 'Nuevos') this.cargarCentros();
  }

  cargarCentros(): void {
    if (this.tipoCentro !== 'Nuevos') return;
    this.http.get<any>(`${this.baseUrl}/centros`, {
      params: { tipo_centro: 'Nuevos' }
    }).subscribe(data => {
      this.listaCentros = data.centros || [];
    });
  }

  cargarDatos(): void {
    const params: any = {
      tipo_centro: this.tipoCentro,
      visualizacion: this.visualizacion,
      centro: this.centroEspecifico
    };

    

    // Gráfica Gasolina
    this.http.get<any[]>(`${this.baseUrl}/charts/gasolina`, { params }).subscribe(data => {
      const grouped: any = {}, meses: Set<string> = new Set(), promedios: any = {};
      data.forEach(d => {
        if (!grouped[d.grupo]) grouped[d.grupo] = {};
        grouped[d.grupo][d.mes] = d.gasto_gasolina;
        meses.add(d.mes);
      });
      const ordenMeses = ['Jan 2018','Feb 2018','Mar 2018','Apr 2018','May 2018','Jun 2018'];
      const labels = ordenMeses.filter(m => meses.has(m));
      const datasets = Object.entries(grouped).map(([grupo, values]: any) => {
        const valores = labels.map((mes: string) => values[mes] || 0);
        const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
        promedios[grupo] = promedio;
        return {
          label: grupo,
          data: valores,
          fill: false,
          borderColor: grupo === 'Nuevos' ? '#2caefc' : '#030456',
          backgroundColor: grupo === 'Nuevos' ? '#2caefc' : '#030456',

          borderWidth: 2
        };
      });
      if (this.tipoCentro === 'Nuevos' && this.visualizacion === 'Agrupadas') {
        Object.entries(promedios).forEach(([grupo, promedio]: any) => {
          datasets.push({
          label: `Promedio ${grupo}: $${promedio.toFixed(0)}`,
          data: labels.map(() => promedio),
          type: 'line', // <- TS se queja porque no lo espera aquí
          borderDash: [8, 4],
          borderColor: grupo === 'Nuevos' ? '#2caefc' : '#030456',
          backgroundColor: grupo === 'Nuevos' ? '#2caefc' : '#030456',
          pointRadius: 0,
          fill: false,
        } as any); // <-- Esto elimina el error

        });
      }
      this.lineChartLabelsGasolina = labels;
      this.lineChartDataGasolina = { labels, datasets };
    });

    // Gráfica Distancia
    this.http.get<any[]>(`${this.baseUrl}/charts/distancia`, { params }).subscribe(data => {
      const grouped: any = {}, promedios: any = {}, datasets: any[] = [];
      data.forEach(d => {
        if (!grouped[d.grupo]) grouped[d.grupo] = [];
        grouped[d.grupo].push({ x: +d.distancia_centro, y: +d.frecuencia });
      });
      Object.entries(grouped).forEach(([grupo, puntos]: any) => {
        puntos.sort((a: any, b: any) => a.x - b.x);
        const promedio = puntos.reduce((sum: number, p: any) => sum + (p.x * p.y), 0) / puntos.reduce((s: number, p: any) => s + p.y, 0);
        promedios[grupo] = promedio;
        datasets.push({
          label: grupo,
          data: [{ x: 0, y: 0 }, ...puntos],
          fill: 'origin',
          backgroundColor: grupo === 'Nuevos' ? 'rgba(49, 196, 254, 0.36)' : 'rgba(6, 34, 249, 0.46)',
          borderColor: grupo === 'Nuevos' ? '#2caefc' : '#030456',

          borderWidth: 1.5
        });
        if (this.tipoCentro === 'Nuevos' && this.visualizacion === 'Agrupadas') {
          datasets.push({
            label: `Promedio ${grupo}: ${promedio.toFixed(0)} km`,
            data: [
              { x: promedio, y: 0 },
              { x: promedio, y: Math.max(...puntos.map((p: any) => p.y)) }
            ],
            type: 'line',
            borderDash: [8, 4],
            backgroundColor: grupo === 'Nuevos' ? '#2caefc' : '#030456',
            borderColor: grupo === 'Nuevos' ? '#2caefc' : '#030456',
            pointRadius: 0,
            fill: false
          });
        }
      });
      this.areaChartDataDistancia = { labels: [], datasets };
    });

    // Gráfica CO2
    this.http.get<any[]>(`${this.baseUrl}/charts/co2`, { params }).subscribe(data => {
      const grouped: any = {}, meses: Set<string> = new Set(), promedios: any = {};
       data.forEach(d => {
        if (!grouped[d.grupo]) grouped[d.grupo] = {};  // ✅ CAMBIA A 'grupo'
        grouped[d.grupo][d.mes] = d.co2_emitido;
        meses.add(d.mes);
      });

      const ordenMeses = ['Jan 2018','Feb 2018','Mar 2018','Apr 2018','May 2018','Jun 2018'];
      const labels = ordenMeses.filter(m => meses.has(m));
      const datasets = Object.entries(grouped).map(([tipo, values]: any) => {
        const valores = labels.map(mes => values[mes] || 0);
        const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
        promedios[tipo] = promedio;
        return {
          label: tipo,
          data: valores,
          backgroundColor: tipo === 'Nuevos' ? '#2caefc' : '#030456',
        };
      });
      
      if (this.tipoCentro === 'Nuevos' && this.visualizacion === 'Agrupadas') {
        Object.entries(promedios).forEach(([tipo, promedio]: any) => {
          datasets.push({
            label: `Promedio ${tipo}: ${promedio.toFixed(0)} kg`,
            type: 'line',
            data: labels.map(() => promedio),
            borderDash: [8, 4],
            borderColor: tipo === 'Nuevos' ? '#2caefc' : '#030456',
            backgroundColor: tipo === 'Nuevos' ? '#2caefc' : '#030456',
            pointRadius: 0,
            fill: false
          } as any);

        });
      }
      this.barChartLabelsCo2 = labels;
      this.barChartDataCo2 = { labels, datasets };
    });


    this.http.get<any>(`${this.baseUrl}/kpis`, { params }).subscribe(data => {
    this.resumenKpi = {
      km: data['Kilómetros recorridos'],
      co2: data['Emisiones de CO₂'],
      gasto: data['Gasto estimado en gasolina'],
      promedio: data['Costo promedio por ruta'],
      totalRutas: data['Total de rutas']
    };

    
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
  }

 initializeMapNacional(): void {
  mapboxgl.accessToken = 'pk.eyJ1IjoibmF0YWxpYWdxdWludGFuaWxsYSIsImEiOiJjbWI5eHlrOHUxODV1MmxwdDc2bnpha3VwIn0.2DeML5PLho772mJkGuhXzg';

  let styleToUse = '';
  if (this.mapStyle === 'antes') {
    styleToUse = 'mapbox://styles/nataliagquintanilla/cmbaaszy401aw01qy84dyhja7';
  } else if (this.mapStyle === 'despues') {
    styleToUse = 'mapbox://styles/nataliagquintanilla/cmbadahuh009h01qoe5taeykn';
  } else if (this.mapStyle === 'modeloA') {
    styleToUse = 'mapbox://styles/nataliagquintanilla/cmblfn9mi000001ruc2bc84io';
  } else if (this.mapStyle === 'modeloB') {
    styleToUse = 'mapbox://styles/nataliagquintanilla/cmblfzus200ee01s9cde6am1w';
  }

  this.mapNacional = new mapboxgl.Map({
    container: 'mapNacional',
    style: styleToUse,
    center: [-102.5528, 23.6345],
    zoom: 4.5,
    attributionControl: false
  });
}



  private colorHex(grupo: string): string {
    const hash = [...grupo].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  private colorRGBA(grupo: string, alpha: number = 0.5): string {
    const hash = [...grupo].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `hsla(${hue}, 70%, 50%, ${alpha})`;
  }
}
