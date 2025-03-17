import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Incident } from '../models/incident.model';

interface HotspotMap {
  [key: string]: {
    location: {
      lat: number;
      lng: number;
    };
    count: number;
  };
}

interface Statistics {
  totalIncidents: number;
  byType: { [key: string]: number };
  byTransport: { [key: string]: number };
  byTimeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private incidents: Incident[] = [];

  constructor() {}

  addIncident(incident: Incident): Observable<Incident> {
    const newIncident = {
      ...incident,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    this.incidents.push(newIncident);
    return of(newIncident);
  }

  getIncidents(): Observable<Incident[]> {
    return of(this.incidents);
  }

  getHotspots(): Observable<any[]> {
    const hotspots: { [key: string]: { location: { lat: number; lng: number }; count: number } } = {};
    
    this.incidents.forEach(incident => {
      const key = `${incident.location.lat}-${incident.location.lng}`;
      if (!hotspots[key]) {
        hotspots[key] = {
          location: incident.location,
          count: 0
        };
      }
      hotspots[key].count++;
    });

    return of(Object.values(hotspots));
  }

  getStatistics(): Observable<Statistics> {
    const stats: Statistics = {
      totalIncidents: this.incidents.length,
      byType: {},
      byTransport: {},
      byTimeOfDay: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      }
    };

    this.incidents.forEach(incident => {
      // Count by type
      if (!stats.byType[incident.incidentType]) {
        stats.byType[incident.incidentType] = 0;
      }
      stats.byType[incident.incidentType]++;
      
      // Count by transport
      if (!stats.byTransport[incident.transportType]) {
        stats.byTransport[incident.transportType] = 0;
      }
      stats.byTransport[incident.transportType]++;
      
      // Count by time of day
      const hour = new Date(incident.datetime).getHours();
      if (hour >= 5 && hour < 12) stats.byTimeOfDay.morning++;
      else if (hour >= 12 && hour < 17) stats.byTimeOfDay.afternoon++;
      else if (hour >= 17 && hour < 22) stats.byTimeOfDay.evening++;
      else stats.byTimeOfDay.night++;
    });

    return of(stats);
  }
}