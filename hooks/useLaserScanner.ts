import { useEffect, useRef } from 'react';

/**
 * Hook to detect HID laser scanner input (which emulates keyboard).
 * @param onScan Callback when a full barcode is detected.
 */
export const useLaserScanner = (onScan: (barcode: string) => void) => {
    const buffer = useRef<string>('');
    const lastKeyTime = useRef<number>(0);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Check if input is coming into an input/textarea (ignore if so)
            if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
                return;
            }

            const currentTime = Date.now();

            // Scanners are fast. If delta > 100ms, it's probably a human.
            if (currentTime - lastKeyTime.current > 100) {
                buffer.current = '';
            }

            lastKeyTime.current = currentTime;

            // Most scanners send 'Enter' at the end
            if (e.key === 'Enter') {
                if (buffer.current.length >= 10) {
                    onScan(buffer.current);
                    buffer.current = '';
                }
            } else if (/^[0-9]$/.test(e.key)) {
                buffer.current += e.key;
            } else if (e.key.length === 1) {
                // Ignore other keys but reset if they are too slow
                // Some scanners might have prefixes
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onScan]);
};
