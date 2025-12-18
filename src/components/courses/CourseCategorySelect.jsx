import { useState, useEffect } from 'react';
import { Select, Button, Modal, Input } from '../common';
import { courseCategoryApi } from '../../api';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CourseCategorySelect = ({
  value,
  onChange,
  error,
  isAdmin = false,
  ...props
}) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);

  const loadCategories = async () => {
    try {
      const response = await courseCategoryApi.getAll();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await courseCategoryApi.create(newCategory);
      toast.success('Category created successfully');
      setCategories([...categories, response.data]);
      onChange?.({ target: { value: response.data.id } });
      setIsModalOpen(false);
      setNewCategory({ name: '', description: '' });
    } catch (error) {
      console.error('Failed to create category:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const options = [
    { value: '', label: 'Select Category' },
    ...categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
    })),
  ];

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <Select
            label="Course Category"
            value={value}
            onChange={onChange}
            options={options}
            error={error}
            disabled={isLoading}
            {...props}
          />
        </div>
        {isAdmin && (
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={PlusIcon}
              onClick={() => setIsModalOpen(true)}
              className="mb-1"
            >
              New
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewCategory({ name: '', description: '' });
        }}
        title="Create Course Category"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            placeholder="e.g., Computer Science"
          />
          <Input
            label="Description (Optional)"
            value={newCategory.description}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            placeholder="Brief description..."
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setNewCategory({ name: '', description: '' });
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} loading={isSaving}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseCategorySelect;
