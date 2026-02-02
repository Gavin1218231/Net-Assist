import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wifi, MapPin, Activity, Shield, ChevronRight, ChevronLeft } from 'lucide-react';

const onboardingSteps = [
  {
    icon: Wifi,
    title: 'Welcome to NetAssist',
    subtitle: 'Your AI-Powered Internet Setup Assistant',
    description: 'We help you set up, optimize, and troubleshoot your home internet. No technical knowledge required!',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: MapPin,
    title: 'Smart Placement',
    subtitle: 'Find the Perfect Spot',
    description: 'Our AI analyzes your home layout and recommends the best location for your router to maximize coverage.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Activity,
    title: 'Network Health',
    subtitle: 'Check Your Connection',
    description: 'Run speed tests, check signal strength, and get real-time insights into your network performance.',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: Shield,
    title: 'Stay Protected',
    subtitle: 'Security Made Simple',
    description: 'Get personalized security recommendations to keep your home network safe from threats.',
    color: 'from-emerald-500 to-emerald-600',
  },
];

export default function Welcome() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const step = onboardingSteps[currentStep];
  const isLast = currentStep === onboardingSteps.length - 1;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => navigate('/login')}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm font-medium transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        {/* Icon */}
        <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-8 shadow-lg`}>
          <step.icon className="w-12 h-12 text-white" />
        </div>

        {/* Text */}
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
            {step.title}
          </h1>
          <p className="text-lg font-medium gradient-text mb-4">
            {step.subtitle}
          </p>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Dots */}
        <div className="flex gap-2 mt-10">
          {onboardingSteps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-8 bg-[var(--color-primary)]'
                  : 'w-2 bg-[var(--color-border)] hover:bg-[var(--color-text-muted)]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="px-6 pb-8 flex items-center gap-4">
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="btn-secondary flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        )}

        <button
          onClick={() => {
            if (isLast) {
              navigate('/login');
            } else {
              setCurrentStep(prev => prev + 1);
            }
          }}
          className="btn-primary flex-1 flex items-center justify-center gap-2"
        >
          {isLast ? 'Get Started' : 'Next'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
