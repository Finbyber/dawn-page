import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons/Icons';

interface PhotoGalleryProps {
    photos: string[];
    initialIndex: number;
    onClose: () => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [touchStartX, setTouchStartX] = useState(0);

    const goToPrevious = useCallback(() => {
        setCurrentIndex(prevIndex => (prevIndex === 0 ? photos.length - 1 : prevIndex - 1));
    }, [photos.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex(prevIndex => (prevIndex === photos.length - 1 ? 0 : prevIndex + 1));
    }, [photos.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToPrevious, goToNext, onClose]);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        if (touchStartX - touchEndX > 50) { // Swipe left
            goToNext();
        } else if (touchEndX - touchStartX > 50) { // Swipe right
            goToPrevious();
        }
    };

    if (!photos || photos.length === 0) return null;

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/30 hover:bg-black/60 transition-colors z-50"
                aria-label="Close gallery"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            
            <button
                onClick={goToPrevious}
                className="absolute left-4 text-white p-2 bg-black/30 rounded-full hover:bg-black/60 transition-colors z-50"
                aria-label="Previous image"
            ><ChevronLeftIcon className="h-8 w-8" /></button>

            <div className="relative w-full h-full flex items-center justify-center p-8" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <img
                    src={photos[currentIndex]}
                    alt={`Photo ${currentIndex + 1} of ${photos.length}`}
                    className="max-h-full max-w-full object-contain"
                />
            </div>
            
            <button
                onClick={goToNext}
                className="absolute right-4 text-white p-2 bg-black/30 rounded-full hover:bg-black/60 transition-colors z-50"
                aria-label="Next image"
            ><ChevronRightIcon className="h-8 w-8" /></button>

            <div className="absolute bottom-4 text-white text-sm bg-black/30 px-3 py-1 rounded-full">
                {currentIndex + 1} / {photos.length}
            </div>
        </div>
    );
};

export default PhotoGallery;
