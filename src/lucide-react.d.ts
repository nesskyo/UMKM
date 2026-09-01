// lucide-react v1.34.0 tidak menyertakan type declarations bawaan.
// Deklarasi ambient global ini mencantumkan semua icon yang digunakan di project.
declare module "lucide-react" {
  import type { ComponentType, SVGProps } from "react";

  export type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;
  export type Icon = LucideIcon;

  export const AlertCircle: LucideIcon;
  export const Archive: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const BarChart2: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Bell: LucideIcon;
  export const Building2: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCheck: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const Clock3: LucideIcon;
  export const Eye: LucideIcon;
  export const Filter: LucideIcon;
  export const Inbox: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const Lightbulb: LucideIcon;
  export const LogOut: LucideIcon;
  export const Mail: LucideIcon;
  export const MapPin: LucideIcon;
  export const Menu: LucideIcon;
  export const Package: LucideIcon;
  export const Pencil: LucideIcon;
  export const Phone: LucideIcon;
  export const Plus: LucideIcon;
  export const Receipt: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Save: LucideIcon;
  export const Search: LucideIcon;
  export const Send: LucideIcon;
  export const Settings: LucideIcon;
  export const Sliders: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Target: LucideIcon;
  export const Trash2: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Upload: LucideIcon;
  export const User: LucideIcon;
  export const UserCircle2: LucideIcon;
  export const X: LucideIcon;
  export const Zap: LucideIcon;
}