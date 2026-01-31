// =============================================================================
// ADVANCED SEARCH & FILTERING SYSTEM
// Fuzzy matching, autocomplete, advanced filters, and result highlighting
// =============================================================================

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';
// import Fuse from 'fuse.js'; // Install: npm install fuse.js
import {
  SearchIcon,
  FilterIcon,
  XIcon,
  ChevronDownIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
  BuildingIcon,
  DollarSignIcon,
  SortAscIcon,
  SortDescIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { cacheManager } from '@/lib/cache/redis-manager';

// Try to import Fuse.js, fallback to basic search if not available
let Fuse: any;
try {
  Fuse = require('fuse.js');
} catch (err) {
  console.warn('Fuse.js not available, using basic search functionality');
  
  // Basic search implementation when Fuse.js is not available
  class BasicSearch<T> {
    private data: T[];
    private options: any;

    constructor(data: T[], options: any) {
      this.data = data;
      this.options = options;
    }

    search(query: string): Array<{ item: T; score?: number }> {
      if (!query.trim()) return [];
      
      const results = this.data.filter(item => {
        return this.options.keys.some((key: string) => {
          const value = String((item as any)[key] || '').toLowerCase();
          return value.includes(query.toLowerCase());
        });
      });

      return results.map(item => ({ item, score: 0.5 }));
    }
  }
  
  Fuse = BasicSearch;
}

// =============================================================================
// SMART SEARCH HOOK
// =============================================================================

interface UseSmartSearchOptions {
  searchFields: string[];
  filterFields: FilterField[];
  threshold?: number;
  includeScore?: boolean;
  shouldSort?: boolean;
  cacheKey?: string;
  cacheTime?: number;
}

interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

const useSmartSearch = <T extends Record<string, any>>(
  data: T[],
  options: UseSmartSearchOptions
) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys: options.searchFields,
      threshold: options.threshold || 0.3,
      includeScore: options.includeScore || false,
      shouldSort: options.shouldSort !== false,
      minMatchCharLength: 2,
      findAllMatches: true
    });
  }, [data, options.searchFields, options.threshold, options.includeScore, options.shouldSort]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string, searchFilters: Record<string, any>) => {
      setIsLoading(true);

      try {
        // Check cache first
        if (options.cacheKey) {
          const cacheKey = `search:${options.cacheKey}:${JSON.stringify({ searchQuery, searchFilters, sortField, sortDirection })}`;
          const cached = await cacheManager.get(cacheKey) as { results: T[]; suggestions: string[] } | null;
          if (cached) {
            setResults(cached.results);
            setSuggestions(cached.suggestions);
            setIsLoading(false);
            return;
          }
        }

        let results = data;

        // Apply text search
        if (searchQuery.trim()) {
          const fuseResults = fuse.search(searchQuery);
          results = fuseResults.map(result => result.item);
        }

        // Apply filters
        results = applyFilters(results, searchFilters);

        // Apply sorting
        if (sortField) {
          results = applySorting(results, sortField, sortDirection);
        }

        // Generate suggestions
        const newSuggestions = generateSuggestions(searchQuery, data, options.searchFields);

        // Cache results
        if (options.cacheKey) {
          const cacheKey = `search:${options.cacheKey}:${JSON.stringify({ searchQuery, searchFilters, sortField, sortDirection })}`;
          await cacheManager.set(cacheKey, {
            results,
            suggestions: newSuggestions
          }, options.cacheTime || 300);
        }

        setResults(results);
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [data, fuse, sortField, sortDirection, options.cacheKey, options.cacheTime]
  );

  const [results, setResults] = useState<T[]>(data);

  // Effect for search execution
  useEffect(() => {
    debouncedSearch(query, filters);
  }, [query, filters, debouncedSearch]);

  // Initial results
  useEffect(() => {
    setResults(data);
  }, [data]);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    suggestions,
    isLoading,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    clearSearch: () => {
      setQuery('');
      setFilters({});
      setSortField('');
      setSortDirection('asc');
    }
  };
};

// =============================================================================
// SMART SEARCH COMPONENT
// =============================================================================

interface SmartSearchProps {
  onResults: (results: any[]) => void;
  searchFields: string[];
  filterFields: FilterField[];
  placeholder?: string;
  data: any[];
  className?: string;
}

const SmartSearch: React.FC<SmartSearchProps> = ({
  onResults,
  searchFields,
  filterFields,
  placeholder = 'Search everything...',
  data,
  className = ''
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    suggestions,
    isLoading,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    clearSearch
  } = useSmartSearch(data, {
    searchFields,
    filterFields,
    cacheKey: 'global_search',
    threshold: 0.4
  });

  // Update parent with results
  useEffect(() => {
    onResults(results);
  }, [results, onResults]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    searchInputRef.current?.blur();
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleClearFilter = (key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const activeFiltersCount = Object.keys(filters).filter(key => filters[key]).length;

  return (
    <div className={cn('relative', className)}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <SearchIcon className="w-5 h-5 text-gray-400 ml-3" />
          
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="flex-1 px-3 py-3 text-sm bg-transparent focus:outline-none"
          />

          {isLoading && (
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
          )}

          {query && !isLoading && (
            <button
              onClick={() => {
                setQuery('');
                searchInputRef.current?.focus();
              }}
              className="p-1 text-gray-400 hover:text-gray-600 mr-2"
            >
              <XIcon className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium border-l border-gray-300 transition-colors',
              showFilters || activeFiltersCount > 0
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-700 hover:bg-gray-50'
            )}
          >
            <FilterIcon className="w-4 h-4 mr-1" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                >
                  <SearchIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <HighlightedText text={suggestion} highlight={query} />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">Advanced Filters</h3>
              <div className="flex items-center space-x-2">
                <SortControls
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSortChange={setSortField}
                  onDirectionChange={setSortDirection}
                  fields={searchFields}
                />
                <button
                  onClick={clearSearch}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterFields.map((field) => (
                <FilterField
                  key={field.key}
                  field={field}
                  value={filters[field.key]}
                  onChange={(value) => handleFilterChange(field.key, value)}
                  onClear={() => handleClearFilter(field.key)}
                />
              ))}
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(filters).map(([key, value]) => {
                    if (!value) return null;
                    const field = filterFields.find(f => f.key === key);
                    return (
                      <FilterChip
                        key={key}
                        label={field?.label || key}
                        value={value}
                        onRemove={() => handleClearFilter(key)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="mt-3 text-sm text-gray-600">
        {results.length} result{results.length !== 1 ? 's' : ''} found
        {query && (
          <span className="ml-1">
            for "<span className="font-medium">{query}</span>"
          </span>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// FILTER FIELD COMPONENT
// =============================================================================

interface FilterFieldProps {
  field: FilterField;
  value: any;
  onChange: (value: any) => void;
  onClear: () => void;
}

const FilterField: React.FC<FilterFieldProps> = ({
  field,
  value,
  onChange,
  onClear
}) => {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <div className="relative">
            <input
              type="date"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">{field.label}</span>
          </label>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
      </label>
      <div className="relative">
        {renderField()}
        {value && (
          <button
            onClick={onClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// SORT CONTROLS COMPONENT
// =============================================================================

interface SortControlsProps {
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: string) => void;
  onDirectionChange: (direction: 'asc' | 'desc') => void;
  fields: string[];
}

const SortControls: React.FC<SortControlsProps> = ({
  sortField,
  sortDirection,
  onSortChange,
  onDirectionChange,
  fields
}) => {
  return (
    <div className="flex items-center space-x-2">
      <select
        value={sortField}
        onChange={(e) => onSortChange(e.target.value)}
        className="text-sm border border-gray-300 rounded-md px-2 py-1"
      >
        <option value="">Sort by...</option>
        {fields.map((field) => (
          <option key={field} value={field}>
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </option>
        ))}
      </select>

      {sortField && (
        <button
          onClick={() => onDirectionChange(sortDirection === 'asc' ? 'desc' : 'asc')}
          className="p-1 text-gray-500 hover:text-gray-700"
        >
          {sortDirection === 'asc' ? (
            <SortAscIcon className="w-4 h-4" />
          ) : (
            <SortDescIcon className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
};

// =============================================================================
// FILTER CHIP COMPONENT
// =============================================================================

interface FilterChipProps {
  label: string;
  value: any;
  onRemove: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, value, onRemove }) => {
  const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value;

  return (
    <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
      <span className="font-medium">{label}:</span>
      <span className="ml-1">{displayValue}</span>
      <button
        onClick={onRemove}
        className="ml-2 text-blue-600 hover:text-blue-800"
      >
        <XIcon className="w-3 h-3" />
      </button>
    </div>
  );
};

// =============================================================================
// HIGHLIGHTED TEXT COMPONENT
// =============================================================================

interface HighlightedTextProps {
  text: string;
  highlight: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, highlight }) => {
  if (!highlight) return <span>{text}</span>;

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 text-gray-900">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function applyFilters<T>(data: T[], filters: Record<string, any>): T[] {
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      
      const itemValue = (item as any)[key];
      
      if (typeof value === 'boolean') {
        return itemValue === value;
      }
      
      if (typeof value === 'string') {
        return String(itemValue).toLowerCase().includes(value.toLowerCase());
      }
      
      if (typeof value === 'number') {
        return Number(itemValue) >= Number(value);
      }
      
      return String(itemValue) === String(value);
    });
  });
}

function applySorting<T>(data: T[], field: string, direction: 'asc' | 'desc'): T[] {
  return [...data].sort((a, b) => {
    const aValue = (a as any)[field];
    const bValue = (b as any)[field];
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

function generateSuggestions(query: string, data: any[], fields: string[]): string[] {
  if (!query) return [];
  
  const suggestions = new Set<string>();
  const lowerQuery = query.toLowerCase();
  
  data.forEach(item => {
    fields.forEach(field => {
      const value = String(item[field] || '').toLowerCase();
      if (value.includes(lowerQuery) && value !== lowerQuery) {
        suggestions.add(item[field]);
      }
    });
  });
  
  return Array.from(suggestions).slice(0, 5);
}

export {
  useSmartSearch,
  SmartSearch,
  HighlightedText
};