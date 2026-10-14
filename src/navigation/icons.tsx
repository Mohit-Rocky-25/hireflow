// ============================================================
// HireFlow Navigation System — Icon Resolver
// Maps serializable icon string names to Lucide icons
// ============================================================

import React from 'react';
import * as LucideIcons from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home: LucideIcons.Home,
  LayoutDashboard: LucideIcons.LayoutDashboard,
  FileSearch: LucideIcons.FileSearch,
  FileText: LucideIcons.FileText,
  FileEdit: LucideIcons.FileEdit,
  Mail: LucideIcons.Mail,
  Send: LucideIcons.Send,
  GitCompare: LucideIcons.GitCompare,
  FolderGit2: LucideIcons.FolderGit2,
  Compass: LucideIcons.Compass,
  Building2: LucideIcons.Building2,
  Layers: LucideIcons.Layers,
  Award: LucideIcons.Award,
  Sparkles: LucideIcons.Sparkles,
  Search: LucideIcons.Search,
  Briefcase: LucideIcons.Briefcase,
  Users: LucideIcons.Users,
  UserCheck: LucideIcons.UserCheck,
  User: LucideIcons.User,
  Calendar: LucideIcons.Calendar,
  ClipboardList: LucideIcons.ClipboardList,
  BarChart3: LucideIcons.BarChart3,
  Settings: LucideIcons.Settings,
  Shield: LucideIcons.Shield,
  ShieldAlert: LucideIcons.ShieldAlert,
  Bell: LucideIcons.Bell,
  CheckCircle2: LucideIcons.CheckCircle2,
  AlertTriangle: LucideIcons.AlertTriangle,
  Database: LucideIcons.Database,
  TrendingUp: LucideIcons.TrendingUp,
  Target: LucideIcons.Target,
  Zap: LucideIcons.Zap,
  Coins: LucideIcons.Coins,
  Cpu: LucideIcons.Cpu,
  GraduationCap: LucideIcons.GraduationCap,
  ListChecks: LucideIcons.ListChecks,
  PlusCircle: LucideIcons.PlusCircle,
  Clock: LucideIcons.Clock,
  ExternalLink: LucideIcons.ExternalLink,
  BookOpen: LucideIcons.BookOpen,
  HelpCircle: LucideIcons.HelpCircle,
  LogOut: LucideIcons.LogOut,
};

export function getNavIcon(name: string, className = 'w-5 h-5') {
  const IconComponent = ICON_MAP[name] || (LucideIcons as any)[name] || LucideIcons.Layers;
  return <IconComponent className={className} />;
}

export function isValidIcon(name: string): boolean {
  return !!(ICON_MAP[name] || (LucideIcons as any)[name]);
}
