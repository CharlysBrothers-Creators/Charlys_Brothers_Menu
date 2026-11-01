import React from 'react';
import { Utensils, Leaf, Bell, Heart } from 'lucide-react';
import { FeatureItem } from '../../types/catalog';

interface FeatureBadgeProps {
  feature: FeatureItem;
}

export const FeatureBadge: React.FC<FeatureBadgeProps> = ({ feature }) => {
  const renderIcon = () => {
    const iconProps = {
      className: 'w-5 h-5 sm:w-6 sm:h-6 text-[#F8E6C1] transition-transform duration-300 group-hover:scale-110',
      strokeWidth: 1.75,
    };

    switch (feature.iconName) {
      case 'utensils':
        return <Utensils {...iconProps} />;
      case 'leaf':
        return <Leaf {...iconProps} />;
      case 'bell':
        return <Bell {...iconProps} />;
      case 'heart':
        return <Heart {...iconProps} />;
      default:
        return <Utensils {...iconProps} />;
    }
  };

  return (
    <div className="group flex flex-col items-center text-center cursor-default transition-all duration-300">
      {/* Translucent circular button frame */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-[#1A1A1A]/70 backdrop-blur-md border border-[#D4AF37]/40 shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:border-[#D4AF37] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:bg-[#1A1A1A]/90">
        {renderIcon()}
      </div>

      {/* Feature label */}
      <span className="mt-2 text-[11px] sm:text-xs font-normal text-[#F8E6C1]/90 leading-tight max-w-[72px] sm:max-w-[80px] drop-shadow-sm">
        {feature.title}
      </span>
    </div>
  );
};
