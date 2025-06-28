// hooks/useModalScrollLock.js
import { useEffect } from 'react';

/**
 * Custom hook to handle scroll locking when modals are open
 * Prevents background scrolling and preserves scroll position
 */
export const useModalScrollLock = (isOpen) => {
    useEffect(() => {
        if (!isOpen) return;

        // Save current scroll position
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        // Get current body styles
        const originalStyle = {
            overflow: document.body.style.overflow,
            position: document.body.style.position,
            top: document.body.style.top,
            width: document.body.style.width,
        };

        // Apply scroll lock
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.classList.add('modal-open');

        // Cleanup function
        return () => {
            // Restore original styles
            document.body.style.overflow = originalStyle.overflow;
            document.body.style.position = originalStyle.position;
            document.body.style.top = originalStyle.top;
            document.body.style.width = originalStyle.width;
            document.body.classList.remove('modal-open');

            // Restore scroll position
            window.scrollTo(scrollX, scrollY);
        };
    }, [isOpen]);
};

// Usage in your component:
// import { useModalScrollLock } from './hooks/useModalScrollLock';
//
// In your modal component:
// useModalScrollLock(isOpen);