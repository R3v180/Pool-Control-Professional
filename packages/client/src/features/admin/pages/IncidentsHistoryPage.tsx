// filename: packages/client/src/features/admin/pages/IncidentsHistoryPage.tsx
// version: 2.2.4
// description: Ajusta el tamaño de página a un valor de producción.

import { useEffect, useState, useRef } from 'react';
import { Container, Title, Table, Loader, Alert, Badge, ActionIcon, Tooltip, Text, Select, Grid, Pagination, Center } from '@mantine/core';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// --- Tipos de Datos ---
type IncidentStatus = 'PENDING' | 'RESOLVED';
type IncidentPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

interface IncidentHistoryItem {
  id: string;
  createdAt: string;
  message: string;
  status: IncidentStatus;
  priority: IncidentPriority | null;
  resolutionNotes: string | null;
  isCritical: boolean;
  visit: {
    id: string;
    technician: { name: string } | null;
    pool: { name: string; client: { id: string; name: string } };
  } | null;
}

interface PaginatedResponse {
    notifications: IncidentHistoryItem[];
    total: number;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

// --- Mapeo de colores ---
const priorityColors: Record<IncidentPriority, string> = { LOW: 'gray', NORMAL: 'blue', HIGH: 'orange', CRITICAL: 'red' };
const statusColors: Record<IncidentStatus, string> = { PENDING: 'orange', RESOLVED: 'green' };

// --- Componente Principal ---
export function IncidentsHistoryPage() {
  const [incidents, setIncidents] = useState<IncidentHistoryItem[]>([]);
  const [clientOptions, setClientOptions] = useState<{ value: string; label: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activePage, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  // --- CORRECCIÓN AQUÍ ---
  const PAGE_SIZE = 10; // Valor de producción

  const [filterStatus, setFilterStatus] = useState<string | null>('PENDING');
  const [filterClient, setFilterClient] = useState<string | null>(null);

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (!isInitialMount.current) {
        setPage(1);
    }
  }, [filterStatus, filterClient]);


  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: Record<string, any> = { page: activePage, pageSize: PAGE_SIZE, status: filterStatus, clientId: filterClient };
        Object.keys(params).forEach(key => (params[key] == null || params[key] === '') && delete params[key]);

        const response = await apiClient.get<ApiResponse<PaginatedResponse>>('/notifications/history', { params });
        
        const { notifications, total } = response.data.data;
        setIncidents(notifications);
        setTotalPages(Math.ceil(total / PAGE_SIZE));
      } catch (err) {
        setError('No se pudo cargar el historial de incidencias.');
      } finally {
        setIsLoading(false);
        isInitialMount.current = false;
      }
    };

    fetchHistory();
  }, [activePage, filterStatus, filterClient]);

  useEffect(() => {
    const fetchClients = async () => {
        try {
            const response = await apiClient.get('/clients');
            const options = response.data.data.map((client: { id: string; name: string }) => ({
                value: client.id,
                label: client.name,
            }));
            setClientOptions(options);
        } catch (error) {
            console.error("Failed to fetch clients for filter");
        }
    };
    fetchClients();
  }, []);
  
  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;
  
  const rows = incidents.map((item) => (
    <Table.Tr 
      key={item.id} 
      style={{ backgroundColor: item.isCritical ? 'var(--mantine-color-red-0)' : 'transparent' }}
    >
      <Table.Td>
        <Tooltip label={format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm')}>
            <Text size="sm">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: es })}</Text>
        </Tooltip>
      </Table.Td>
      <Table.Td>{item.visit?.pool?.client?.name || 'N/A'}</Table.Td>
      <Table.Td>{item.visit?.pool?.name || 'N/A'}</Table.Td>
      <Table.Td>{item.visit?.technician?.name || 'N/A'}</Table.Td>
      <Table.Td>
        <Badge color={item.priority ? priorityColors[item.priority] : 'gray'}>
          {item.priority || 'SIN ASIGNAR'}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={statusColors[item.status]}>
          {item.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        {item.visit && (
          <Tooltip label="Ver Parte de Trabajo">
            <ActionIcon component={Link} to={`/visits/${item.visit.id}`} variant="subtle">
              📄
            </ActionIcon>
          </Tooltip>
        )}
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container fluid>
      <Title order={2} my="lg">Gestión de Incidencias</Title>
      
      <Grid align="flex-end" mb="md">
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Select
            label="Filtrar por Cliente" placeholder="Todos los clientes"
            value={filterClient} onChange={setFilterClient}
            data={clientOptions} clearable
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Select
            label="Filtrar por Estado" placeholder="Todos los estados"
            value={filterStatus} onChange={setFilterStatus}
            data={[ { value: 'PENDING', label: 'Pendientes' }, { value: 'RESOLVED', label: 'Resueltas' } ]}
            clearable
          />
        </Grid.Col>
      </Grid>
      
      <Table striped withTableBorder withColumnBorders mt="md">
        <Table.Thead>
            <Table.Tr>
              <Table.Th>Antigüedad</Table.Th>
              <Table.Th>Cliente</Table.Th>
              <Table.Th>Piscina</Table.Th>
              <Table.Th>Técnico</Table.Th>
              <Table.Th>Prioridad</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
            {rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={7}>No se han encontrado incidencias con los filtros seleccionados.</Table.Td></Table.Tr>}
        </Table.Tbody>
      </Table>
      
      {totalPages > 1 && (
          <Center mt="xl">
              <Pagination value={activePage} onChange={setPage} total={totalPages} />
          </Center>
      )}
    </Container>
  );
}