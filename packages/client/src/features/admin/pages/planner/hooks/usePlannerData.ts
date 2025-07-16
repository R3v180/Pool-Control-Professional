// filename: packages/client/src/features/admin/pages/planner/hooks/usePlannerData.ts
// version: 1.2.0 (FEAT: Detect and flag overlaps with absences)
// description: Se añade lógica para detectar si una visita se superpone con un periodo de ausencia del técnico asignado, añadiendo un flag `isOverlappingAbsence` a las props del evento.

import { useState, useEffect } from 'react';
// ✅ Se importa isWithinInterval
import { format, getDayOfYear, isBefore, setHours, startOfToday, addHours, startOfWeek, endOfWeek, addDays as addDaysFn, isWithinInterval } from 'date-fns';
import apiClient from '../../../../../api/apiClient';
import type { CalendarEvent, TechnicianResource, Zone, Visit, Technician } from '../types';

interface UsePlannerDataParams {
  week: Date;
  selectedTechnicians: string[];
  selectedZones: string[];
  sidebarVersion: number;
}

const techColors = ['#228be6', '#15aabf', '#82c91e', '#fab005', '#fd7e14', '#e64980'];
const UNAVAILABLE_COLOR = '#f1f3f5'; 

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
        apiClient.get<{data: Technician[]}>('/users/technicians'),
        apiClient.get<{data: Zone[]}>('/zones'),
        apiClient.get('/clients')
      ]);
      
      const allVisits: Visit[] = visitsRes.data.data;
      const allTechnicians: Technician[] = techsRes.data.data;
      const allZones: Zone[] = zonesRes.data.data;

      const resourcesFormatted = allTechnicians.map(tech => ({
        id: tech.id,
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
        
        // ✅ Lógica de detección de superposición
        let isOverlapping = false;
        if (visit.technician) {
            const techData = allTechnicians.find(t => t.id === visit.technician!.id);
            if (techData) {
                isOverlapping = techData.availabilities.some(avail => 
                    isWithinInterval(visitDate, { 
                        start: new Date(avail.startDate), 
                        end: new Date(avail.endDate) 
                    })
                );
            }
        }
        
        return {
            id: visit.id, title: visit.pool.name, start: visitDate, end: addHours(visitDate, 1),
            allDay: false, 
            backgroundColor, borderColor, resourceId: visit.technician?.id || undefined,
            extendedProps: {
                clientName: visit.pool.client.name,
                poolAddress: visit.pool.address,
                technicianId: visit.technician?.id || null,
                technicianName: visit.technician?.name || 'Sin Asignar', 
                status: visit.status,
                isOverlappingAbsence: isOverlapping, // ✅ Se añade el flag
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
          } as CalendarEvent);
        }
        
        tech.availabilities.forEach(avail => {
          availabilityEvents.push({
            id: `avail-${avail.id}`,
            resourceId: tech.id,
            start: new Date(avail.startDate),
            end: addDaysFn(new Date(avail.endDate), 1),
            display: 'background',
            backgroundColor: UNAVAILABLE_COLOR,
            title: avail.reason || 'Ausencia',
          } as CalendarEvent);
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