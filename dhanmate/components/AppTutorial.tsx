import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';

interface TutorialStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const tutorialSteps: TutorialStep[] = [
    {
        targetId: 'welcome',
        title: 'Welcome to DhanMate!',
        content: 'Let\'s take a quick tour to get you started on your journey to financial wellness.',
        position: 'center',
    },
    {
        targetId: 'fab-add-transaction',
        title: 'Add Transactions',
        content: 'This is your main button for adding income and expenses. We\'ll open it for you on the next step.',
        position: 'top',
    },
     {
        targetId: 'fab-add-single',
        title: 'Log Your Purchases',
        content: 'Log everyday purchases by setting a category and payment method. For even faster entry, try our AI-powered features: use the receipt scanner or voice input!',
        position: 'top',
    },
    {
        targetId: 'fab-add-recurring',
        title: 'Add Recurring Transaction',
        content: 'For regular payments like rent or subscriptions, set them up here once, and we\'ll log them for you automatically.',
        position: 'top',
    },
    {
        targetId: 'dashboard-container',
        title: 'Your Dashboard',
        content: 'Get a complete overview of your finances at a glance. See your income, expenses, and budget progress right here.',
        position: 'top',
    },
    {
        targetId: 'dashboard-tab-trends',
        title: 'Track Your Trends',
        content: 'Switch to the Trends tab to see a visual chart of your cumulative spending over the past week.',
        position: 'right',
    },
    {
        targetId: 'dashboard-tab-comparison',
        title: 'Compare Spending',
        content: 'This tab helps you compare your spending by category between this month and the last.',
        position: 'right',
    },
    {
        targetId: 'nav-item-travel',
        title: 'Travel Mode',
        content: 'Planning a trip? Use Travel Mode to create a separate budget and track your vacation spending with ease.',
        position: 'right',
    },
    {
        targetId: 'nav-item-goals',
        title: 'Set Your Goals',
        content: 'Create savings goals for things like a new car or a vacation, and track your progress towards achieving them.',
        position: 'right',
    },
    {
        targetId: 'nav-item-aicoach',
        title: 'AI Coach',
        content: 'Feeling lost? Get personalized advice on your spending, budget, and even tips on how to reach your savings goals faster.',
        position: 'right',
    },
    {
        targetId: 'nav-item-budget',
        title: 'Manage Your Budget',
        content: 'This is where you set and manage your monthly spending limits for each category, also known as "envelopes".',
        position: 'right',
    },
    {
        targetId: 'finish',
        title: 'You\'re All Set!',
        content: 'You\'ve learned the basics. Start tracking your finances today to achieve your goals. Happy budgeting!',
        position: 'center',
    },
];

interface AppTutorialProps {
  onComplete: () => void;
}

const AppTutorial: React.FC<AppTutorialProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [style, setStyle] = useState({});
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [showTooltip, setShowTooltip] = useState(false);

    const step = tutorialSteps[currentStep];
    const isLastStep = currentStep === tutorialSteps.length - 1;

    // Central useEffect for handling ALL side-effects/interactions
    useEffect(() => {
        // Use a timeout to ensure DOM updates (like conditional rendering) from state changes have completed
        const timer = setTimeout(() => {
            const stepId = tutorialSteps[currentStep]?.targetId;
            const prevStepId = tutorialSteps[currentStep - 1]?.targetId;

            // --- Interaction Logic ---
            const fab = document.getElementById('fab-add-transaction') as HTMLElement | null;
            if (fab) {
                const isFabOpen = fab.getAttribute('aria-expanded') === 'true';
                const fabShouldBeOpen = stepId === 'fab-add-single' || stepId === 'fab-add-recurring';
                if (isFabOpen !== fabShouldBeOpen) {
                    fab.click();
                }
            }
            
            if (stepId === 'dashboard-tab-trends' || stepId === 'dashboard-tab-comparison') {
                (document.getElementById(stepId) as HTMLElement | null)?.click();
            }

            // --- Cleanup Logic ---
            if ((prevStepId === 'dashboard-tab-comparison') && stepId !== 'dashboard-tab-trends') {
                (document.getElementById('dashboard-tab-overview') as HTMLElement | null)?.click();
            }
        }, 50); // Small delay for robustness

        return () => clearTimeout(timer);
    }, [currentStep]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            const fab = document.getElementById('fab-add-transaction') as HTMLElement | null;
            if (fab?.getAttribute('aria-expanded') === 'true') {
                fab.click();
            }
            const overviewTab = document.getElementById('dashboard-tab-overview') as HTMLElement | null;
            if (overviewTab) {
                overviewTab.click();
            }
        };
    }, []);

    const handleNext = () => {
        if (!isLastStep) {
            setCurrentStep(s => s + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(s => s - 1);
        }
    };
    
    const handleComplete = () => {
        onComplete();
    };

    useLayoutEffect(() => {
        setShowTooltip(false);

        if (step.position === 'center') {
            setStyle({ visibility: 'hidden' });
            setShowTooltip(true);
            return;
        }

        let timerId: number | undefined;

        const positionHighlight = (retryCount = 5) => {
            const desktopEl = document.getElementById(step.targetId);
            const mobileEl = document.getElementById(`bottom-${step.targetId}`);
            let targetElement: HTMLElement | null = null;

            if (desktopEl && desktopEl.offsetParent !== null) {
                targetElement = desktopEl;
            } else if (mobileEl && mobileEl.offsetParent !== null) {
                targetElement = mobileEl;
            }
            
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                const tooltipRect = tooltipRef.current?.getBoundingClientRect();

                let tooltipTop = 0;
                let tooltipLeft = 0;
                const buffer = 15;

                switch (step.position) {
                    case 'top':
                        tooltipTop = rect.top - (tooltipRect?.height ?? 0) - buffer;
                        tooltipLeft = rect.left + rect.width / 2 - (tooltipRect?.width ?? 0) / 2;
                        break;
                    case 'bottom':
                        tooltipTop = rect.bottom + buffer;
                        tooltipLeft = rect.left + rect.width / 2 - (tooltipRect?.width ?? 0) / 2;
                        break;
                    case 'right':
                        tooltipTop = rect.top + rect.height / 2 - (tooltipRect?.height ?? 0) / 2;
                        tooltipLeft = rect.right + buffer;
                        break;
                    case 'left':
                        tooltipTop = rect.top + rect.height / 2 - (tooltipRect?.height ?? 0) / 2;
                        tooltipLeft = rect.left - (tooltipRect?.width ?? 0) - buffer;
                        break;
                }

                // Boundary checks
                if (tooltipLeft < 10) tooltipLeft = 10;
                if (tooltipTop < 10) tooltipTop = 10;
                if (tooltipRect) {
                    if (tooltipLeft + tooltipRect.width > window.innerWidth - 10) {
                        tooltipLeft = window.innerWidth - tooltipRect.width - 10;
                    }
                    if (tooltipTop + tooltipRect.height > window.innerHeight - 10) {
                        tooltipTop = window.innerHeight - tooltipRect.height - 10;
                    }
                }

                setStyle({
                    position: 'absolute',
                    width: `${rect.width}px`,
                    height: `${rect.height}px`,
                    top: `${rect.top}px`,
                    left: `${rect.left}px`,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease-in-out',
                    pointerEvents: 'none',
                    visibility: 'visible',
                    '--tooltip-top': `${tooltipTop}px`,
                    '--tooltip-left': `${tooltipLeft}px`,
                });
                
                timerId = window.setTimeout(() => {
                    setShowTooltip(true);
                }, 300);

            } else if (retryCount > 0) {
                setTimeout(() => positionHighlight(retryCount - 1), 100);
            } else {
                setStyle({ visibility: 'hidden' });
            }
        };

        positionHighlight();
        
        return () => {
            if (timerId) clearTimeout(timerId);
        }
        
    }, [currentStep, step]);

    const isCentered = step.position === 'center';

    return (
        <div className="fixed inset-0 z-[100]">
            <div style={style as React.CSSProperties} />
             <div
                ref={tooltipRef}
                style={{
                    top: isCentered ? '50%' : 'var(--tooltip-top, 0px)',
                    left: isCentered ? '50%' : 'var(--tooltip-left, 0px)',
                    transform: isCentered ? 'translate(-50%, -50%)' : 'none'
                }}
                className={`fixed bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg shadow-2xl p-6 w-80 transition-all duration-300 ${showTooltip ? 'opacity-100' : 'opacity-0'}`}
            >
                <h3 className="text-xl font-bold mb-2 text-emerald-500">{step.title}</h3>
                <p className="text-sm mb-4" dangerouslySetInnerHTML={{ __html: step.content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-emerald-500">$1</strong>') }}></p>
                <div className="flex justify-between items-center">
                    <button onClick={handleComplete} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Skip</button>
                    <div className="space-x-3">
                        {currentStep > 0 && !isLastStep && (
                            <button onClick={handlePrev} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500">
                                Prev
                            </button>
                        )}
                        <button onClick={handleNext} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 rounded-md hover:bg-emerald-600">
                            {isLastStep ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppTutorial;