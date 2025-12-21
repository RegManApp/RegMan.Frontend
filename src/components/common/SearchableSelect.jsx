import React, { useState, useMemo } from 'react';

const SearchableSelect = ({ label, options, value, onChange, error, required, placeholder = 'Select...', getOptionLabel, getOptionValue, ...props }) => {
  const [search, setSearch] = useState('');
  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter(opt =>
      getOptionLabel(opt).toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options, getOptionLabel]);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="text"
        className="block w-full mb-2 rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
        placeholder={placeholder}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <select
        className={`block w-full rounded-lg border shadow-sm text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-300' : ''}`}
        value={value}
        onChange={onChange}
        required={required}
        {...props}
      >
        <option value="">{placeholder}</option>
        {filteredOptions.map(opt => (
          <option key={getOptionValue(opt)} value={getOptionValue(opt)}>
            {getOptionLabel(opt)}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

SearchableSelect.defaultProps = {
  getOptionLabel: opt => opt.label || opt.name || '',
  getOptionValue: opt => opt.value || opt.id || '',
};

export default SearchableSelect;
