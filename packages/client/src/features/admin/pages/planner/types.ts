// filename: packages/client/src/features/admin/pages/planner/types.ts
// version: 1.0.0 (NEW)
// description: Fichero centralizado para las definiciones de tipos compartidas en el Planning Hub.

export interface TechnicianResource { 
  id: string; 
  title: string; 
}

export interface Technician extends TechnicianResource {
  isAvailable: boolean;
  availabilities: { startDate: string; endDate: string }[];
}

export interface Zone { 
  id: string; 
  name: string; 
}

export interface Pool { 
  id: string; 
  name: string; 
  address: string; 
  client: { name: string }; 
}

export interface Visit { 
  id: string; 
  timestamp: string; 
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'; 
  pool: Pool; 
  technician: Technician | null; 
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end?: Date;
    allDay: boolean;
    backgroundColor: string;
    borderColor: string;
    resourceId?: string;
    extendedProps: {
        clientName: string;
        poolAddress: string;
        technicianId: string | null;
        technicianName: string;
        status: Visit['status'];
    }
}