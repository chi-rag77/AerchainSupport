import { useOrgData } from './use-org-user';
import { UserRole } from '@/types';

export function usePermissions() {
  const { orgUser } = useOrgData();
  const role: UserRole = orgUser?.role ?? "viewer";

  return {
    canExport:       ["admin", "manager"].includes(role),
    canUseAI:        ["admin", "manager"].includes(role),
    canManageUsers:  role === "admin",
    canManageSettings: role === "admin",
    canManageRules:  ["admin", "manager"].includes(role),
    canDeleteRules:  role === "admin",
    canSync:         ["admin", "manager"].includes(role),
    canViewAuditLog: ["admin", "manager"].includes(role),
    canUploadToKnowledge: ["admin", "manager"].includes(role),
    isAdmin:         role === "admin",
    isManager:       role === "manager",
    isViewer:        role === "viewer",
    role,
  };
}