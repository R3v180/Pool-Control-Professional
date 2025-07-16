// filename: packages/client/src/stores/dnd.store.ts
// version: 1.0.0 (NEW)
// description: Store de Zustand para gestionar el estado global de un elemento arrastrado entre componentes.

import { create } from 'zustand';

// El tipo de dato de la visita que vamos a arrastrar
interface DraggableVisit {
  id: string;
  timestamp: string;
  pool: { name: string; client: { name:string } };
  technician: { name: string } | null;
}

// La forma del estado del store
interface DndState {
  draggingVisit: DraggableVisit | null;
  setDraggingVisit: (visit: DraggableVisit | null) => void;
}

export const useDndStore = create<DndState>((set) => ({
  draggingVisit: null,
  setDraggingVisit: (visit) => set({ draggingVisit: visit }),
}));