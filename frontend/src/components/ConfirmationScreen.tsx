import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Copy, Send } from 'lucide-react';

interface ConfirmationScreenProps {
  onClose: () => void;
  reservationDetails: {
    fullName: string;
    seats: string[];
    total: number;
  };
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ onClose, reservationDetails }) => {
  const accountInfo = {
    bank: "Banco Pichincha",
    type: "Ahorros",
    number: "2215367864",
    name: "Johana Elizabeth Borja Ochoa"
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(accountInfo.number);
  };

  const handleWhatsApp = () => {
    const seatsStr = reservationDetails.seats.join(', ');
    const text = `Hola! Acabo de reservar los asientos ${seatsStr} a nombre de ${reservationDetails.fullName}. El total es $${reservationDetails.total.toFixed(2)}. Adjunto el comprobante de pago.`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/593981053133?text=${encodedText}`, '_blank');
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e293b]/60 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white w-full max-w-md p-8 rounded-3xl text-[#1e293b] shadow-2xl"
        >
          <div className="flex flex-col items-center mb-6">
            <CheckCircle2 className="w-16 h-16 text-[#14b8a6] mb-3" />
            <h2 className="text-2xl font-bold text-center">¡Pedido Registrado!</h2>
            <p className="text-sm text-center text-gray-500 mt-2 font-medium">
              Tus asientos han sido apartados. Para confirmar tu reserva, realiza el pago y envía el comprobante.
            </p>
          </div>

          <div className="bg-[#f8fafc] rounded-2xl p-5 mb-5 border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Resumen</h3>
            <div className="flex justify-between mb-2 text-sm font-medium">
              <span className="text-gray-500">A nombre de:</span>
              <span className="text-[#1e293b]">{reservationDetails.fullName}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm font-medium">
              <span className="text-gray-500">Asientos:</span>
              <span className="text-[#14b8a6] font-bold">{reservationDetails.seats.join(', ')}</span>
            </div>
            <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
              <span className="font-bold">Total a pagar:</span>
              <span className="font-extrabold text-[#1e293b] text-lg">${reservationDetails.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-[#f0fdfa] border border-[#14b8a6]/20 rounded-2xl p-5 mb-6 relative">
            <h3 className="text-xs font-bold text-[#14b8a6] uppercase tracking-wider mb-3">Datos Bancarios</h3>
            <div className="text-sm space-y-2 text-gray-600 font-medium tracking-tight">
              <p><span className="text-gray-400">Banco:</span> {accountInfo.bank}</p>
              <p><span className="text-gray-400">Tipo de cuenta:</span> {accountInfo.type}</p>
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-[#14b8a6]/10">
                <p><span className="text-gray-400">Número:</span> <span className="font-bold text-[#1e293b]">{accountInfo.number}</span></p>
                <button onClick={handleCopy} className="p-1.5 hover:bg-[#14b8a6]/10 rounded-md text-[#14b8a6] transition-colors" title="Copiar cuenta">
                  <Copy size={16} />
                </button>
              </div>
              <p><span className="text-gray-400">Titular:</span> {accountInfo.name}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fae54] text-white py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
            >
              <Send size={18} />
              Enviar Comprobante por WhatsApp
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3.5 rounded-xl text-gray-400 hover:text-gray-600 font-semibold transition-colors"
            >
              Cerrar y volver al mapa
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
