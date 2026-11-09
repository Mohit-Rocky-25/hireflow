import React from 'react';
import { useTheme } from '../../lib/theme/useTheme';

interface DesignGateProps {
  spruce?: React.ComponentType<any>;
  default: React.ComponentType<any>;
  [key: string]: any;
}

export function DesignGate({ spruce: SpruceComponent, default: DefaultComponent, ...rest }: DesignGateProps) {
  const design = useTheme((s) => s.design);

  if (design === 'spruce' && SpruceComponent) {
    return <SpruceComponent {...rest} />;
  }

  return <DefaultComponent {...rest} />;
}
