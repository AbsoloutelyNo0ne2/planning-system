/**
 * @fileoverview Notification Component
 * 
 * PURPOSE:
 * Displays "No more work for you today." when user clicks disabled
 * Copy or Sent buttons after daily limit reached.
 * 
 * WHY IN-APP (NOT OS NATIVE):
 * From ADR-004: Consistent with app UI, controllable styling.
 * Small toast notification that doesn't interrupt flow.
 * 
 * LAYER STATUS: Layer 4 Complete - Full implementation
 * NEXT: Layer 5 - Add section index and finalize
 */

import * as React from 'react';

// SECTION: Notification Types
// Lines 18-30: Different notification types
export type NotificationType = 'info' | 'warning' | 'error';

// SECTION: Notification Data
// Lines 33-50: Notification state
export interface NotificationData {
  id: string;
  message: string;
  type: NotificationType;
  duration: number; // ms, 0 = persistent
}

// SECTION: Component Props
// Lines 53-70: Notification component props
export interface NotificationProps {
  notifications: NotificationData[];
  onDismiss: (id: string) => void;
}

// SECTION: Component
// Lines 73-110: Notification container
/**
 * Notification - Toast notification container
 *
 * POSITION: Bottom-right corner (or center, TBD)
 * STYLE: Small, non-intrusive, auto-dismissing
 *
 * THE LIMIT NOTIFICATION:
 * When limit reached and user clicks Copy/Sent:
 * - Show: "No more work for you today."
 * - Type: warning (yellow/orange)
 * - Duration: 3000ms (auto-dismiss)
 * - Position: Center or bottom-center
 *
 * ANIMATION:
 * - Enter: Fade in + slide up
 * - Exit: Fade out
 */
// REASONING: We need a container to position notifications fixed on screen
// Using fixed positioning ensures notifications appear above all content
// Position bottom-center is least intrusive while being visible
export function NotificationContainer(props: NotificationProps): JSX.Element {
  const { notifications, onDismiss } = props;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50">
      {notifications.map(n => (
        <NotificationToast key={n.id} data={n} onDismiss={() => onDismiss(n.id)} />
      ))}
    </div>
  );
}

// SECTION: Single Notification
// Lines 113-140: Individual toast
// REASONING: Each toast needs auto-dismiss logic
// Using useEffect with setTimeout allows React to manage cleanup
// Empty dependency array ensures timer starts once on mount
// Cleanup function prevents memory leaks if component unmounts early
export function NotificationToast({
  data,
  onDismiss
}: {
  data: NotificationData;
  onDismiss: () => void;
}): JSX.Element {
  React.useEffect(() => {
    if (data.duration > 0) {
      const timer = setTimeout(onDismiss, data.duration);
      return () => clearTimeout(timer);
    }
  }, []);

  // REASONING: Color coding by type helps user understand severity quickly
  // Warning = yellow/amber for limit notifications (not blocking but important)
  // Error = red for actual errors
  // Info = blue for general updates
  const typeStyles = {
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500'
  };

  return (
    <div
      className={`
        ${typeStyles[data.type]}
        text-white
        px-4 py-2
        rounded-lg
        shadow-lg
        flex
        items-center
        gap-3
        min-w-[280px]
        animate-in
        fade-in
        slide-in-from-bottom-2
      `}
    >
      <span className="flex-1 text-sm font-medium">{data.message}</span>
      <button
        onClick={onDismiss}
        className="text-white/80 hover:text-white text-lg leading-none"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

// SECTION: Preset Notifications
// Lines 143-155: Pre-defined messages
// REASONING: Preset ensures consistent messaging across the app
// Using crypto.randomUUID() provides unique IDs for React keys
// Warning type signals non-blocking issue (user can continue browsing)
// 3000ms duration is readable without being intrusive
export function getLimitReachedNotification(): NotificationData {
  return {
    id: crypto.randomUUID(),
    message: 'No more work for you today.',
    type: 'warning',
    duration: 3000
  };
}

// SECTION MAP:
// Lines 1-17: File header
// Lines 18-20: Import
// Lines 23-29: Notification types
// Lines 32-36: Notification data interface
// Lines 39-42: Props interface
// Lines 45-70: Container component
// Lines 73-129: Toast component
// Lines 132-144: Preset notifications
