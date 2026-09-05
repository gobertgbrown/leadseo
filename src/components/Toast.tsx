import React from 'react';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  return (
    <div
      id="app-toast"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-[#283044] text-[#eef0ff] rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 border border-[#464555]"
    >
      {type === 'success' && <CheckCircle className="w-4 h-4 text-[#4edea3]" />}
      {type === 'error' && <AlertTriangle className="w-4 h-4 text-[#ffdad6]" />}
      {type === 'info' && <Info className="w-4 h-4 text-[#acedff]" />}
      <span className="font-mono text-xs text-white">{message}</span>
    </div>
  );
};
