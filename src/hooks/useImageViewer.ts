import { useState, useCallback } from 'react';

export const useImageViewer = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageZoom, setImageZoom] = useState<number>(1);
  const [imageRotation, setImageRotation] = useState<number>(0);
  
  const openImage = useCallback((url: string) => {
    setImagePreview(url);
    setImageZoom(1);
    setImageRotation(0);
  }, []);
  
  const closeImage = useCallback(() => {
    setImagePreview(null);
  }, []);
  
  const zoomIn = useCallback(() => {
    setImageZoom(prev => Math.min(prev + 0.2, 3));
  }, []);
  
  const zoomOut = useCallback(() => {
    setImageZoom(prev => Math.max(prev - 0.2, 0.5));
  }, []);
  
  const rotate = useCallback(() => {
    setImageRotation(prev => (prev + 90) % 360);
  }, []);
  
  return {
    imagePreview,
    imageZoom,
    imageRotation,
    openImage,
    closeImage,
    zoomIn,
    zoomOut,
    rotate
  };
};

export default useImageViewer;