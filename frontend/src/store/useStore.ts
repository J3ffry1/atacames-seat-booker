import { create } from 'zustand';

export interface Reservation {
  id?: number;
  bus_number: number;
  seat_number: number;
  full_name: string;
  cedula: string;
  phone: string;
  total: number;
  created_at?: string;
}

interface StoreState {
  reservations: Reservation[];
  selectedSeats: { bus_number: number; seat_number: number }[];
  soldOut: boolean;
  setReservations: (res: Reservation[]) => void;
  setSoldOut: (sold: boolean) => void;
  toggleSeat: (bus: number, seat: number) => void;
  clearSelection: () => void;
}

export const useStore = create<StoreState>((set) => ({
  reservations: [],
  selectedSeats: [],
  soldOut: false,
  setReservations: (reservations) => set({ reservations }),
  setSoldOut: (soldOut) => set({ soldOut }),
  toggleSeat: (bus, seat) => set((state) => {
    const isSelected = state.selectedSeats.some(s => s.bus_number === bus && s.seat_number === seat);
    if (isSelected) {
      return { selectedSeats: state.selectedSeats.filter(s => !(s.bus_number === bus && s.seat_number === seat)) };
    } else {
      return { selectedSeats: [...state.selectedSeats, { bus_number: bus, seat_number: seat }] };
    }
  }),
  clearSelection: () => set({ selectedSeats: [] })
}));
