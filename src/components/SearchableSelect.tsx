import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { Language } from '../translations';

export interface SelectOption {
  id: string;
  name_hi: string;
  name_en: string;
}

interface SearchableSelectProps {
  label: string;
  placeholder: string;
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  disabledHelp?: string;
  currentLang: Language;
  required?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled = false,
  disabledHelp,
  currentLang,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Selected item
  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.id === value);
  }, [options, value]);

  // Sorted and filtered options
  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const sorted = [...options].sort((a, b) => {
      const nameA = currentLang === 'hi' ? a.name_hi : a.name_en;
      const nameB = currentLang === 'hi' ? b.name_hi : b.name_en;
      return nameA.localeCompare(nameB, currentLang === 'hi' ? 'hi' : 'en');
    });

    if (!query) return sorted;

    return sorted.filter((opt) => {
      return (
        opt.name_hi.toLowerCase().includes(query) ||
        opt.name_en.toLowerCase().includes(query)
      );
    });
  }, [options, searchQuery, currentLang]);

  const selectedDisplayName = selectedOption
    ? currentLang === 'hi'
      ? selectedOption.name_hi
      : selectedOption.name_en
    : '';

  return (
    <div className="space-y-1.5 text-left relative" ref={containerRef}>
      <label className="field-label text-gray-800 block">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Main trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 px-3.5 rounded-xl border text-left flex items-center justify-between gap-2 text-sm transition-all ${
          disabled
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            : isOpen
            ? 'bg-white border-[#2E7D32] ring-2 ring-[#2E7D32]/20 shadow-xs'
            : 'bg-[#FFFDF7] border-[#E8E4D8] hover:border-[#2E7D32]/60 hover:bg-white text-gray-900 shadow-2xs'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`truncate font-medium ${!selectedDisplayName ? 'text-gray-400' : 'text-gray-900'}`}>
          {selectedDisplayName || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {disabled && disabledHelp && (
        <p className="helper-text text-gray-500 mt-1">
          {disabledHelp}
        </p>
      )}

      {/* Dropdown panel */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-2xl border border-[#E8E4D8] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input bar */}
          <div className="p-2.5 border-b border-gray-100 bg-[#FFFDF7] flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={currentLang === 'hi' ? 'खोजें...' : 'Search...'}
              className="w-full bg-transparent text-sm text-gray-900 focus:outline-none placeholder-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List items */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-500">
                {currentLang === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No results found'}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.id === value;
                const displayName = currentLang === 'hi' ? opt.name_hi : opt.name_en;
                const secondaryName = currentLang === 'hi' ? opt.name_en : opt.name_hi;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-left text-sm flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#E8F5E9] text-[#1B5E20] font-semibold'
                        : 'hover:bg-[#F1F8E9]/60 text-gray-800'
                    }`}
                  >
                    <div className="truncate">
                      <span>{displayName}</span>
                      <span className="text-xs text-gray-400 ml-1.5 font-normal">
                        ({secondaryName})
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#2E7D32] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
