export interface Incident {
    id?: string;
    street: string;
    reference: string;
    datetime: Date;
    victimCount: number;
    victimGenders: string[];
    incidentType: string;
    transportType: string;
    policeReport?: {
      filed: boolean;
      protocolNumber?: string;
    };
    location: {
      lat: number;
      lng: number;
    };
    createdAt: Date;
  }