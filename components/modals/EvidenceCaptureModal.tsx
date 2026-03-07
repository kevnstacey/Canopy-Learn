
import React, { useRef, useState, useEffect } from 'react';
import BaseModal from './BaseModal';

interface EvidenceCaptureModalProps {
    onCapture: (base64Data: string) => void;
    onClose: () => void;
    title: string;
}

const EvidenceCaptureModal: React.FC<EvidenceCaptureModalProps> = ({ onCapture, onClose, title }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'user', width: 1280, height: 720 },
                    audio: false 
                });
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            } catch (err) {
                console.error("Camera error:", err);
                setError("Could not access camera. Please check permissions.");
            }
        };

        startCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                // Simple high-quality JPEG capture
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                setCapturedImage(dataUrl);
            }
        }
    };

    const handleConfirm = () => {
        if (capturedImage) {
            // Remove the data URI prefix for the AI service
            const base64 = capturedImage.split(',')[1];
            onCapture(base64);
            onClose();
        }
    };

    return (
        <BaseModal title={title} onClose={onClose}>
            <div className="flex flex-col items-center">
                <div className="w-full aspect-video bg-black rounded-3xl overflow-hidden relative shadow-2xl border-4 border-slate-200 dark:border-slate-700">
                    {!capturedImage ? (
                        <>
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 border-2 border-dashed border-white/30 pointer-events-none rounded-2xl m-8"></div>
                            {error && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-8 text-center text-white">
                                    <p className="font-bold">{error}</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <img src={capturedImage} className="w-full h-full object-cover" alt="Captured evidence" />
                    )}
                </div>

                <div className="mt-8 flex gap-4 w-full">
                    {!capturedImage ? (
                        <button 
                            onClick={capturePhoto} 
                            disabled={!!error}
                            className="flex-grow bg-hh-red text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-hh-red-dark shadow-lg active:scale-95 transition-all"
                        >
                            📸 Snap Evidence
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={() => setCapturedImage(null)} 
                                className="flex-1 bg-slate-100 text-slate-700 font-bold py-4 rounded-2xl hover:bg-slate-200"
                            >
                                Retake
                            </button>
                            <button 
                                onClick={handleConfirm} 
                                className="flex-[2] bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-blue-700 shadow-xl"
                            >
                                Confirm & Submit
                            </button>
                        </>
                    )}
                </div>
                <p className="mt-4 text-xs text-slate-400 font-medium italic">
                    AI proctoring will verify your identity and competencies automatically.
                </p>
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </BaseModal>
    );
};

export default EvidenceCaptureModal;
