'use client';

import { UploadButton } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { ImageIcon, X } from 'lucide-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
}

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Uploaded image"
            className="max-w-xs rounded-lg border border-gray-300"
          />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <UploadButton<OurFileRouter, 'imageUploader'>
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (res?.[0]?.url) {
                onChange(res[0].url);
              }
            }}
            onUploadError={(error: Error) => {
              alert(`Upload error: ${error.message}`);
            }}
            appearance={{
              button:
                'ut-ready:bg-[#F9AA04] ut-uploading:cursor-not-allowed ut-uploading:bg-[#e69a03] bg-[#F9AA04] text-sm font-medium',
              allowedContent: 'text-xs text-gray-500',
            }}
          />
        </div>
      )}
    </div>
  );
}
