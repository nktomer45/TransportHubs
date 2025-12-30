import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Truck,
  BarChart3,
  FileText,
  Users,
  Settings,
  ChevronDown,
  Map,
  Clock,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  active?: boolean;
  children?: { label: string; href: string }[];
}

const menuItems: MenuItem[] = [
  { icon: BarChart3, label: 'Dashboard', href: '#' },
  {
    icon: Package,
    label: 'Shipments',
    active: true,
    children: [
      { label: 'All Shipments', href: '#' },
      { label: 'Create New', href: '#' },
      { label: 'Templates', href: '#' },
    ],
  },
  {
    icon: Truck,
    label: 'Carriers',
    children: [
      { label: 'All Carriers', href: '#' },
      { label: 'Rates', href: '#' },
      { label: 'Contracts', href: '#' },
    ],
  },
  { icon: Map, label: 'Tracking', href: '#' },
  { icon: Clock, label: 'Schedule', href: '#' },
  { icon: AlertTriangle, label: 'Exceptions', href: '#' },
  { icon: FileText, label: 'Reports', href: '#' },
  { icon: Users, label: 'Team', href: '#' },
  { icon: Settings, label: 'Settings', href: '#' },
];

function MenuItemComponent({ item, isCollapsed }: { item: MenuItem; isCollapsed?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(item.active);
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  return (
    <div>
      <button
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
          item.active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {hasChildren && (
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'rotate-180'
                )}
              />
            )}
          </>
        )}
      </button>

      {/* Submenu */}
      <AnimatePresence>
        {hasChildren && isExpanded && !isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-6 mt-1 space-y-1 border-l border-border pl-3">
              {item.children?.map((child) => (
                <a
                  key={child.label}
                  href={child.href}
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                >
                  {child.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 z-50 h-screen w-[280px] border-r border-border bg-sidebar flex flex-col"
            style={{ background: 'var(--gradient-sidebar)' }}
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="font-display font-bold text-primary-foreground text-sm">TM</span>
                </div>
                <span className="font-display font-semibold text-lg">TransportHub</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-1">
              {menuItems.map((item) => (
                <MenuItemComponent key={item.label} item={item} />
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Need help?</p>
                <a href="#" className="text-sm text-primary hover:underline">
                  Contact Support
                </a>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
