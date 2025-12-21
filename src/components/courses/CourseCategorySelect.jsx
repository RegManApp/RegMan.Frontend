import { useState, useEffect } from 'react';
import SearchableSelect from '../common/SearchableSelect';
import { courseCategoryApi } from '../../api';
import { normalizeCategories } from '../../utils/helpers';

const CourseCategorySelect = ({
  value,
  onChange,
  error,
  isAdmin = false,
  ...props
}) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCategories = async () => {
    try {
      const response = await courseCategoryApi.getAll();
      const data = response.data || response || [];
      setCategories(normalizeCategories(Array.isArray(data) ? data : data.items || []));
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const options = categories;

  return (
    <SearchableSelect
      label="Course Category"
      value={value}
      onChange={onChange}
      options={options}
      getOptionLabel={cat => cat.name}
      getOptionValue={cat => cat.id}
      error={error}
      required={props.required}
      disabled={isLoading}
      {...props}
    />
  );
};

export default CourseCategorySelect;
