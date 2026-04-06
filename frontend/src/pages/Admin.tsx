import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { BusLayout } from '../components/BusLayout';
import { Download, Trash2, Home as HomeIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const { reservations, setReservations, soldOut, setSoldOut } = useStore();
  const navigate = useNavigate();

  const fetchAdminData = async () => {
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
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta reserva?')) {
      try {
        await axios.delete(`${API_URL}/reservations/${id}`);
        fetchAdminData();
      } catch (e) {
        console.error(e);
        alert('Error al eliminar');
      }
    }
  };

  const handleToggleSoldOut = async () => {
    try {
      const newVal = !soldOut;
      await axios.post(`${API_URL}/settings/sold-out`, { sold_out: newVal });
      setSoldOut(newVal);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8fafc]">
        <form onSubmit={handleLogin} className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col gap-5 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-center text-[#1e293b]">Admin Login</h2>
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-[#14b8a6]"
          />
          <button type="submit" className="py-3 rounded-xl bg-[#14b8a6] hover:bg-[#0f9b8e] text-white font-bold transition-all shadow-md mt-2">
            Ingresar
          </button>
          <button type="button" onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-gray-600 font-medium text-center hover:underline">
            ← Volver al Inicio
          </button>
        </form>
      </div>
    );
  }

  const exportCsv = () => window.open(`${API_URL}/export/csv`, '_blank');

  const occBus1 = reservations.filter(r => r.bus_number === 1).length;
  const occBus2 = reservations.filter(r => r.bus_number === 2).length;
  const totalMoney = reservations.reduce((sum, r) => sum + Number(r.total), 0);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#f8fafc] text-[#334155]">
      <div className="max-w-[1200px] mx-auto space-y-6">
        
        {/* Top Header / Sold Out */}
        <div className="bg-white rounded-2xl p-4 px-6 shadow-sm border border-gray-100 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <button onClick={() => navigate('/')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                  <HomeIcon size={18} />
              </button>
              <div>
                <h2 className="font-bold text-[#1e293b]">Estado SOLD OUT</h2>
                <p className="text-xs text-gray-400">Desactiva las reservas para el público</p>
              </div>
           </div>
           
           {/* Toggle switch visual */}
           <div 
             onClick={handleToggleSoldOut}
             className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors ${soldOut ? 'bg-rose-500' : 'bg-gray-200'}`}
           >
             <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${soldOut ? 'translate-x-7' : ''}`}></div>
           </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-full text-blue-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bus 1 - Ocupados</p>
                 <p className="text-xl font-extrabold text-[#1e293b]">{occBus1}<span className="text-sm font-medium text-gray-400">/44</span></p>
              </div>
           </div>
           <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-full text-purple-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bus 2 - Ocupados</p>
                 <p className="text-xl font-extrabold text-[#1e293b]">{occBus2}<span className="text-sm font-medium text-gray-400">/46</span></p>
              </div>
           </div>
           <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-emerald-50 p-3 rounded-full text-emerald-500 font-bold text-xl">$</div>
              <div>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Confirmados (Aprox)</p>
                 <p className="text-xl font-extrabold text-[#1e293b]">${totalMoney.toFixed(2)}</p>
              </div>
           </div>
           <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
               <button onClick={exportCsv} className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl hover:bg-gray-50 transition text-gray-500">
                  <Download size={20} className="mb-1 text-[#14b8a6]" />
                  <span className="text-xs font-bold">CSV</span>
               </button>
           </div>
        </div>

        {/* Side-by-side Buses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <BusLayout 
             busNumber={1} 
             reservations={reservations}
             selectedSeats={[]}
             onSeatToggle={() => {}}
             isAdmin={true}
           />
           <BusLayout 
             busNumber={2} 
             reservations={reservations}
             selectedSeats={[]}
             onSeatToggle={() => {}}
             isAdmin={true}
           />
        </div>

        {/* Reserves Table */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-[#1e293b] mb-6">Todas las Reservas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Bus</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Asiento</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">No hay reservas todavía.</td></tr>
                )}
                {reservations.map((res) => (
                  <tr key={res.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-4 font-bold text-gray-500">B{res.bus_number}</td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-[#1e293b]">{res.full_name}</p>
                      <p className="text-xs text-gray-400">{res.cedula}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-500">{res.phone}</td>
                    <td className="px-4 py-4">
                       <span className="bg-[#14b8a6]/10 text-[#14b8a6] px-2 py-1 rounded-md font-bold">
                          #{res.seat_number}
                       </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-emerald-500">${Number(res.total).toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <button 
                        onClick={() => handleDelete(res.id!)}
                        className="text-rose-400 hover:text-rose-600 p-2 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
