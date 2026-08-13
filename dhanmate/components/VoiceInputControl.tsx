import React, { useState, useEffect, useRef } from 'react';
import { MicrophoneIcon } from './icons';

// Define the SpeechRecognition interface for TypeScript
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: any) => void; // Using 'any' for broader compatibility with SpeechRecognitionErrorEvent
    onend: () => void;
}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

declare global {
    interface Window {
        SpeechRecognition: { new (): SpeechRecognition };
        webkitSpeechRecognition: { new (): SpeechRecognition };
    }
}

interface VoiceInputControlProps {
    onResult: (transcript: string) => void;
    onProcessingStart: () => void;
    onProcessingEnd: () => void;
    onError: (error: string) => void;
    disabled?: boolean;
}

const VoiceInputControl: React.FC<VoiceInputControlProps> = ({ onResult, onProcessingStart, onProcessingEnd, onError, disabled }) => {
    const [isListening, setIsListening] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const transcriptToSend = useRef('');
    const stoppedManually = useRef(false);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const fullTranscript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setInterimTranscript(fullTranscript);
            transcriptToSend.current = fullTranscript;
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error !== 'no-speech') {
                let errorMessage = 'An unknown error occurred with speech recognition.';
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    errorMessage = 'Microphone access was denied. Please enable it in your browser settings.';
                }
                onError(errorMessage);
            }
            setIsListening(false);
            onProcessingEnd();
        };

        recognition.onend = () => {
            setIsListening(false);
            if (stoppedManually.current) {
                stoppedManually.current = false;
                onProcessingStart();
                if (transcriptToSend.current.trim()) {
                    onResult(transcriptToSend.current.trim());
                } else {
                    onProcessingEnd();
                }
            } else {
                onProcessingEnd();
            }
        };
        
        recognitionRef.current = recognition;

    }, [onError, onResult, onProcessingEnd, onProcessingStart]);

    const handleToggleListening = () => {
        if (disabled || !recognitionRef.current) return;
        
        if (isListening) {
            stoppedManually.current = true;
            recognitionRef.current?.stop();
        } else {
            setInterimTranscript('');
            transcriptToSend.current = '';
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (e) {
                console.error("Could not start recognition:", e);
                onError("Could not start speech recognition. Please check your microphone.");
                setIsListening(false);
            }
        }
    };
    
    const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    const listeningClasses = isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white hover:bg-emerald-600';
    const finalDisabled = disabled || !isSupported;

    return (
        <div className="w-full text-center">
             <div className="min-h-[50px] p-3 mb-4 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg border dark:border-gray-600 text-left">
                <p className="italic">{interimTranscript || 'Press "Start Recording" and speak...'}</p>
            </div>
            <button
                type="button"
                onClick={handleToggleListening}
                disabled={finalDisabled}
                className={`w-full flex items-center justify-center space-x-2 rounded-lg py-3 font-semibold transition-colors ${listeningClasses} disabled:bg-gray-300 disabled:cursor-not-allowed`}
                aria-label={isListening ? 'Stop recording' : 'Start voice input'}
            >
                <MicrophoneIcon className="h-5 w-5" />
                <span>{isListening ? 'Stop Recording' : (isSupported ? 'Start Recording' : 'Voice Not Supported')}</span>
            </button>
        </div>
    );
};

export default VoiceInputControl;