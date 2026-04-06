import React from 'react';
import { Seat } from './Seat';
import type { Reservation } from '../store/useStore';

interface BusLayoutProps {
  busNumber: number;
  reservations: Reservation[];
  selectedSeats: { bus_number: number; seat_number: number }[];
  onSeatToggle: (bus: number, seat: number) => void;
  isAdmin?: boolean;
}

export const BusLayout: React.FC<BusLayoutProps> = ({ busNumber, reservations, selectedSeats, onSeatToggle, isAdmin }) => {
  const getSeatStatus = (seatNumber: number): 'free' | 'occupied' | 'selected' => {
    if (reservations.some(r => r.bus_number === busNumber && r.seat_number === seatNumber)) return 'occupied';
    if (selectedSeats.some(s => s.bus_number === busNumber && s.seat_number === seatNumber)) return 'selected';
    return 'free';
  };

  const getPassengerName = (seatNumber: number) => {
    return reservations.find(r => r.bus_number === busNumber && r.seat_number === seatNumber)?.full_name;
  };

  const renderSeat = (num: number) => (
    <Seat 
      key={num} 
      number={num} 
      status={getSeatStatus(num)} 
      passengerName={getPassengerName(num)} 
      isAdmin={isAdmin} 
      onClick={() => onSeatToggle(busNumber, num)} 
    />
  );

  const renderEmpty = (key: string) => <div key={key} className="w-9 sm:w-10 h-11 sm:h-12 border-2 border-transparent"></div>;

  let grid = [];

  if (busNumber === 1) {
    grid.push([1, 2, 'empty', 3]);
    let currentSeat = 4;
    for (let i = 0; i < 9; i++) {
      grid.push([currentSeat, currentSeat+1, currentSeat+2, currentSeat+3]);
      currentSeat += 4;
    }
    grid.push([40, 41, 42, 43, 44]);
  } else {
    // El asiento 1 estará en la cabecera junto al conductor
    let currentSeat = 2;
    for (let i = 0; i < 10; i++) {
      grid.push([currentSeat, currentSeat+1, currentSeat+2, currentSeat+3]);
      currentSeat += 4;
    }
    grid.push([42, 43, 44, 45, 46]);
  }

  return (
    <div className="bg-white rounded-[2rem] p-6 sm:p-8 w-full max-w-sm mx-auto shadow-2xl border border-gray-100 h-full flex flex-col">
      {!isAdmin && (
        <h2 className="text-xl font-bold text-[#1e293b] mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#14b8a6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Bus {busNumber} — Selecciona tus asientos
        </h2>
      )}

      <div className={`p-4 sm:p-6 w-full relative flex-1 ${isAdmin ? '' : 'bg-[#f8fafc] rounded-[2rem] border border-gray-100 shadow-inner'}`}>
        
        {/* Fila del Conductor */}
        <div className="flex justify-between items-center w-full mb-8 relative px-4 sm:px-6">
          <div className="bg-[#cbd5e1] text-[#475569] text-xs font-bold py-3 px-6 rounded-xl text-center shadow-inner tracking-wide flex-1 mr-4 shrink-0">
            CONDUCTOR / FRENTE
          </div>
          {busNumber === 2 && (
            <div className="flex justify-end items-center mr-2 sm:mr-4">
              {renderSeat(1)}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 items-center">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className={`flex ${row.length === 5 ? 'gap-2' : ''} justify-center w-full`}>
              {row.length === 4 ? (
                <>
                  <div className="flex gap-2 mr-6 sm:mr-8">
                    {row[0] === 'empty' ? renderEmpty('l0') : renderSeat(row[0] as number)}
                    {row[1] === 'empty' ? renderEmpty('l1') : renderSeat(row[1] as number)}
                  </div>
                  <div className="w-[1px] bg-gray-200 absolute top-20 bottom-8 left-1/2 -translate-x-1/2"></div>
                  <div className="flex gap-2 ml-6 sm:ml-8">
                    {row[2] === 'empty' ? renderEmpty('l2') : renderSeat(row[2] as number)}
                    {row[3] === 'empty' ? renderEmpty('l3') : renderSeat(row[3] as number)}
                  </div>
                </>
              ) : (
                 row.map((seat) => renderSeat(seat as number))
              )}
            </div>
          ))}
        </div>
      </div>

      {!isAdmin && (
        <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-100 text-[11px] sm:text-xs font-semibold text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 border-[2px] border-[#22c55e] rounded-[4px]"></div> Disponible
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-[#fbbf24] border-[2px] border-[#f59e0b] rounded-[4px]"></div> Seleccionado
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-[#f43f5e] border-[2px] border-[#e11d48] rounded-[4px]"></div> Reservado
          </div>
        </div>
      )}
    </div>
  );
};
