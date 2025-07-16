// filename: packages/client/src/features/admin/pages/planner/types.ts
// version: 1.1.0 (FIX: Align types with API response and FullCalendar needs)
// description: Se actualizan las interfaces para que coincidan con la estructura de datos real y las propiedades que espera FullCalendar, como 'display' para eventos de fondo.

export interface TechnicianResource { 
  id: string; 
  title: string; 
}

// ✅ Se añade 'id' y 'reason' a la interfaz de disponibilidad
interface Availability {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
}

export interface Technician extends TechnicianResource {
  isAvailable: boolean;
  name: string; // Se añade 'name' que también se usa
  availabilities: Availability[];
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
    // ✅ Se añade 'display' como propiedad opcional para los eventos de fondo
    display?: 'background' | 'auto';
    extendedProps: {
        clientName: string;
        poolAddress: string;
        technicianId: string | null;
        technicianName: string;
        status: Visit['status'];
    }
}