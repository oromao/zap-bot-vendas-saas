import { useState } from "react";

export function useFormValidation<T extends Record<string, any>>(initial: T) {
  const [form, setForm] = useState<T>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (rules: Record<string, (value: any) => string | null>) => {
    const newErrors: Record<string, string> = {};
    Object.entries(rules).forEach(([field, rule]) => {
      const error = rule(form[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return { form, setForm, errors, setErrors, validate, handleChange };
}
