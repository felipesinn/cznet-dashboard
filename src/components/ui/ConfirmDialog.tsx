// src/components/ui/ConfirmDialog.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  isOpen,
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;
  
  // Determinar cores com base na variante
  const getColors = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: 'text-red-600',
          confirm: 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'warning':
        return {
          icon: 'text-yellow-600',
          confirm: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        };
      case 'info':
        return {
          icon: 'text-blue-600',
          confirm: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
      default:
        return {
          icon: 'text-red-600',
          confirm: 'bg-red-600 hover:bg-red-700 text-white',
        };
    }
  };
  
  const colors = getColors();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-md max-w-md w-full p-6">
        <div className={`flex items-center mb-4 ${colors.icon}`}>
          <AlertTriangle size={24} className="mr-2" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        
        <p className="mb-6 text-gray-700">{message}</p>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-md ${colors.confirm}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;