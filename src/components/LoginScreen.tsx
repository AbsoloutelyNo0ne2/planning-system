import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const MIN_SWIPE_DISTANCE = 50;

export function LoginScreen(): JSX.Element {
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swipeFeedback, setSwipeFeedback] = useState<'submit' | 'clear' | null>(null);
  const touchStartX = useRef<number | null>(null);
  const { login } = useAuth();

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
      style={{ backgroundColor: 'var(--color-bg-base)' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-3xl font-bold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Planning System
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Enter your passphrase to continue
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="passphrase"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
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
                className="w-full px-4 py-3 transition-colors duration-150"
                style={{
                  backgroundColor: 'var(--color-bg-input)',
                  color: 'var(--color-text-primary)',
                  border: swipeFeedback
                    ? swipeFeedback === 'submit'
                      ? '2px solid var(--color-accent-500)'
                      : '2px solid var(--color-error-border)'
                    : '1px solid var(--color-border-default)',
                  borderRadius: '3px',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-accent-500)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border-default)';
                }}
                disabled={isLoading}
                autoComplete="current-password"
              />

              {/* Show/Hide Toggle */}
              <button
                type="button"
                onClick={() => setShowPassphrase(!showPassphrase)}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 text-sm font-medium transition-colors duration-150"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '2px'
                }}
              >
                {showPassphrase ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Helper Text */}
            <p
              className="mt-2 text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              This is a password-free system. Your passphrase is your identity.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="p-4"
              style={{
                backgroundColor: 'var(--color-error-bg)',
                border: '1px solid var(--color-error-border)',
                color: 'var(--color-error-text)',
                borderRadius: '4px'
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !passphrase.trim()}
            className="w-full py-3 px-6 font-medium text-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
            style={{
              backgroundColor: 'var(--color-accent-600)',
              color: '#ffffff',
              borderRadius: '2px'
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
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
              'Enter'
            )}
          </button>

          {/* Mobile Touch-Friendly Buttons */}
          <div className="flex gap-4 sm:hidden">
            <button
              type="button"
              onClick={() => setPassphrase('')}
              className="flex-1 py-3 px-6 font-medium transition-colors duration-150"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '2px'
              }}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isLoading || !passphrase.trim()}
              className="flex-1 py-3 px-6 font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--color-accent-600)',
                color: '#ffffff',
                borderRadius: '2px'
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
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
                'Enter'
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div
          className="mt-12 text-center text-sm"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          <p>Secure passphrase-based authentication</p>
          <p className="mt-1">No username. No password. Just your phrase.</p>
        </div>
      </div>
    </div>
  );
}
