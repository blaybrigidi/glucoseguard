import React from 'react';
import { useAlerts } from '../context/AlertsContext';
import { Bell, Check } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const AlertsDropdown = () => {
    const { alerts, unreadCount, markAsRead } = useAlerts();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-muted">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Notifications</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {unreadCount} unread alerts
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {alerts.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No recent alerts
                        </div>
                    ) : (
                        alerts.map((alert) => (
                            <DropdownMenuItem key={alert.id} className="cursor-pointer">
                                <div className="flex items-start gap-4 p-2 w-full" onClick={() => markAsRead(alert.id)}>
                                    <div className={cn(
                                        "mt-1 rounded-full p-1",
                                        alert.category === 'HEART_RATE' ? "bg-red-100 text-red-600" :
                                            alert.category === 'SPO2' ? "bg-blue-100 text-blue-600" :
                                                "bg-orange-100 text-orange-600"
                                    )}>
                                        <Bell className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {alert.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatTime(alert.timestamp)}
                                        </p>
                                    </div>
                                    {!alert.isRead && (
                                        <div className="h-2 w-2 rounded-full bg-blue-500 self-center" />
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMins = Math.round((now - date) / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
};

export default AlertsDropdown;
