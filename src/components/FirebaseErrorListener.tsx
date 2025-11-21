'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error('Firestore Permission Error:', error.toSimplifiedError());
      
      const isDevelopment = process.env.NODE_ENV === 'development';

      if (isDevelopment) {
        // In development, throw an uncaught exception to trigger the Next.js error overlay
        // This provides a rich, interactive debugging experience.
        // We throw it in a timeout to break out of the current React render cycle.
        setTimeout(() => {
          throw error;
        }, 0);
      } else {
        // In production, show a friendly toast message.
        toast({
          variant: 'destructive',
          title: 'Akses Ditolak',
          description:
            'Anda tidak memiliki izin untuk melakukan tindakan ini. Hubungi administrator jika Anda merasa ini adalah kesalahan.',
        });
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError