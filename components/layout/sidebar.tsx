"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store/ui-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Camera, 
  Search, 
  Package, 
  BarChart3, 
  Settings, 
  Gauge, 
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { FallbackImage } from '@/components/fallback-image';

const navigation = [
  { name: 'Captura', href: '/app/captura', icon: Camera },
  { name: 'Análises', href: '/app/analises', icon: Search },
  { name: 'Relatórios', href: '/app/relatorios', icon: BarChart3 },
  { name: 'Auditoria', href: '/app/auditoria', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <div className={cn(
      'flex h-screen flex-col border-r bg-card transition-all duration-300',
      sidebarCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-2">
            <FallbackImage 
              src="/brand/ciser-logo.png" 
              alt="CISER" 
              className="h-8 w-auto"
              fallbackText="CISER"
              fallbackClassName="text-lg font-bold text-primary"
            />
            <div className="text-sm font-medium text-muted-foreground">
              CorroScan
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-8 w-8 p-0"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible-outline',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground',
                  sidebarCollapsed && 'justify-center'
                )}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <item.icon className={cn('h-4 w-4', !sidebarCollapsed && 'mr-3')} />
                {!sidebarCollapsed && (
                  <span>{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!sidebarCollapsed && (
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground">
            CISER CorroScan v1.0
          </div>
          <div className="text-xs text-muted-foreground">
            Jaraguá do Sul, SC
          </div>
        </div>
      )}
    </div>
  );
}