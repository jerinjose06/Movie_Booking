'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomSelectProps {
  name: string;
  options: string[];
  defaultValue?: string;
  placeholder?: string;
  multiple?: boolean;
}

export function CustomSelect({ 
  name, 
  options, 
  defaultValue = '', 
  placeholder = 'Select options...', 
  multiple = false 
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Initialize selected values
  const [selected, setSelected] = useState<string[]>(() => {
    if (!defaultValue) return [];
    return defaultValue.split(',').map(s => s.trim()).filter(Boolean);
  });
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (opt: string) => {
    if (multiple) {
      if (selected.includes(opt)) {
        setSelected(selected.filter(item => item !== opt));
      } else {
        setSelected([...selected, opt]);
      }
    } else {
      setSelected([opt]);
      setIsOpen(false);
    }
  };

  const displayText = selected.length > 0 ? selected.join(', ') : placeholder;

  return (
    <div className="relative w-full" ref={containerRef}>
      <input type="hidden" name={name} value={selected.join(', ')} />
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white flex justify-between items-center text-sm text-left focus:border-red-500/50 outline-none transition-all"
      >
        <span className={selected.length > 0 ? 'text-white' : 'text-gray-400'}>
          {displayText}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-[#1e1e1e] border border-gray-800 rounded-xl shadow-2xl py-1 max-h-60 overflow-y-auto">
          {options.map((opt) => {
            const isSelected = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-all hover:bg-red-650 hover:text-white flex items-center justify-between ${
                  isSelected ? 'bg-red-600/10 text-red-500 font-medium' : 'text-gray-300'
                }`}
              >
                <span>{opt}</span>
                {isSelected && <Check className="w-4 h-4 text-red-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
