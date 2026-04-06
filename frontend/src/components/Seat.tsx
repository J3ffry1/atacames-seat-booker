import React from 'react';
import { motion } from 'framer-motion';

interface SeatProps {
  number: number | string;
  status: 'free' | 'occupied' | 'selected';
  passengerName?: string;
  onClick?: () => void;
  isAdmin?: boolean;
}

export const Seat: React.FC<SeatProps> = ({ number, status, passengerName, onClick, isAdmin }) => {
  let colorClasses = "";
  if (status === 'free') {
    colorClasses = "bg-white border-[#22c55e] text-[#22c55e]";
  } else if (status === 'occupied') {
    colorClasses = "bg-[#f43f5e] border-[#e11d48] text-white";
  } else if (status === 'selected') {
    colorClasses = "bg-[#fbbf24] border-[#f59e0b] text-white";
  }

  return (
    <div className="flex flex-col items-center">
      <motion.button
        type="button"
        whileHover={status !== 'occupied' && !isAdmin ? { scale: 1.05 } : {}}
        whileTap={status !== 'occupied' && !isAdmin ? { scale: 0.95 } : {}}
        onClick={() => {
          if (status !== 'occupied' && !isAdmin) onClick?.();
        }}
        className={`w-9 h-11 relative rounded-md border-[2px] flex items-center justify-center font-bold text-sm sm:w-10 sm:h-12 transition-colors ${colorClasses}`}
      >
        <div className={`absolute top-1 w-5 h-1 rounded-full ${status === 'free' ? 'bg-[#22c55e]' : 'bg-white'} opacity-40`}></div>
        <span className="mt-1">{number}</span>
      </motion.button>
      {isAdmin && status === 'occupied' && passengerName && (
        <span className="text-[10px] mt-1 text-gray-500 font-medium truncate w-14 text-center">
          {passengerName.split(' ')[0]}
        </span>
      )}
    </div>
  );
};
