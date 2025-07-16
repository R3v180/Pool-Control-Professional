// filename: packages/client/src/features/admin/pages/planner/hooks/usePlannerData.ts
// version: 1.0.1 (FIX: Add missing date-fns import)
// description: Se añade la importación de `endOfWeek` que faltaba.

import { useState, useEffect } from 'react';
// ✅ CORRECCIÓN: Añadir 'endOfWeek' a la importación
import { format, getDayOfYear, isBefore, setHours, startOfToday, addHours, startOfWeek, endOfWeek } from 'date-fns';
import apiClient from '../../../../../api/apiClient';
import type { CalendarEvent, TechnicianResource, Zone, Visit } from '../types';

interface UsePlannerDataParams {
  week: Date;
  selectedTechnicians: string[];
  selectedZones: string[];
  sidebarVersion: number;
}

const techColors = ['#228be6', '#15aabf', '#82c91e', '#fab005', '#fd7e14', '#e64980'];

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

      const [visitsRes, techsRes, zonesRes, clientsRes] = await Promise.all([
        apiClient.get('/visits/scheduled', { params }),
        apiClient.get('/users/technicians'),
        apiClient.get('/zones'),
        apiClient.get('/clients')
      ]);

      const allVisits: Visit[] = visitsRes.data.data;
      const allResources: TechnicianResource[] = techsRes.data.data;
      const allZones: Zone[] = zonesRes.data.data;

      setResources(allResources);
      setZones(allZones);
      
      const poolOptions = clientsRes.data.data.flatMap((client: any) => client.pools.map((pool: any) => ({ value: pool.id, label: `${client.name} - ${pool.name}` })));
      setPools(poolOptions);

      // Calcular la carga de trabajo
      const newWorkloadMap = new Map<string, { visitCount: number }>();
      for (const visit of allVisits) {
        if (!visit.technician?.id || visit.status === 'CANCELLED') continue;
        const dayKey = `${visit.technician.id}-${format(new Date(visit.timestamp), 'yyyy-MM-dd')}`;
        const currentWorkload = newWorkloadMap.get(dayKey) || { visitCount: 0 };
        currentWorkload.visitCount++;
        newWorkloadMap.set(dayKey, currentWorkload);
      }
      setWorkloadMap(newWorkloadMap);

      // Procesar los eventos para el calendario
      const dailyCounters: Record<string, number> = {};
      const WORK_DAY_START_HOUR = 8;

      const calendarEvents = allVisits.map((visit): CalendarEvent => {
        let visitDate = new Date(visit.timestamp);
        const techIdForCounter = visit.technician?.id || 'unassigned';
        const dayKey = `${techIdForCounter}-${getDayOfYear(visitDate)}`;
        if (dailyCounters[dayKey] === undefined) { dailyCounters[dayKey] = 0; } else { dailyCounters[dayKey]++; }
        if (visitDate.getHours() === 0 && visitDate.getMinutes() === 0) { visitDate = setHours(visitDate, WORK_DAY_START_HOUR + dailyCounters[dayKey]); }
        
        const techIndex = allResources.findIndex(t => t.id === visit.technician?.id);
        const borderColor = techColors[techIndex % techColors.length] || '#ced4da';
        let backgroundColor = 'white';
        if (visit.status === 'COMPLETED') { backgroundColor = '#e6fcf5'; } 
        else if (isBefore(visitDate, startOfToday())) { backgroundColor = '#fff5f5'; }
        
        return {
            id: visit.id, title: visit.pool.name, start: visitDate, end: addHours(visitDate, 1),
            allDay: false, // For timeline view, allDay should be false
            backgroundColor, borderColor, resourceId: visit.technician?.id || undefined,
            extendedProps: {
                clientName: visit.pool.client.name,
                poolAddress: visit.pool.address,
                technicianId: visit.technician?.id || null,
                technicianName: visit.technician?.title || 'Sin Asignar', 
                status: visit.status
            }
        };
      });
      setEvents(calendarEvents);

    } catch (err) {
      setError('No se pudo cargar la planificación.');
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