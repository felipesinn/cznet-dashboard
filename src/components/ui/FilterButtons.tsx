// src/components/ui/FilterButtons.tsx
import React from 'react';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterButtonsProps {
  title: string;
  options: FilterOption[];
  selectedId: string;
  onChange: (id: string) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
  title,
  options,
  selectedId,
  onChange
}) => {
  return (
    <div>
      <h4 className="text-xs text-gray-500 mb-1">{title}</h4>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`px-3 py-1 text-sm rounded-full ${
              selectedId === option.id
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterButtons;