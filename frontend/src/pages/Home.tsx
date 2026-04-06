import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BusLayout } from '../components/BusLayout';
import { ConfirmationScreen } from '../components/ConfirmationScreen';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Ticket, MapPin, Shield } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Home() {
  const { reservations, setReservations, selectedSeats, toggleSeat, clearSelection, soldOut, setSoldOut } = useStore();
  const [activeBus, setActiveBus] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({ fullName: '', cedula: '', phone: '' });
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<any>(null);
  
  const navigate = useNavigate();

  const fetchReservations = async () => {
    try {
      const res = await axios.get(`${API_URL}/reservations`);
      setReservations(res.data);
      const settingsRes = await axios.get(`${API_URL}/settings/sold-out`);
      setSoldOut(settingsRes.data.sold_out);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchReservations();
    const interval = setInterval(fetchReservations, 10000);
    return () => clearInterval(interval);
  }, []);

  const total = selectedSeats.length * 11.50;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeats.length === 0) return alert('Por favor selecciona al menos un asiento.');
    if (!formData.fullName || !formData.cedula || !formData.phone) return alert('Acaba de llenar el formulario.');
    
    setLoading(true);
    try {
      const payload = selectedSeats.map(seat => ({
        bus_number: seat.bus_number,
        seat_number: seat.seat_number,
        full_name: formData.fullName,
        cedula: formData.cedula,
        phone: formData.phone,
        total: 11.50
      }));

      await axios.post(`${API_URL}/reservations`, { reservations: payload });
      
      setLastOrderDetails({
        fullName: formData.fullName,
        seats: selectedSeats.map(s => `B${s.bus_number}-A${s.seat_number}`),
        total
      });
      
      setFormData({ fullName: '', cedula: '', phone: '' });
      clearSelection();
      fetchReservations();
      setShowConfirm(true);
    } catch (e: any) {
      if (e.response && e.response.data.error) {
        alert(e.response.data.error);
        fetchReservations();
      } else {
        alert('Ocurrió un error al reservar.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getLibres = (busNumber: number, total: number) => {
    const occupied = reservations.filter(r => r.bus_number === busNumber).length;
    return total - occupied;
  };

  return (
    <div className="min-h-screen pb-12 w-full bg-black/20">
      
      {showConfirm && lastOrderDetails && (
        <ConfirmationScreen 
          onClose={() => setShowConfirm(false)}
          reservationDetails={lastOrderDetails}
        />
      )}

      {/* Header Area */}
      <div className="w-full flex justify-between items-start pt-12 px-8 lg:px-24 mb-12">
         <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">Tour a Atacames</h1>
            <div className="flex items-center gap-2 text-white/90 font-medium">
               <MapPin size={18} /> San Vicente del Nila
            </div>
         </div>
         <button 
           onClick={() => navigate('/admin')}
           className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm font-semibold transition-colors backdrop-blur-sm"
         >
           <Shield size={16} /> Admin
         </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Info Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#f1f5f9] rounded-2xl p-4 py-5 flex flex-col items-center justify-center text-center shadow-sm">
            <Calendar className="w-7 h-7 text-[#14b8a6] mb-2" />
            <span className="text-[11px] font-bold text-gray-400 tracking-wider">FECHA</span>
            <span className="text-sm font-bold text-gray-700">18 y 19 de abril</span>
          </div>
          <div className="bg-[#f1f5f9] rounded-2xl p-4 py-5 flex flex-col items-center justify-center text-center shadow-sm">
            <Clock className="w-7 h-7 text-[#14b8a6] mb-2" />
            <span className="text-[11px] font-bold text-gray-400 tracking-wider">SALIDA</span>
            <span className="text-sm font-bold text-gray-700">2:00 AM</span>
          </div>
          <div className="bg-[#f1f5f9] rounded-2xl p-4 py-5 flex flex-col items-center justify-center text-center shadow-sm">
            <Ticket className="w-7 h-7 text-[#14b8a6] mb-2" />
            <span className="text-[11px] font-bold text-gray-400 tracking-wider">PRECIO</span>
            <span className="text-sm font-bold text-gray-700">$11.50 / as.</span>
          </div>
          <div className="bg-[#f1f5f9] rounded-2xl p-4 py-5 flex flex-col items-center justify-center text-center shadow-sm">
            <MapPin className="w-7 h-7 text-[#14b8a6] mb-2" />
            <span className="text-[11px] font-bold text-gray-400 tracking-wider">DESTINO</span>
            <span className="text-sm font-bold text-gray-700">Atacames</span>
          </div>
        </div>

        {/* Bus Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#f1f5f9] p-1.5 rounded-full flex gap-1 shadow-md">
            <button 
              className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${activeBus === 1 ? 'bg-[#14b8a6] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveBus(1)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Bus 1 <span className="text-[10px] ml-1 bg-white/20 px-1.5 py-0.5 rounded opacity-90">{getLibres(1, 44)} libres</span>
            </button>
            <button 
              className={`px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${activeBus === 2 ? 'bg-[#14b8a6] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveBus(2)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              Bus 2 <span className="text-[10px] ml-1 bg-gray-500/10 px-1.5 py-0.5 rounded opacity-90">{getLibres(2, 46)} libres</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[1.2fr_0.8fr] gap-8 items-start justify-center">
          
          {/* Bus Layout Side */}
          <div className="flex justify-end w-full">
            <BusLayout 
              busNumber={activeBus} 
              reservations={reservations}
              selectedSeats={selectedSeats}
              onSeatToggle={(bus, seat) => {
                if (soldOut) return alert('El sistema de reservas está SOLDOUT.');
                toggleSeat(bus, seat);
              }}
            />
          </div>

          {/* Form Side */}
          <div className="bg-[#e2e8f0] rounded-[2rem] p-6 sm:p-8 w-full max-w-md shadow-2xl flex flex-col justify-start">
            <h3 className="text-2xl font-bold text-[#1e293b] mb-1">Detalles de Reserva</h3>
            <p className="text-sm font-medium text-gray-500 mb-6 flex items-center gap-1.5">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
               </svg>
               Bus {activeBus} — {activeBus === 1 ? 44 : 46} asientos
            </p>
            
            {soldOut && (
              <div className="bg-rose-500 text-white p-4 rounded-xl mb-6 font-bold text-center">
                 ¡SOLD OUT! Agotado.
              </div>
            )}

            <div className="bg-[#d1e8e4] rounded-xl p-5 mb-8 border border-[#14b8a6]/20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-600">Asientos seleccionados:</span>
                <span className="font-bold text-[#14b8a6] text-right">
                  {selectedSeats.length > 0 ? selectedSeats.map(s => s.seat_number).join(', ') : 'Ninguno'}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[#14b8a6]/20 pt-3">
                <span className="text-sm font-bold text-[#1e293b]">Total a pagar:</span>
                <span className="text-2xl font-extrabold text-[#1e293b]">${total.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
              <div>
                <label className="block text-[13px] font-semibold mb-1.5 text-gray-600">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  disabled={soldOut}
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-0 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1.5 text-gray-600">Teléfono</label>
                <input 
                  type="text" 
                  required
                  disabled={soldOut}
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-0 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold mb-1.5 text-gray-600">Cédula</label>
                <input 
                  type="text" 
                  required
                  disabled={soldOut}
                  value={formData.cedula}
                  onChange={e => setFormData({...formData, cedula: e.target.value})}
                  className="w-full px-4 py-3 bg-white border-0 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#14b8a6] shadow-sm"
                />
              </div>

              <div className="mt-4 flex-1 flex flex-col justify-end">
                  <button 
                    type="submit" 
                    disabled={selectedSeats.length === 0 || loading || soldOut}
                    className={`w-full py-4 rounded-xl font-bold text-[15px] transition-all shadow-md ${
                      selectedSeats.length > 0 && !loading && !soldOut
                        ? 'bg-[#14b8a6] hover:bg-[#0f9b8e] text-white active:scale-[0.98]'
                        : 'bg-[#67c5bc]/70 text-white cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Procesando...' : `Reservar Ahora`}
                  </button>
                  {selectedSeats.length === 0 && !soldOut && (
                     <p className="text-center text-[#f43f5e] text-[11px] font-semibold mt-3">Selecciona al menos un asiento en el mapa.</p>
                  )}
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
