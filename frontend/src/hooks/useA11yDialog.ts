import { useEffect, useRef } from 'react';

export const useA11yDialog = (isOpen: boolean) => {
  const rootRef = useRef<HTMLElement | null>(null);
  const mainContentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    rootRef.current = document.getElementById('root');
    mainContentRef.current = document.querySelector('main') || document.getElementById('main-content') || document.body;

    return () => {
      // Cleanup function
    };
  }, []);

  useEffect(() => {
    if (!rootRef.current || !mainContentRef.current) return;

    const root = rootRef.current;
    const mainContent = mainContentRef.current;

    if (isOpen) {
      // Save the current active element to return focus later
      const activeElement = document.activeElement as HTMLElement;
      
      // Set aria-hidden on the main content instead of the root
      mainContent.setAttribute('aria-hidden', 'true');
      mainContent.inert = true;

      return () => {
        // Restore focus when dialog closes
        if (activeElement && typeof activeElement.focus === 'function') {
          activeElement.focus();
        }
        
        // Remove aria-hidden and inert when dialog closes
        mainContent.removeAttribute('aria-hidden');
        mainContent.inert = false;
      };
    }
  }, [isOpen]);

  return { rootRef, mainContentRef };
};
