import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { HeroBand } from '../ui/HeroBand';
import { Breadcrumb, BreadcrumbItem } from '../ui/Breadcrumb';
import { Button } from '../ui/Button';

export interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  rightCard?: React.ReactNode;
  showNavigationButtons?: boolean;
}

export function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  actions,
  rightCard,
  showNavigationButtons = true,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <HeroBand
      compact
      breadcrumb={
        <div className="flex flex-col gap-3">
          {showNavigationButtons && (
            <div className="flex items-center gap-2">
              <Button
                variant="onBand"
                size="sm"
                onClick={() => navigate(-1)}
                aria-label="Go back to previous page"
                className="h-8 px-3 text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </Button>
              <Button
                variant="onBand"
                size="sm"
                onClick={() => navigate('/')}
                aria-label="Go to home page"
                className="h-8 px-3 text-xs"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </Button>
            </div>
          )}
          <Breadcrumb items={breadcrumbs} onBand />
        </div>
      }
      headline={title}
      lead={subtitle}
      actions={actions}
      rightCard={rightCard}
    />
  );
}
