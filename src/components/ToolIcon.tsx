/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as Icons from 'lucide-react';

interface ToolIconProps {
  name: string;
  className?: string;
}

export const ToolIcon: React.FC<ToolIconProps> = ({ name, className = 'w-5 h-5' }) => {
  // Map icon name to Lucide icon component safely
  const IconComponent = (Icons as unknown as Record<string, React.FC<{ className?: string }>>)[name] || Icons.Wrench;
  return <IconComponent className={className} />;
};
