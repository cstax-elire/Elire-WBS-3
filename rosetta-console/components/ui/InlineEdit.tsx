"use client";
import { useState, useRef, useEffect } from "react";

type InlineEditProps = {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function InlineEdit({ value, onSave, placeholder = "Click to edit", className = "" }: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="inline-flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={`px-2 py-1 border rounded text-sm ${className}`}
        />
      </div>
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`inline-block px-2 py-1 hover:bg-gray-100 rounded cursor-pointer ${
        !value || value === "?" ? "text-gray-400 italic" : ""
      } ${className}`}
    >
      {value || placeholder}
    </span>
  );
}