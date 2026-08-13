import React, { useState, useEffect } from 'react';
import { MailIcon, ArrowLeftIcon, SpinnerIcon, ShieldCheckIcon, AppLogo, EyeIcon, EyeSlashIcon, CameraIcon, MicrophoneIcon, CheckIcon } from './icons';
import { User } from '../types';
import { PRESET_AVATARS } from '../constants';
import TermsModal from './TermsModal';

interface LoginProps {
    onLogin: (user: User) => void;
}

type PasswordStrength = { score: number; label: string; color: string; width: string; };

const termsContent = (
    <>
        <h4>1. Account Responsibility</h4>
        <p>You are responsible for maintaining the confidentiality of your account and password and for restricting access to your device. You agree to accept responsibility for all activities that occur under your account or password.</p>
        
        <h4>2. Data Usage</h4>
        <p>DhanMate securely stores user-provided data, including savings goals, progress, and preferences, to provide its services. We are committed to protecting your data and will not share it with third parties without your explicit consent, except as required by law.</p>

        <h4>3. Privacy</h4>
        <p>Your privacy is important to us. Our Privacy Policy, which is part of these Terms, explains how we collect, use, and protect your personal information like your email, username, and profile picture for account management purposes.</p>
    </>
);

const privacyContent = (
    <>
        <h4>1. Data We Collect</h4>
        <p>To provide our services, we collect the following information:</p>
        <ul>
            <li><strong>Account Information:</strong> Your email address, a secure password, and your chosen username and profile picture.</li>
            <li><strong>Financial Data:</strong> Information you provide about your income, expenses, budget, and savings goals.</li>
        </ul>
        
        <h4>2. How We Use Your Data</h4>
        <p>Your data is used exclusively to:</p>
        <ul>
            <li>Authenticate and manage your account.</li>
            <li>Personalize your experience within the app.</li>
            <li>Track your progress towards your financial goals.</li>
            <li>Provide AI-powered insights and advice based on the data you provide.</li>
        </ul>
    </>
);

const modalContents = {
    terms: { title: 'Terms & Conditions', content: termsContent },
    privacy: { title: 'Privacy Policy', content: privacyContent },
};

const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (!password) return { score: 0, label: '', color: '', width: '0%' };
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
        case 1: return { score, label: 'Weak', color: 'bg-red-500', width: '25%' };
        case 2: return { score, label: 'Medium', color: 'bg-yellow-500', width: '50%' };
        case 3: return { score, label: 'Strong', color: 'bg-sky-500', width: '75%' };
        case 4: return { score, label: 'Very Strong', color: 'bg-emerald-500', width: '100%' };
        default: return { score: 1, label: 'Weak', color: 'bg-red-500', width: '25%' };
    }
};

const PasswordStrengthIndicator: React.FC<{ strength: PasswordStrength }> = ({ strength }) => {
    if (strength.score === 0) return null;
    const strengthColorClass = strength.color.replace('bg-', 'text-');
    return (
        <div className="mt-2 space-y-1">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }}></div>
            </div>
            <div className="flex justify-end">
                <span className={`text-xs font-bold ${strengthColorClass}`}>{strength.label}</span>
            </div>
        </div>
    );
};

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    type View = 'landing' | 'signIn' | 'signUp' | 'profileSetup';
    const [view, setView] = useState<View>('landing');
    
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, label: '', color: '', width: '0%' });

    type PermissionStatus = 'prompt' | 'granted' | 'denied';
    const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('prompt');
    const [micStatus, setMicStatus] = useState<PermissionStatus>('prompt');

    const [profileImages, setProfileImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [modalContentKey, setModalContentKey] = useState<'terms' | 'privacy' | null>(null);

    const [newUser, setNewUser] = useState<Omit<User, 'profileImage'> | null>(null);

    useEffect(() => {
        if (view === 'profileSetup') {
            setProfileImages(PRESET_AVATARS);
            setSelectedImage(PRESET_AVATARS[0]);
        }
    }, [view]);

    useEffect(() => {
        if (view !== 'signUp') return;

        const checkPermissions = async () => {
            if (navigator.permissions) {
                try {
                    const cameraPerm = await navigator.permissions.query({ name: 'camera' as PermissionName });
                    setCameraStatus(cameraPerm.state);
                    cameraPerm.onchange = () => setCameraStatus(cameraPerm.state);
                } catch (e) {
                    console.warn("Could not query camera permission status. Will rely on direct request.");
                }
                try {
                    const micPerm = await navigator.permissions.query({ name: 'microphone' as PermissionName });
                    setMicStatus(micPerm.state);
                    micPerm.onchange = () => setMicStatus(micPerm.state);
                } catch (e) {
                     console.warn("Could not query microphone permission status. Will rely on direct request.");
                }
            }
        };
       checkPermissions();
    }, [view]);

    const resetFormState = () => {
        setEmail('');
        setUsername('');
        setPassword('');
        setAgreedToTerms(false);
        setPasswordStrength({ score: 0, label: '', color: '', width: '0%' });
        setError('');
        setLoading(false);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setPasswordStrength(calculatePasswordStrength(newPassword));
    };

    const requestCameraPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            setCameraStatus('granted');
        } catch (err) {
            console.error("Camera access denied:", err);
            setCameraStatus('denied');
        }
    };
    
    const requestMicPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            setMicStatus('granted');
        } catch (err) {
            console.error("Mic access denied:", err);
            setMicStatus('denied');
        }
    };
    
    const handleSignIn = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setTimeout(() => {
            const users: User[] = JSON.parse(localStorage.getItem('dhanmate-users') || '[]');
            const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (user && user.password === password) {
                onLogin(user);
            } else {
                setError('Invalid email or password.');
                setLoading(false);
            }
        }, 1000);
    };

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!agreedToTerms) {
            setError('You must agree to the Terms & Conditions and Privacy Policy.');
            return;
        }
        
        setLoading(true);
        setTimeout(() => {
            const users: User[] = JSON.parse(localStorage.getItem('dhanmate-users') || '[]');
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                setError('An account with this email already exists.');
                setLoading(false);
                return;
            }
            if (users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
                setError('This username is already taken.');
                setLoading(false);
                return;
            }

            setNewUser({
                email,
                password,
                username: username.trim(),
                notificationsEnabled: false,
            });
            setView('profileSetup');
            setLoading(false);
        }, 1000);
    };

    const handleProfileSetup = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser || !selectedImage) {
            setError('Something went wrong. Please start over.');
            setView('landing');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            const finalNewUser: User = { ...newUser, profileImage: selectedImage };
            const users: User[] = JSON.parse(localStorage.getItem('dhanmate-users') || '[]');
            const updatedUsers = [...users, finalNewUser];
            localStorage.setItem('dhanmate-users', JSON.stringify(updatedUsers));
            onLogin(finalNewUser);
        }, 1000);
    };
    
    const openTermsModal = (key: 'terms' | 'privacy') => {
        setModalContentKey(key);
        setIsTermsModalOpen(true);
    };
    
    const renderLandingView = () => (
        <>
            <div className="flex flex-col items-center text-center">
                <AppLogo className="h-16 w-auto text-emerald-500" />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-4">Welcome to DhanMate</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-10">Stay Smart, Spend Wise. Your personal finance journey starts here.</p>
            </div>
            <div className="space-y-4">
                 <button onClick={() => { resetFormState(); setView('signUp'); }} className="w-full py-3 px-4 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors">
                    Create Account
                </button>
                 <button onClick={() => { resetFormState(); setView('signIn'); }} className="w-full py-3 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">
                    Sign In
                </button>
            </div>
        </>
    );

    const renderSignInView = () => (
         <>
            <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Sign In</h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back!</p>
            </div>
            <form onSubmit={handleSignIn} className="space-y-4">
                 <div>
                    <label htmlFor="email-signin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input id="email-signin" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-700 dark:text-white" required placeholder="you@example.com" autoFocus />
                </div>
                 <div>
                    <label htmlFor="password-signin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                     <div className="relative mt-1">
                        <input id="password-signin" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm pr-10 dark:bg-gray-700 dark:text-white" required placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400">{showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}</button>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 disabled:bg-emerald-300">
                    {loading ? <SpinnerIcon className="h-6 w-6" /> : 'Sign In'}
                </button>
            </form>
             <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Don't have an account?{' '}
                <button onClick={() => { resetFormState(); setView('signUp'); }} className="font-semibold text-emerald-600 hover:underline">
                    Sign Up
                </button>
            </p>
        </>
    );

    const PermissionRow: React.FC<{
        status: PermissionStatus;
        onRequest: () => void;
        label: string;
        description: string;
        icon: React.ReactNode;
    }> = ({ status, onRequest, label, description, icon }) => {
        return (
            <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                <div className="flex-shrink-0 text-gray-500 dark:text-gray-400">{icon}</div>
                <div className="flex-grow">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                </div>
                <div className="flex-shrink-0 w-28 text-right">
                    {status === 'prompt' && (
                        <button type="button" onClick={onRequest} className="px-4 py-1.5 text-sm font-semibold text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors">
                            Grant
                        </button>
                    )}
                    {status === 'granted' && (
                        <div className="flex items-center justify-end space-x-1 text-sm text-green-600 dark:text-green-400 font-semibold">
                            <CheckIcon className="h-5 w-5" />
                            <span>Granted</span>
                        </div>
                    )}
                    {status === 'denied' && (
                        <div className="text-sm text-red-600 dark:text-red-400 font-semibold">
                            <p>Denied</p>
                            <a href="#" onClick={(e) => { e.preventDefault(); alert("To grant permission, please go to your browser's settings for this site and change the permission from 'Block' to 'Allow'."); }} className="text-xs font-normal text-gray-500 dark:text-gray-400 hover:underline">How to fix?</a>
                        </div>
                    )}
                </div>
            </div>
        );
    };
    
    const renderSignUpView = () => (
         <>
            <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Create your Account</h2>
                 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Just a few details to get started.</p>
            </div>
            <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                    <label htmlFor="username-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                    <input id="username-signup" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-700 dark:text-white" required placeholder="e.g., JaneDoe" autoFocus />
                </div>
                 <div>
                    <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-700 dark:text-white" required placeholder="you@example.com" />
                </div>
                 <div>
                    <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <div className="relative mt-1">
                        <input id="password-signup" type={showPassword ? "text" : "password"} value={password} onChange={handlePasswordChange} className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm pr-10 dark:bg-gray-700 dark:text-white" required placeholder="Create a strong password" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400">{showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}</button>
                    </div>
                    <PasswordStrengthIndicator strength={passwordStrength} />
                </div>

                <div className="space-y-3 pt-4 border-t dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Optional Permissions</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2">Enable these for features like receipt scanning and voice commands.</p>
                    <PermissionRow 
                        label="Camera Access"
                        description="For scanning receipts"
                        icon={<CameraIcon className="h-6 w-6" />}
                        status={cameraStatus}
                        onRequest={requestCameraPermission}
                    />
                    <PermissionRow 
                        label="Microphone Access"
                        description="For voice commands"
                        icon={<MicrophoneIcon className="h-6 w-6" />}
                        status={micStatus}
                        onRequest={requestMicPermission}
                    />
                </div>

                <div className="flex items-start space-x-3 pt-2">
                    <input id="terms" name="terms" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="h-4 w-4 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500 bg-gray-100 dark:bg-gray-700" />
                    <div className="text-sm">
                        <label htmlFor="terms" className="text-gray-600 dark:text-gray-300">
                            I agree to the{' '}
                            <button type="button" onClick={() => openTermsModal('terms')} className="font-semibold text-emerald-600 hover:underline">
                                T&Cs
                            </button>
                            {' '}and{' '}
                            <button type="button" onClick={() => openTermsModal('privacy')} className="font-semibold text-emerald-600 hover:underline">
                                Privacy Policy
                            </button>
                            .
                        </label>
                    </div>
                </div>
                
                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 disabled:bg-emerald-300">
                   {loading ? <SpinnerIcon className="h-6 w-6" /> : 'Create Account'}
                </button>
            </form>
             <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                Already have an account?{' '}
                <button onClick={() => { resetFormState(); setView('signIn'); }} className="font-semibold text-emerald-600 hover:underline">
                    Sign In
                </button>
            </p>
        </>
    );

    const renderProfileSetupView = () => (
         <>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Choose your Avatar</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">One last step to personalize your profile.</p>
            </div>
            <form onSubmit={handleProfileSetup} className="space-y-6">
                <div>
                    <div className="grid grid-cols-4 gap-4">
                        {profileImages.map((src, index) => (
                            <button key={index} type="button" onClick={() => setSelectedImage(src)} className={`rounded-full aspect-square transition-all duration-200 ${selectedImage === src ? 'ring-4 ring-emerald-500 ring-offset-2 dark:ring-offset-gray-800' : 'ring-1 ring-gray-300 dark:ring-gray-600'}`}>
                                <img src={src} alt={`Avatar option ${index + 1}`} className="w-full h-full rounded-full object-cover"/>
                            </button>
                        ))}
                    </div>
                </div>
                 <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 disabled:bg-emerald-300">
                    {loading ? <SpinnerIcon className="h-6 w-6" /> : 'Finish Setup'}
                </button>
            </form>
        </>
    );

    const renderView = () => {
        switch(view) {
            case 'signIn': return renderSignInView();
            case 'signUp': return renderSignUpView();
            case 'profileSetup': return renderProfileSetupView();
            case 'landing':
            default:
                return renderLandingView();
        }
    }
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 sm:p-8 transition-all duration-300">
                <div className="min-h-[420px] flex flex-col justify-center">
                    {renderView()}
                </div>
                {error && (
                    <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center mt-4">
                        {error}
                    </p>
                )}
            </div>
            {isTermsModalOpen && modalContentKey && (
                <TermsModal
                    title={modalContents[modalContentKey].title}
                    content={modalContents[modalContentKey].content}
                    onClose={() => setIsTermsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Login;