import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { IncidentService } from '../../core/services/incident.service';
import L from 'leaflet';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatCardModule, MatIconModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private map!: L.Map;

  constructor(private incidentService: IncidentService) {}

  ngOnInit() {
    // Defer map initialization to ngAfterViewInit
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeMap();
      this.loadHotspots();
      this.loadStatistics();
    }, 100);
  }

  private initializeMap() {
    const mapElement = document.getElementById('map');
    if (mapElement && !this.map) {
      this.map = L.map(mapElement).setView([-8.0889, -34.9514], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);
    }
  }

  private loadHotspots() {
    this.incidentService.getHotspots().subscribe(hotspots => {
      hotspots.forEach(hotspot => {
        L.circle([hotspot.location.lat, hotspot.location.lng], {
          color: '#f43f5e',
          fillColor: '#f43f5e',
          fillOpacity: 0.5,
          radius: hotspot.count * 50
        }).addTo(this.map);
      });
    });
  }

  private loadStatistics() {
    this.incidentService.getStatistics().subscribe(stats => {
      // Wait for DOM to be ready
      setTimeout(() => {
        this.initializeCharts(stats);
      }, 100);
    });
  }

  private initializeCharts(stats: any) {
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom' as const
        }
      }
    };

    const typeChartElement = document.getElementById('typeChart');
    const timeChartElement = document.getElementById('timeChart');
    const transportChartElement = document.getElementById('transportChart');

    if (typeChartElement) {
    }

    if (timeChartElement) {
    }

    if (transportChartElement) {
    }
  }

  private formatLabel(label: string): string {
    const labels: { [key: string]: string } = {
      'pe': 'A pé',
      'moto': 'Moto',
      'carro': 'Carro',
      'outros': 'Outros',
      'roubo': 'Roubo',
      'furto': 'Furto',
      'agressao': 'Agressão'
    };
    return labels[label] || label;
  }
}