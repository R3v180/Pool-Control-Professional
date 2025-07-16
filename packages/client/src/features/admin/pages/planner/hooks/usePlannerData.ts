// filename: packages/client/src/features/admin/pages/planner/hooks/usePlannerData.ts
// version: 1.1.1 (FIX: Correct data access based on updated types)
// description: Se corrige el acceso a los datos para que coincida con las nuevas interfaces de tipos, eliminando los errores de compilación.

import { useState, useEffect } from 'react';
import { format, getDayOfYear, isBefore, setHours, startOfToday, addHours, startOfWeek, endOfWeek, addDays as addDaysFn } from 'date-fns';
import apiClient from '../../../../../api/apiClient';
// ✅ Se actualiza la importación para usar la nueva interfaz Technician
import type { CalendarEvent, TechnicianResource, Zone, Visit, Technician } from '../types';

interface UsePlannerDataParams {
  week: Date;
  selectedTechnicians: string[];
  selectedZones: string[];
  sidebarVersion: number;
}

const techColors = ['#228be6', '#15aabf', '#82c91e', '#fab005', '#fd7e14', '#e64980'];
const UNAVAILABLE_COLOR = '#f8f9fa';

export function usePlannerData({ week, selectedTechnicians, selectedZones, sidebarVersion }: UsePlannerDataParams) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [resources, setResources] = useState<TechnicianResource[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [pools, setPools] = useState<{ value: string; label: string; }[]>([]);
  const [workloadMap, setWorkloadMap] = useState(new Map<string, { visitCount: number }>());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const weekStart = startOfWeek(week, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(week, { weekStartsOn: 1 });

      const params = {
        startDate: weekStart.toISOString(),
        endDate: weekEnd.toISOString(),
        technicianIds: selectedTechnicians,
        zoneIds: selectedZones,
      };
      
      // ✅ La API ahora devuelve un objeto con una propiedad 'data'
      const [visitsRes, techsRes, zonesRes, clientsRes] = await Promise.all([
        apiClient.get('/visits/scheduled', { params }),
        apiClient.get<{data: Technician[]}>('/users/technicians'),
        apiClient.get<{data: Zone[]}>('/zones'),
        apiClient.get('/clients')
      ]);
      
      const allVisits: Visit[] = visitsRes.data.data;
      const allTechnicians: Technician[] = techsRes.data.data;
      const allZones: Zone[] = zonesRes.data.data;

      const resourcesFormatted = allTechnicians.map(tech => ({
        id: tech.id,
        // ✅ Se accede a 'name' en lugar de 'title'
        title: tech.name,
      }));
      setResources(resourcesFormatted);
      setZones(allZones);
      
      const poolOptions = clientsRes.data.data.flatMap((client: any) => client.pools.map((pool: any) => ({ value: pool.id, label: `${client.name} - ${pool.name}` })));
      setPools(poolOptions);

      const newWorkloadMap = new Map<string, { visitCount: number }>();
      for (const visit of allVisits) {
        if (!visit.technician?.id || visit.status === 'CANCELLED') continue;
        const dayKey = `${visit.technician.id}-${format(new Date(visit.timestamp), 'yyyy-MM-dd')}`;
        const currentWorkload = newWorkloadMap.get(dayKey) || { visitCount: 0 };
        currentWorkload.visitCount++;
        newWorkloadMap.set(dayKey, currentWorkload);
      }
      setWorkloadMap(newWorkloadMap);

      const dailyCounters: Record<string, number> = {};
      const WORK_DAY_START_HOUR = 8;

      const visitEvents = allVisits.map((visit): CalendarEvent => {
        let visitDate = new Date(visit.timestamp);
        const techIdForCounter = visit.technician?.id || 'unassigned';
        const dayKey = `${techIdForCounter}-${getDayOfYear(visitDate)}`;
        if (dailyCounters[dayKey] === undefined) { dailyCounters[dayKey] = 0; } else { dailyCounters[dayKey]++; }
        if (visitDate.getHours() === 0 && visitDate.getMinutes() === 0) { visitDate = setHours(visitDate, WORK_DAY_START_HOUR + dailyCounters[dayKey]); }
        
        const techIndex = allTechnicians.findIndex(t => t.id === visit.technician?.id);
        const borderColor = techColors[techIndex % techColors.length] || '#ced4da';
        let backgroundColor = 'white';
        if (visit.status === 'COMPLETED') { backgroundColor = '#e6fcf5'; } 
        else if (isBefore(visitDate, startOfToday())) { backgroundColor = '#fff5f5'; }
        
        return {
            id: visit.id, title: visit.pool.name, start: visitDate, end: addHours(visitDate, 1),
            allDay: false, 
            backgroundColor, borderColor, resourceId: visit.technician?.id || undefined,
            extendedProps: {
                clientName: visit.pool.client.name,
                poolAddress: visit.pool.address,
                technicianId: visit.technician?.id || null,
                 // ✅ Se accede a 'name' en lugar de 'title'
                technicianName: visit.technician?.name || 'Sin Asignar', 
                status: visit.status
            }
        };
      });

      const availabilityEvents: CalendarEvent[] = [];
      allTechnicians.forEach(tech => {
        if (!tech.isAvailable) {
          availabilityEvents.push({
            id: `unavail-${tech.id}`,
            resourceId: tech.id,
            start: weekStart,
            end: weekEnd,
            display: 'background',
            backgroundColor: UNAVAILABLE_COLOR,
            title: 'No disponible',
          } as CalendarEvent); // Forzamos el tipo aquí
        }
        
        tech.availabilities.forEach(avail => {
          availabilityEvents.push({
            id: `avail-${avail.id}`, // ✅ Se accede a la propiedad 'id' que ya existe
            resourceId: tech.id,
            start: new Date(avail.startDate),
            end: addDaysFn(new Date(avail.endDate), 1),
            display: 'background',
            backgroundColor: UNAVAILABLE_COLOR,
            title: avail.reason || 'Ausencia', // ✅ Se accede a la propiedad 'reason'
          } as CalendarEvent); // Forzamos el tipo aquí
        });
      });

      setEvents([...visitEvents, ...availabilityEvents]);

    } catch (err) {
      setError('No se pudo cargar la planificación.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [week, selectedTechnicians, selectedZones, sidebarVersion]);

  return {
    events,
    resources,
    zones,
    pools,
    workloadMap,
    loading,
    error,
    refetch: fetchData,
  };
}