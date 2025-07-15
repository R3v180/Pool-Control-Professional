// ====== [10] packages/client/src/features/admin/pages/IncidentsHistoryPage.tsx ======
// filename: packages/client/src/features/admin/pages/IncidentsHistoryPage.tsx
// version: 2.5.1 (FIX: Remove unused imports)
// description: Cleaned up unused imports after refactoring.

import { useEffect, useState } from 'react';
// ✅ 1. Eliminar useRef
import { Container, Title, Table, Loader, Alert, Badge, ActionIcon, Tooltip, Select, Grid, Pagination, Center } from '@mantine/core';
// ✅ 2. Eliminar Text
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../../../api/apiClient';
import { } from 'date-fns';
// ✅ 3. Eliminar es
import 'date-fns/locale/es';


// --- Tipos de Datos ---
type IncidentStatus = 'PENDING' | 'RESOLVED';
type IncidentPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

interface IncidentHistoryItem {
  id: string;
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
  
  const [searchParams, setSearchParams] = useSearchParams();

  const [activePage, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 10;
  
  const [filterStatus, setFilterStatus] = useState<string | null>(searchParams.get('status') || 'PENDING');
  const [filterClient, setFilterClient] = useState<string | null>(searchParams.get('clientId') || null);

  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterStatus) params.set('status', filterStatus);
    if (filterClient) params.set('clientId', filterClient);
    if (activePage > 1) params.set('page', activePage.toString());
    
    setSearchParams(params, { replace: true });

  }, [filterStatus, filterClient, activePage, setSearchParams]);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      
      const params: Record<string, any> = { page: activePage, pageSize: PAGE_SIZE, status: filterStatus, clientId: filterClient };
      Object.keys(params).forEach(key => (params[key] == null || params[key] === '') && delete params[key]);

      try {
        const response = await apiClient.get<ApiResponse<PaginatedResponse>>('/notifications/history', { params });
        const { notifications, total } = response.data.data;
        setIncidents(notifications);
        setTotalPages(Math.ceil(total / PAGE_SIZE));
      } catch (err) {
        setError('No se pudo cargar el historial de incidencias.');
      } finally {
        setIsLoading(false);
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
  
  const handleRowClick = (notificationId: string) => {
    navigate(`/incidents/${notificationId}`);
  };

  if (isLoading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Error">{error}</Alert>;
  
  const rows = incidents.map((item) => (
    <Table.Tr 
      key={item.id} 
      style={{ 
        backgroundColor: item.isCritical ? 'var(--mantine-color-red-0)' : 'transparent',
        cursor: 'pointer'
      }}
      onClick={() => handleRowClick(item.id)}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-1)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = item.isCritical ? 'var(--mantine-color-red-0)' : 'transparent'}
    >
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
          <Tooltip label="Ver Parte de Trabajo Original">
            <ActionIcon component={Link} to={`/visits/${item.visit.id}`} variant="subtle" onClick={(e) => e.stopPropagation()}>
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
            value={filterStatus} onChange={(value) => { setFilterStatus(value); setPage(1); }}
            data={[ { value: 'PENDING', label: 'Pendientes' }, { value: 'RESOLVED', label: 'Resueltas' } ]}
            clearable
          />
        </Grid.Col>
      </Grid>
      
      <Table striped withTableBorder withColumnBorders mt="md">
        <Table.Thead>
            <Table.Tr>
              <Table.Th>Cliente</Table.Th>
              <Table.Th>Piscina</Table.Th>
              <Table.Th>Técnico</Table.Th>
              <Table.Th>Prioridad</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
            {rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={6}>No se han encontrado incidencias con los filtros seleccionados.</Table.Td></Table.Tr>}
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