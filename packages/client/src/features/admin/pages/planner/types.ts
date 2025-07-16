// filename: packages/client/src/features/admin/pages/planner/types.ts
// version: 1.2.0 (FEAT: Add overlap flag to event extended props)
// description: Se añade la propiedad opcional `isOverlappingAbsence` a las props extendidas de los eventos del calendario.

export interface TechnicianResource { 
  id: string; 
  title: string; 
}

interface Availability {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
}

export interface Technician extends TechnicianResource {
  isAvailable: boolean;
  name: string;
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
    display?: 'background' | 'auto';
    extendedProps: {
        clientName: string;
        poolAddress: string;
        technicianId: string | null;
        technicianName: string;
        status: Visit['status'];
        isOverlappingAbsence?: boolean; // ✅ Se añade el nuevo flag opcional
    }
}