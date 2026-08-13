
import React, { useRef, useEffect, useState } from 'react';
import { CameraIcon, CheckIcon, RetakeIcon } from './icons';

interface CameraCaptureProps {
    onCapture: (dataUrl: string) => void;
    onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    throw new Error("Camera API is not available in this browser.");
                }
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                streamRef.current = stream;
                setError(null);
            } catch (err: any) {
                console.error("Error accessing camera:", err);
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setError("Camera permission was denied. Please allow camera access in your browser settings to continue.");
                } else {
                    setError("Could not access the camera. Please ensure it's not being used by another application.");
                }
            }
        };

        if (!capturedImage) {
            startCamera();
        }

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [capturedImage]);

    const handleSnap = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(dataUrl);

                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
            }
        }
    };
    
    const handleRetake = () => {
        setCapturedImage(null);
    };

    const handleAccept = () => {
        if (!capturedImage) return;

        const img = new Image();
        img.onload = () => {
            const MAX_WIDTH = 1024;
            const scaleFactor = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
            
            const canvas = document.createElement('canvas');
            canvas.width = img.width * scaleFactor;
            canvas.height = img.height * scaleFactor;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                onCapture(resizedDataUrl);
            } else {
                onCapture(capturedImage);
            }
        };
        img.src = capturedImage;
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col justify-center items-center" role="dialog" aria-modal="true" aria-labelledby="camera-capture-title">
            <h2 id="camera-capture-title" className="sr-only">Receipt Scanner</h2>

            {capturedImage ? (
                <img src={capturedImage} alt="Captured receipt preview" className="w-full h-full object-contain" />
            ) : (
                <>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                        aria-label="Live camera feed for receipt scanning"
                    />
                    <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
                        <div className="w-full h-full max-w-md max-h-[70vh] border-4 border-dashed border-white/60 rounded-xl" aria-hidden="true"></div>
                        <p className="absolute top-10 text-white bg-black/50 px-4 py-2 rounded-lg font-semibold shadow-lg">Align receipt within the frame</p>
                    </div>
                </>
            )}
            
            {error && (
                <div className="absolute top-4 left-4 right-4 bg-red-600 text-white p-4 rounded-lg text-center shadow-lg" role="alert">
                    <p className="font-semibold">Camera Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-around items-center">
                {capturedImage ? (
                    <>
                        <button onClick={handleRetake} className="flex flex-col items-center space-y-1 text-white font-semibold" aria-label="Retake photo">
                            <div className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                                <RetakeIcon className="h-7 w-7" />
                            </div>
                            <span>Retake</span>
                        </button>
                        <button onClick={handleAccept} className="flex flex-col items-center space-y-1 text-emerald-400 font-bold" aria-label="Use this photo">
                            <div className="p-3 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg">
                                <CheckIcon className="h-7 w-7 text-white" />
                            </div>
                            <span>Use Photo</span>
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={onClose} className="px-4 py-2 font-semibold text-white bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30" aria-label="Close camera">
                            Cancel
                        </button>
                        <button onClick={handleSnap} disabled={!!error} className="p-4 rounded-full bg-white ring-4 ring-white/30 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Capture photo">
                            <CameraIcon className="h-8 w-8 text-gray-800" />
                        </button>
                        <div className="w-[88px]"></div> {/* Spacer */}
                    </>
                )}
            </div>
        </div>
    );
};

export default CameraCapture;
