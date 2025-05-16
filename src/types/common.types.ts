// src/types/common.types.ts

// Tipos de setores da empresa
export type SectorType = 'suporte' | 'tecnico' | 'noc' | 'comercial' | 'adm';

// Tipos de papéis de usuário
export type UserRole = 'super_admin' | 'admin' | 'user';

// Utilizamos o mesmo tipo para setor de usuário
export type UserSector = SectorType;

// Erro da API
export interface ApiError {
  message: string;
  status?: number;
}
export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "default" | "danger";
  error?: string | null; // Added error prop
}