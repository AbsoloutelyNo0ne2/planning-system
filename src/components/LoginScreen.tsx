import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginScreen(): JSX.Element {
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        backgroundImage: 'radial-gradient(circle at 50% 0%, var(--accent-primary) 0%, transparent 50%)',
        backgroundSize: '100% 50%',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 
            className="text-4xl font-bold mb-3 tracking-tight"
            style={{ color: 'var(--text-primary)' }}
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
              <textarea
                id="passphrase"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Enter your passphrase..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg resize-none transition-all duration-200"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-primary)',
                  outline: 'none',
                  ...(showPassphrase ? {} : { WebkitTextSecurity: 'disc' }),
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent-primary)';
                  e.target.style.boxShadow = '0 0 0 2px var(--accent-secondary)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-primary)';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={isLoading}
              />
              
              {/* Show/Hide Toggle */}
              <button
                type="button"
                onClick={() => setShowPassphrase(!showPassphrase)}
                className="absolute right-3 top-3 px-3 py-1 rounded text-sm transition-colors"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--border-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
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
          </div>

          {/* Error Message */}
          {error && (
            <div 
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'oklch(25% 0.05 15)',
                border: '1px solid oklch(40% 0.1 15)',
                color: 'oklch(70% 0.15 15)',
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !passphrase.trim()}
            className="w-full py-4 px-6 rounded-lg font-medium text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--bg-primary)',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'var(--accent-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
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
    </div>
  );
}
