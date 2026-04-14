import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FluidBlobCanvas from './FluidBlobCanvas';
import { useColorScheme, COLOR_SCHEMES } from '../contexts/ColorSchemeContext';

const MIN_SWIPE_DISTANCE = 50;

export function LoginScreen(): JSX.Element {
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swipeFeedback, setSwipeFeedback] = useState<'submit' | 'clear' | null>(null);
  const touchStartX = useRef<number | null>(null);
  const { login } = useAuth();
  const { currentScheme } = useColorScheme();

  // Get the base hue from the current color scheme
  const scheme = COLOR_SCHEMES[currentScheme.id as keyof typeof COLOR_SCHEMES];
  const baseHue = scheme?.blob?.baseHue ?? 185; // Default to cyan for login

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!passphrase.trim()) {
      setError('Please enter a passphrase');
      return;
    }

    // Tactile state mutation: disable button, show loading
    setIsLoading(true);
    setError(null);

    const result = await login(passphrase);

    if (!result.success) {
      // Tactile error: stylized error message
      setError(result.error || 'Invalid passphrase');
      // Reset loading state after error
      setIsLoading(false);
    }
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
      className="flex min-h-screen"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* LEFT: Login Form (50%) */}
        <div
          className="flex-1 flex items-center justify-center p-8 relative"
          style={{ backgroundColor: 'var(--color-bg-base)' }}
        >
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        {/* Title */}
        <div className="mb-8">
          <h1
            className="text-7xl font-bold mb-1"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Welcome back
          </h1>
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Sign in to continue to your workspace
            </p>
          </div>

          {/* Passphrase Input */}
          <div className="space-y-2">
            <label
              htmlFor="passphrase"
              className="block text-sm font-medium"
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
            className="w-full px-4 py-3 text-sm transition-colors duration-150"
            style={{
              // Fix 1: Input Occlusion - padding-right exceeds "Hide" button width (~40px + margin)
              paddingRight: '3.5rem',
              // Fix 2: Soft Text Boundary - horizontal fade for graceful text dissolve
              maskImage: 'linear-gradient(to right, black 85%, transparent 95%)',
              WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 95%)',
              backgroundColor: isLoading ? 'var(--color-bg-elevated)' : 'var(--color-bg-surface)',
              color: isLoading ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              border: swipeFeedback
                ? swipeFeedback === 'submit'
                  ? '2px solid var(--color-accent-500)'
                  : '2px solid var(--color-error-border)'
                : '1px solid var(--color-border-default)',
              borderRadius: '4px',
              outline: 'none',
              // Input overflow: horizontal scroll for long passphrases
              overflowX: 'auto',
              whiteSpace: 'nowrap' as const,
              textOverflow: 'clip',
              opacity: isLoading ? 0.5 : 1,
              transition: 'opacity 300ms ease, background-color 300ms ease, color 300ms ease',
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
            className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-medium transition-colors duration-150"
            style={{
              background: 'transparent',
              color: 'var(--color-text-muted)',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            {showPassphrase ? 'Hide' : 'Show'}
          </button>
        </div>

            {/* Helper Text */}
            <p
              className="text-xs mt-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              This is a password-free system. Your passphrase is your identity.
            </p>
          </div>

        {/* Error Message - Fix 2: Structural Tremor - reserve spatial volume permanently */}
        <div className="min-h-[1.5rem]" aria-live="polite">
          {error && (
            <div
              className="p-4 text-sm"
              style={{
                backgroundColor: 'var(--color-error-bg)',
                border: '1px solid var(--color-error-border)',
                color: 'var(--color-error-text)',
                borderRadius: '4px',
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Submit Button - Desktop */}
        <button
          type="submit"
          disabled={isLoading || !passphrase.trim()}
          className="w-full py-3 px-6 text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed hidden sm:block"
          style={{
            backgroundColor: isLoading ? 'var(--color-bg-elevated)' : 'var(--color-accent-600)',
            color: isLoading ? 'var(--color-text-muted)' : '#ffffff',
            border: 'none',
            transition: 'all 200ms ease',
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
              Authenticating...
            </span>
          ) : (
            'Sign in'
          )}
        </button>

        {/* Mobile Touch-Friendly Buttons */}
        <div className="flex gap-4 sm:hidden">
          <button
            type="button"
            onClick={() => setPassphrase('')}
            className="flex-1 py-3 px-6 text-sm font-medium rounded border transition-colors duration-150"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-text-muted)',
              borderColor: 'var(--color-border-default)',
            }}
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isLoading || !passphrase.trim()}
            className="flex-1 py-3 px-6 text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isLoading ? 'var(--color-bg-elevated)' : 'var(--color-accent-600)',
              color: isLoading ? 'var(--color-text-muted)' : '#ffffff',
              border: 'none',
              transition: 'all 200ms ease',
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
                Authenticating...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </div>

          {/* Footer */}
          <div
            className="pt-6 text-center text-xs"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <p>Secure passphrase-based authentication</p>
            <p className="mt-1">No username. No password. Just your phrase.</p>
          </div>
        </form>
      </div>

{/* RIGHT: Fluid Blob Canvas (50%) */}
        <div
          className="flex-1 relative overflow-hidden hidden md:block"
          style={{
            background: 'radial-gradient(ellipse at 40% 40%, #1a1f35 0%, var(--color-bg-base) 70%)',
          }}
        >
          <FluidBlobCanvas baseHue={baseHue} />
        {/* Gradient overlay for smooth edge transition */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 130% 130% at center, transparent 35%, rgba(12, 15, 26, 0.5) 100%)',
          }}
        />
        {/* Hint text */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs pointer-events-none"
          style={{ color: 'rgba(148, 163, 184, 0.5)' }}
        >
          Move your cursor to interact
        </div>
      </div>
    </div>
  );
}
