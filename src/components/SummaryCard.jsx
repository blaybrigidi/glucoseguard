import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertTriangle, Users, FileText } from 'lucide-react';

const iconMap = {
  'Activity': Activity,
  'AlertTriangle': AlertTriangle,
  'Users': Users,
  'FileText': FileText
};

const SummaryCard = ({ title, value, subtext, type = 'normal', icon, onClick = null, isActive = false }) => {
  const isAlert = type === 'critical'; // Matching dashboard logic
  const Icon = iconMap[icon] || Activity;

  return (
    <Card
      className={`h-full transition-all duration-300 hover:shadow-lg ${onClick ? 'cursor-pointer' : 'cursor-default'} ${isActive ? 'border-primary' : 'border-border'}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <div className="relative">
          <Icon className={`h-4 w-4 ${isAlert ? 'text-red-500' : 'text-muted-foreground'}`} />
          {isAlert && (
            <div
              className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-light tracking-tight text-foreground">
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtext}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
