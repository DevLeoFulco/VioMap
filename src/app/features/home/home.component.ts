import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { IncidentService } from '../../core/services/incident.service';
import L from 'leaflet';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  currentYear = new Date().getFullYear();
  private map!: L.Map;

  stats = {
    totalIncidents: 0,
    mostDangerousStreet: 'N/A',
    mostCommonType: 'N/A',
    criticalHour: 'N/A'
  };

  constructor(private incidentService: IncidentService) {
    this.loadStats();
  }

  ngOnInit() {    
    setTimeout(() => {
      this.initializeMap();
    }, 100);
  }

  private initializeMap() {
    if (!this.map) {
      this.map = L.map('map').setView([-8.0889, -34.9514], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);
    }
  }

  private loadStats() {
    this.incidentService.getStatistics().subscribe(stats => {
      this.stats.totalIncidents = stats.totalIncidents;
      
      // Process incident types
      const types = Object.entries(stats.byType);
      if (types.length > 0) {
        const [type, count] = types.reduce((a, b) => (b[1] > a[1] ? b : a));
        this.stats.mostCommonType = this.formatLabel(type);
      }

      // Process time of day
      const timeOfDay = Object.entries(stats.byTimeOfDay);
      if (timeOfDay.length > 0) {
        const [period] = timeOfDay.reduce((a, b) => (b[1] > a[1] ? b : a));
        this.stats.criticalHour = this.formatTimeOfDay(period);
      }
    });
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

  private formatTimeOfDay(period: string): string {
    const periods: { [key: string]: string } = {
      'morning': 'Manhã (5h-12h)',
      'afternoon': 'Tarde (12h-17h)',
      'evening': 'Noite (17h-22h)',
      'night': 'Madrugada (22h-5h)'
    };
    return periods[period] || period;
  }
}
