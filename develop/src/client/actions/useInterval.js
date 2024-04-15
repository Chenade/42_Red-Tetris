import { useEffect, useRef } from 'react';

export function useInterval(callback, delay) {
    const callbackRef = useRef(callback);
    const intervalRef = useRef();

    useEffect(() => {
        // Update callback when callback is updated
        callbackRef.current = callback;
    }, [callback]);

    // call the callback function every delay ms
    useEffect(() => {
        intervalRef.current = window.setInterval(() => {
            callbackRef.current();
        }, delay);

        return () => {
            window.clearInterval(intervalRef.current);
        };
    }, [delay]);
}

