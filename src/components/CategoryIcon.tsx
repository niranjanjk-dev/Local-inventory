import React from 'react';
import {
  Cpu,
  Boxes,
  Bot,
  Wrench,
  Cog,
  BookOpen,
  Gamepad2,
  Nut,
  Grid,
  Package,
  Layers,
  Radio,
  Tv,
  Camera,
  Shirt,
  Disc,
  Glasses,
  Zap,
  Hammer,
  Palette,
  Laptop,
  Folder,
  Archive,
  Compass,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
  size?: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Cpu,
  Boxes,
  Bot,
  Wrench,
  Cog,
  BookOpen,
  Gamepad2,
  Nut,
  Grid,
  Package,
  Layers,
  Radio,
  Tv,
  Camera,
  Shirt,
  Disc,
  Glasses,
  Zap,
  Hammer,
  Palette,
  Laptop,
  Folder,
  Archive,
  Compass,
};

export const AVAILABLE_CATEGORY_ICONS = Object.keys(ICON_MAP);

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', color, size }) => {
  const IconComponent = ICON_MAP[name] || Package;
  const isHexColor = color?.startsWith('#') || color?.startsWith('rgb');
  return <IconComponent className={className} style={isHexColor ? { color } : undefined} size={size} />;
};
