// src/main/src/components/Form/FormFileUpload.tsx

import React, { useState } from "react";

interface FormFileUploadProps {
  label: string;
  name: string;
  onChange: (file: File | null) => void;
  error?: string;
  accept?: string;
  required?: boolean;
  disabled?: boolean;
  currentImageUrl?: string;
}

export const FormFileUpload: React.FC<FormFileUploadProps> = ({
  label,
  name,
  onChange,
  error,
  accept = "image/*",
  required = false,
  disabled = false,
  currentImageUrl,
}) => {
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>

      {preview && (
        <div className="file-preview">
          <img src={preview} alt="Preview" className="preview-image" />
          <button
            type="button"
            onClick={handleRemove}
            className="btn btn-sm btn-danger remove-preview"
            disabled={disabled}
          >
            Remove
          </button>
        </div>
      )}

      <input
        id={name}
        name={name}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        required={required && !preview}
        disabled={disabled}
        className={`form-control ${error ? "is-invalid" : ""}`}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};
