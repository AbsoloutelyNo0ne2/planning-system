import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const MIN_SWIPE_DISTANCE = 50;

export function LoginScreen(): JSX.Element {
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swipeFeedback, setSwipeFeedback] = useState<'submit' | 'clear' | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const { login } = useAuth();

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!passphrase.trim()) {
      setError('Please enter a passphrase');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await login(passphrase);

    if (!result.success) {
      setError(result.error || 'Invalid passphrase');
    }

    setIsLoading(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < MIN_SWIPE_DISTANCE) return;

    if (deltaX < 0 && passphrase.trim()) {
      setSwipeFeedback('submit');
      setTimeout(() => {
        setSwipeFeedback(null);
        handleSubmit();
      }, 150);
    } else if (deltaX > 0) {
      setSwipeFeedback('clear');
      setTimeout(() => {
        setSwipeFeedback(null);
        setPassphrase('');
        setError(null);
      }, 150);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundColor: 'var(--bg-primary)',
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, oklch(25% 0.08 195) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, oklch(20% 0.06 165) 0%, transparent 40%),
          radial-gradient(ellipse at 20% 70%, oklch(18% 0.05 220) 0%, transparent 35%),
          radial-gradient(circle at 50% 0%, var(--accent-primary) 0%, transparent 50%)
        `,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat'
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold mb-3 tracking-tight"
            style={{
              color: 'var(--text-primary)',
              textShadow: '0 0 40px oklch(70% 0.15 195)'
            }}
          >
            Planning System
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Enter your passphrase to continue
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="passphrase"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              Passphrase
            </label>

        <div className="relative">
          <input
            id="passphrase"
            type={showPassphrase ? 'text' : 'password'}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            placeholder="Enter your passphrase..."
            className="w-full px-4 py-3 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: swipeFeedback
                ? swipeFeedback === 'submit'
                  ? '2px solid oklch(70% 0.15 195)'
                  : '2px solid oklch(70% 0.15 45)'
                : '1px solid var(--border-primary)',
              outline: 'none',
              boxShadow: swipeFeedback
                ? swipeFeedback === 'submit'
                  ? '0 0 30px oklch(60% 0.15 195)'
                  : '0 0 30px oklch(60% 0.15 45)'
                : '0 0 0 0 transparent',
              transition: 'border-color 0.15s, box-shadow 0.15s'
            }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-primary)';
                  e.target.style.boxShadow = '0 0 20px oklch(60% 0.15 195), 0 0 40px oklch(50% 0.1 195)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-primary)';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={isLoading}
                autoComplete="current-password"
              />

              {/* Animated glow border effect */}
              <div
                className="absolute inset-0 rounded-lg pointer-events-none opacity-50"
                style={{
                  background: 'linear-gradient(90deg, oklch(70% 0.15 195), oklch(70% 0.15 165), oklch(70% 0.15 195))',
                  backgroundSize: '200% 100%',
                  animation: 'gradient-shift 3s ease infinite',
                  zIndex: -1,
                  filter: 'blur(12px)'
                }}
              />

              {/* Show/Hide Toggle */}
              <button
                type="button"
                onClick={() => setShowPassphrase(!showPassphrase)}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'oklch(30% 0.08 195)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {showPassphrase ? 'Hide' : 'Show'}
              </button>
            </div>

        {/* Helper Text */}
        <p
          className="mt-2 text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          This is a password-free system. Your passphrase is your identity.
        </p>
        {isTouchDevice && (
          <p
            className="mt-1 text-xs"
            style={{ color: 'var(--text-tertiary)', opacity: 0.7 }}
          >
            Swipe left to enter, right to clear
          </p>
        )}
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'oklch(25% 0.05 15)',
                border: '1px solid oklch(40% 0.1 15)',
                color: 'oklch(70% 0.15 15)',
                boxShadow: '0 0 20px oklch(30% 0.08 15)'
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !passphrase.trim()}
            className="w-full py-4 px-6 rounded-lg font-medium text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, oklch(55% 0.15 195), oklch(55% 0.15 165))',
              color: 'var(--bg-primary)',
              boxShadow: '0 0 30px oklch(50% 0.12 195)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, oklch(60% 0.18 195), oklch(60% 0.18 165))';
                e.currentTarget.style.boxShadow = '0 0 40px oklch(55% 0.15 195), 0 0 60px oklch(50% 0.1 195)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, oklch(55% 0.15 195), oklch(55% 0.15 165))';
              e.currentTarget.style.boxShadow = '0 0 30px oklch(50% 0.12 195)';
            }}
          >
            {/* Animated background shimmer */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: 'shimmer 2s infinite'
              }}
            />
            
            {isLoading ? (
              <span className="flex items-center justify-center gap-2 relative z-10">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verifying...
              </span>
            ) : (
              <span className="relative z-10">Enter</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div
          className="mt-12 text-center text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <p>Secure passphrase-based authentication</p>
          <p className="mt-1">No username. No password. Just your phrase.</p>
        </div>
      </div>

      {/* Global keyframe animations */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
