import React, { useState, useRef, useCallback } from 'react';
import { CameraIcon, TrashIcon } from '../icons/Icons';

interface PhotoUploaderProps {
    label: string;
    onFilesChange: (files: File[]) => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ label, onFilesChange }) => {
    const [previews, setPreviews] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        // Fix: Explicitly type `selectedFiles` as `File[]` to resolve an issue where the `file` argument
        // in `URL.createObjectURL(file)` was being inferred as `unknown`.
        const selectedFiles: File[] = Array.from(event.target.files || []);
        if (selectedFiles.length === 0) return;

        const newFiles = [...files, ...selectedFiles];
        setFiles(newFiles);
        onFilesChange(newFiles);

        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);

        // Reset file input value to allow selecting the same file again
        if (event.target) {
            event.target.value = '';
        }
    }, [files, onFilesChange]);

    const removeImage = useCallback((index: number) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
        onFilesChange(newFiles);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]); // Clean up memory
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    }, [files, previews, onFilesChange]);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {label}
            </label>
            <div className="mt-2 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md cursor-pointer" onClick={triggerFileInput}>
                <div className="space-y-1 text-center">
                    <CameraIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600 dark:text-slate-400">
                        <p className="pl-1">Take or upload photos</p>
                    </div>
                     <p className="text-xs text-slate-500 dark:text-slate-500">PNG, JPG, GIF up to 10MB</p>
                </div>
            </div>
            <input
                ref={fileInputRef}
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                multiple
                accept="image/*"
                onChange={handleFileChange}
            />
            {previews.length > 0 && (
                 <div className="mt-4 grid grid-cols-3 gap-4">
                    {previews.map((src, index) => (
                        <div key={index} className="relative group">
                            <img src={src} alt={`Preview ${index}`} className="h-24 w-full object-cover rounded-md" />
                            <button
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Remove image"
                            >
                                <TrashIcon className="h-4 w-4"/>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PhotoUploader;