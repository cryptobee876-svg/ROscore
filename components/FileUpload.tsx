import React, { useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileSelect(e.dataTransfer.files[0]);
      }
    },
    [onFileSelect, disabled]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ${
        disabled
          ? 'border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed'
          : 'border-infosys-blue/40 bg-blue-50/30 hover:bg-blue-50 hover:border-infosys-blue cursor-pointer'
      }`}
    >
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-white rounded-full shadow-sm">
          <svg className="w-8 h-8 text-infosys-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-700">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-gray-500 mt-1">
            PDF, DOCX, or TXT (Max 5MB)
          </p>
        </div>
        <div className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full font-medium">
          Strictly secure. Files are processed in memory.
        </div>
      </div>
    </div>
  );
};

export default FileUpload;