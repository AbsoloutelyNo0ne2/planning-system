import React from 'react';
import { COLOR_SCHEMES } from '../contexts/ColorSchemeContext';
import type { ColorSchemeId } from '../contexts/ColorSchemeContext';

interface ColorSchemeSwitcherProps {
  onSchemeChange: (scheme: { id: ColorSchemeId; name: string }) => void;
  currentSchemeId?: string;
}

export function ColorSchemeSwitcher({ onSchemeChange, currentSchemeId = 'cyan-night' }: ColorSchemeSwitcherProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const schemes = Object.values(COLOR_SCHEMES);
  const currentScheme = schemes.find(s => s.id === currentSchemeId) || schemes[0];

  const handleSelect = (schemeId: ColorSchemeId) => {
    const scheme = COLOR_SCHEMES[schemeId];
    if (scheme) {
      onSchemeChange({ id: schemeId, name: scheme.name });
      setIsOpen(false);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '6px 12px',
          borderRadius: '6px',
          border: `1px solid var(--color-border-default)`,
          background: 'var(--color-bg-surface)',
          color: 'var(--color-text-primary)',
          fontSize: '0.75rem',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'var(--color-accent-500)',
          }}
        />
        {currentScheme.name}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            padding: '8px',
            borderRadius: '8px',
            background: 'var(--color-bg-elevated)',
            border: `1px solid var(--color-border-default)`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            zIndex: 100,
            minWidth: '200px',
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'grid', gap: '4px' }}>
            {schemes.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => handleSelect(scheme.id as ColorSchemeId)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: scheme.id === currentSchemeId ? 'var(--color-accent-soft)' : 'transparent',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    background: scheme.colors.accent500,
                  }}
                />
                {scheme.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { COLOR_SCHEMES };
export type { ColorSchemeId };
