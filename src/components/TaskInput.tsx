/**
 * @fileoverview Task Input Component
 *
 * PURPOSE:
 * Multi-step task creation flow:
 * 1. Description input (with /DIG suggestion if < 250 words)
 * 2. Value class selector
 * 3. Type selector
 * 4. Trajectory match percentage
 * 5. Actor comparison notes
 *
 * WHY SEQUENTIAL FLOW:
 * From spec: "Sequential prompts (enter to advance) — faster for keyboard-driven workflow"
 *
 * LAYER STATUS: Layer 1-5 Complete
 * Layers: File headers → Signatures → Step comments → Reasoning+Implementation → Section Map
 */

import * as React from 'react';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useTaskStore } from '../stores/taskStore';
import { useActorStore } from '../stores/actorStore';
import { createTask, ValueClass, TaskType } from '../types/task';
import { HybridStep } from './HybridStep';
// Slider variants available for comparison - import the one you want to use
// import { MinimalSlider } from './sliders/SliderVariants';
// import { VesperSlider } from './sliders/SliderVariants';
// import { GradientSlider } from './sliders/SliderVariants';
// import { SliderVariantsDemo } from './sliders/SliderVariants';

// SECTION: Step Types
// Lines 24-35: Creation flow steps
export type CreationStep =
  | 'description'
  | 'valueClass'
  | 'type'
  | 'hybrid'
  | 'trajectoryMatch'
  | 'actorNotes';

// SECTION: Component State
// Lines 38-50: Internal state interface
export interface TaskInputState {
  currentStep: CreationStep;
  description: string;
  valueClass: ValueClass | null;
  type: TaskType | null;
  hybridRatio: number | null; // 0-100: % agentic vs human split
  trajectoryMatch: number | null;
  actorNotes: Record<string, string>;
  currentActorIndex: number;
}

// SECTION: Component Props
// Lines 53-60: TaskInput props
export interface TaskInputProps {
  onTaskCreated: () => void;
}

// REASONING:
// We need the main TaskInput component to orchestrate the multi-step flow
// > What state do we need?
// > Current step (which screen to show)
// > Form data (accumulated across steps)
// > Selected index (for keyboard navigation in selectors)
// > Therefore: useState for each piece of state
// > We also need access to stores for saving the task
// > useTaskStore for addTask, useActorStore for actor list
export function TaskInput(props: TaskInputProps): JSX.Element {
  const { onTaskCreated } = props;

  // Current step in the flow
  const [currentStep, setCurrentStep] = useState<CreationStep>('description');

  // Accumulated form data
  const [formData, setFormData] = useState<TaskInputState>({
    currentStep: 'description',
    description: '',
    valueClass: null,
    type: null,
    hybridRatio: 50, // Default 50/50 split for hybrid tasks
    trajectoryMatch: 50,
    actorNotes: {},
    currentActorIndex: 0,
  });

// Flag to prevent premature task creation
const [isComplete, setIsComplete] = useState(false);

// Guard to prevent double-execution and race conditions in completion effect
const completionGuard = useRef(false);

// Guard to prevent double-increment of actor index when Enter is pressed rapidly
// Uses timestamp to only block events within 100ms window, not across renders
const lastAdvanceTime = useRef(0);

// BUG FIX: Use ref to track currentActorIndex synchronously to avoid stale closure
// The advanceStep callback captures formData.currentActorIndex at creation time,
// but the state updater uses the fresh value. This causes "Actor 6 of 5" bugs.
const currentActorIndexRef = useRef(formData.currentActorIndex);

// BUG FIX: Track completion state in ref to avoid stale closure in advanceStep
const isCompleteRef = useRef(isComplete);

  // Navigation index for keyboard-controlled selectors
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Touch/swipe gesture state for mobile
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeFeedback, setSwipeFeedback] = useState<'none' | 'left' | 'right'>('none');

// Sync ref with state to prevent stale closure issues
useEffect(() => {
  currentActorIndexRef.current = formData.currentActorIndex;
}, [formData.currentActorIndex]);

  // Sync isComplete ref with state
  useEffect(() => {
    isCompleteRef.current = isComplete;
  }, [isComplete]);

  // Store access - Use typed selectors to get proper types
const addTask = useTaskStore((state) => state.addTask);
const { actors } = useActorStore();

// REASONING:
// We need to advance to the next step
// > What is the order?
// > description → valueClass → type → [hybrid if HYBRID selected] → trajectoryMatch → actorNotes → complete
// > For actorNotes, we need to handle multiple actors
// > Therefore: Switch statement with conditional hybrid step
//
// BUG FIX: Original code had these bugs:
// 1. Step skipping: The completion effect triggered prematurely due to loose null checks
// 2. White screen: setState after unmount and double creation were possible
// 3. Validation: The component didn't enforce value class selection
//
// The fix ensures:
// - Step progression follows the correct sequence
// - Completion is validated with strict null/undefined checks (using != null)
// - State updates are guarded against unmounts
const advanceStep = useCallback(() => {
  setCurrentStep((prevStep) => {
    switch (prevStep) {
      case 'description':
        // BUG FIX: Step 2 (valueClass) was being skipped due to premature isComplete
        // Ensure we go to valueClass, not directly to type
        return 'valueClass';
      case 'valueClass':
        return 'type';
      case 'type':
        // NEW: Conditional hybrid step - only show if HYBRID type selected
        // Hybrid tasks need additional configuration for the agentic/human split
        if (formData.type === TaskType.HYBRID) {
          return 'hybrid';
        }
        // Skip hybrid step for non-hybrid tasks
        return 'trajectoryMatch';
      case 'hybrid':
        // After hybrid config, go to trajectory match
        return 'trajectoryMatch';
      case 'trajectoryMatch':
        return 'actorNotes';
      case 'actorNotes':
        // BUG FIX: Use timestamp-based guard to prevent double-increment when Enter
        // is pressed rapidly, without blocking subsequent valid key presses.
        // 50ms window blocks duplicate events from single keypress but allows rapid typing.
        {
          const now = Date.now();
          if (now - lastAdvanceTime.current < 50) {
            return 'actorNotes';
          }
          lastAdvanceTime.current = now;

          // Check if this is the last actor before updating state
          // BUG FIX: Use ref instead of formData.currentActorIndex to avoid stale closure
          const isLastActor = currentActorIndexRef.current >= actors.length - 1;

          if (isLastActor) {
            // BUG FIX: Complete task directly instead of relying on useEffect loop-back
            // The loop-back pattern (set isComplete + return to description) had timing issues
            // where the effect wouldn't fire because isComplete was still false in closure
            const hasCompletedFlow =
              formData.description &&
              formData.valueClass != null &&
              formData.type != null &&
              formData.trajectoryMatch != null &&
              (formData.type !== TaskType.HYBRID || formData.hybridRatio != null);

            if (hasCompletedFlow) {
              // Create and save the task immediately
              const newTask = createTask(
                formData.description,
                formData.valueClass!,
                formData.type!,
                formData.trajectoryMatch!,
                formData.actorNotes
              );
              addTask(newTask);
              onTaskCreated();

              // Reset form state for next task creation
              setFormData({
                currentStep: 'description',
                description: '',
                valueClass: null,
                type: null,
                hybridRatio: 50,
                trajectoryMatch: 50,
                actorNotes: {},
                currentActorIndex: 0,
              });
              setSelectedIndex(0);
            }

            return 'description';
          }

          // More actors remain - increment index and stay on actorNotes
          setFormData((f) => ({
            ...f,
            currentActorIndex: f.currentActorIndex + 1
          }));
          setSelectedIndex(0);
          return 'actorNotes';
        }
      default:
        return 'description';
    }
  });
  }, [actors, formData.type, formData.description, formData.valueClass, formData.trajectoryMatch, formData.hybridRatio, formData.actorNotes, addTask, onTaskCreated]);

// REASONING:
// We need to handle form submission when all steps are complete
// > When do we know we're done?
// > When isComplete is true AND we're back at description (loop-back pattern)
// > Why was there a bug?
// > The original code had a race condition: the effect runs when formData changes
// > It sets isComplete to trigger task creation, then resets form state
// > But the effect can re-trigger before unmount due to formData dep changes
// > This causes double-creation and setState after unmount (white screen)
// > BUG FIX: Use completionGuard ref to track if completion is in progress
// > This prevents double-execution and ensures clean unmount
// DEPRECATED: This effect is no longer used for task completion
// Task completion now happens directly in the advanceStep function when
// the last actor is processed. This avoids race conditions with stale closures.
// Keeping this effect for potential future use but it should not trigger
// under normal operation since isComplete is no longer set to true.
useEffect(() => {
// Guard 1: Only proceed if marked complete and at description step
if (currentStep !== 'description' || !isComplete) {
return;
}

// Guard 2: Prevent double-execution with completionGuard ref
// This solves the race condition where the effect re-runs before state reset
if (completionGuard.current) {
return;
}
completionGuard.current = true;

// Guard 3: Must have description before validating completion
if (!formData.description) {
completionGuard.current = false;
return;
}

// Guard 4: Validate all required fields are present
    // Use != null to catch BOTH null AND undefined
    // Hybrid tasks also need hybridRatio configured
    const hasCompletedFlow =
    formData.valueClass != null &&
    formData.type != null &&
    formData.trajectoryMatch != null &&
    (formData.type !== TaskType.HYBRID || formData.hybridRatio != null);

if (!hasCompletedFlow) {
completionGuard.current = false;
return;
}

    // Create and save the task
    // TypeScript doesn't narrow object properties, so we extract to const
    const valueClass = formData.valueClass;
    const type = formData.type;
    const trajectoryMatch = formData.trajectoryMatch;

    // These are guaranteed non-null by hasCompletedFlow check above
    const newTask = createTask(
      formData.description,
      valueClass!,  // Non-null assertion safe due to hasCompletedFlow validation
      type!,        // Non-null assertion safe due to hasCompletedFlow validation
      trajectoryMatch!,  // Non-null assertion safe due to hasCompletedFlow validation
      formData.actorNotes
    );
addTask(newTask);
onTaskCreated();

// Reset form state for next task creation
setFormData({
currentStep: 'description',
description: '',
valueClass: null,
type: null,
hybridRatio: 50,
trajectoryMatch: 50,
actorNotes: {},
currentActorIndex: 0,
});
setSelectedIndex(0);
setIsComplete(false);

// Reset guard after state updates complete
// setTimeout ensures this runs after the current execution context
setTimeout(() => {
completionGuard.current = false;
}, 0);
}, [currentStep, isComplete, formData.description, formData.valueClass, formData.type, formData.hybridRatio, formData.trajectoryMatch, formData.actorNotes, addTask, onTaskCreated]);

  // REASONING:
  // We need to handle step transitions to reset navigation state
  // > When should we reset selectedIndex?
  // > Whenever we change steps, reset to 0 for new selector
  useEffect(() => {
    setSelectedIndex(0);
  }, [currentStep]);

  // REASONING:
  // We need to go back to the previous step when user presses ESC
  // > What is the reverse order?
  // > actorNotes → trajectoryMatch → [hybrid if was shown] → type → valueClass → description
  // > At description step, ESC cancels/closes the form
  // > Therefore: Switch statement that reverses the advanceStep logic
  const goToPreviousStep = useCallback(() => {
    switch (currentStep) {
      case 'description':
        // At first step, ESC cancels - reset form
        setFormData({
          currentStep: 'description',
          description: '',
          valueClass: null,
          type: null,
          hybridRatio: 50,
          trajectoryMatch: 50,
          actorNotes: {},
          currentActorIndex: 0,
        });
        setSelectedIndex(0);
        break;
      case 'valueClass':
        setCurrentStep('description');
        break;
      case 'type':
        setCurrentStep('valueClass');
        break;
      case 'hybrid':
        setCurrentStep('type');
        break;
      case 'trajectoryMatch':
        // If we came from hybrid step, go back there; otherwise go to type
        if (formData.type === TaskType.HYBRID) {
          setCurrentStep('hybrid');
        } else {
          setCurrentStep('type');
        }
        break;
      case 'actorNotes':
        if (formData.currentActorIndex > 0) {
          // Go back to previous actor instead of previous step
          setFormData((f) => ({ ...f, currentActorIndex: f.currentActorIndex - 1 }));
        } else {
          setCurrentStep('trajectoryMatch');
        }
        break;
    }
  }, [currentStep, formData.type, formData.currentActorIndex]);

  // REASONING:
  // We need to handle ESC key for navigation
  // > What should ESC do?
  // > Go back to previous step, or cancel at first step
  // > Therefore: Global keydown listener that calls goToPreviousStep
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        goToPreviousStep();
      }
    };

  window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPreviousStep]);

  // Touch handlers for swipe gestures on mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Reset refs
    touchStartX.current = null;
    touchStartY.current = null;

    // Minimum swipe distance threshold
    const minSwipeDistance = 50;

    // Check if horizontal swipe is dominant (not a vertical scroll)
    if (Math.abs(deltaX) < Math.abs(deltaY)) return;

    // Right-to-left swipe (negative deltaX) = Enter (proceed)
    if (deltaX < -minSwipeDistance) {
      setSwipeFeedback('left');
      setTimeout(() => setSwipeFeedback('none'), 300);
      advanceStep();
    }
    // Left-to-right swipe (positive deltaX) = Esc (go back)
    else if (deltaX > minSwipeDistance) {
      setSwipeFeedback('right');
      setTimeout(() => setSwipeFeedback('none'), 300);
      goToPreviousStep();
    }
  }, [advanceStep, goToPreviousStep]);

  // REASONING:
  // We need to render the appropriate step component
  // > How do we decide which to render?
  // > Switch on currentStep
  // > Each step needs: current value, onChange handler, onSubmit handler
  const renderStep = () => {
    switch (currentStep) {
      case 'description':
        return (
          <DescriptionInput
            value={formData.description}
            onChange={(value) => setFormData((f) => ({ ...f, description: value }))}
            onSubmit={advanceStep}
          />
        );
      case 'valueClass':
        return (
          <ValueClassSelector
            selected={formData.valueClass}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            onSelect={(value) => setFormData((f) => ({ ...f, valueClass: value }))}
            onSubmit={advanceStep}
          />
        );
      case 'type':
        return (
          <TypeSelector
            selected={formData.type}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            onSelect={(value) => setFormData((f) => ({ ...f, type: value }))}
            onSubmit={advanceStep}
          />
        );
      case 'hybrid':
        return (
          <HybridStep
            value={formData.hybridRatio}
            onChange={(value) => setFormData((f) => ({ ...f, hybridRatio: value }))}
            onSubmit={advanceStep}
          />
        );
      case 'trajectoryMatch':
        return (
          <TrajectoryMatchInput
            value={formData.trajectoryMatch}
            onChange={(value) => setFormData((f) => ({ ...f, trajectoryMatch: value }))}
            onSubmit={advanceStep}
          />
        );
      case 'actorNotes':
        // Guard: if no actors configured, show message
        if (actors.length === 0) {
          return (
            <div style={{ color: 'var(--color-text-muted)' }}>
              No Actors Configured. Add an actor first.
            </div>
          );
        }
        const currentActor = actors[formData.currentActorIndex];
        const currentActorId = currentActor?.id || '';
        return (
          <ActorNoteInput
            actorName={currentActor?.name || 'Actor'}
            actorIndex={formData.currentActorIndex}
            totalActors={actors.length}
            value={formData.actorNotes[currentActorId] || ''}
            onChange={(value) =>
              setFormData((f) => {
                // Get the actor ID from the current index at update time
                // to avoid stale closure issues
                const actorAtUpdate = actors[f.currentActorIndex];
                const actorId = actorAtUpdate?.id || '';
                return {
                  ...f,
                  actorNotes: { ...f.actorNotes, [actorId]: value },
                };
              })
            }
            onSubmit={advanceStep}
          />
        );
      default:
        return null;
    }
  };

  // REASONING:
  // We need to show progress through the flow
  // > What information is useful?
  // > Current step name, progress percentage
  // > Therefore: Simple progress indicator at top
  const stepLabels: Record<CreationStep, string> = {
    description: 'Description',
    valueClass: 'Value Class',
    type: 'Task Type',
    hybrid: 'Hybrid Split',
    trajectoryMatch: 'Trajectory Match',
    actorNotes: 'Actor Notes',
  };

  // NOTE: stepOrder defines the canonical 6-step flow.
  // For non-hybrid tasks, the 'hybrid' step is skipped at runtime,
  // but it's included here for progress calculation consistency.
  const stepOrder: CreationStep[] = ['description', 'valueClass', 'type', 'hybrid', 'trajectoryMatch', 'actorNotes'];
  const currentStepIndex = stepOrder.indexOf(currentStep);
  const progressPercent = ((currentStepIndex + 1) / stepOrder.length) * 100;

  return (
    <div
      className="w-full max-w-2xl mx-auto p-6 rounded-lg touch-pan-y"
      style={{
        backgroundColor: 'var(--color-bg-surface)',
        border: '1px solid var(--color-border-subtle)',
        transition: 'box-shadow 0.2s ease',
        boxShadow: swipeFeedback === 'left'
          ? '0 0 20px oklch(70% 0.25 195 / 0.5), inset 0 0 30px oklch(70% 0.25 195 / 0.1)'
          : swipeFeedback === 'right'
          ? '0 0 20px oklch(65% 0.2 25 / 0.5), inset 0 0 30px oklch(65% 0.2 25 / 0.1)'
          : 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {stepLabels[currentStep]}
          </h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Step {currentStepIndex + 1} of {stepOrder.length}
          </span>
        </div>
        <div 
          className="w-full rounded-full h-1"
          style={{ backgroundColor: 'var(--color-bg-elevated)' }}
        >
          <div
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, oklch(70% 0.25 195), oklch(72% 0.22 145))'
            }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[200px]">{renderStep()}</div>

      {/* Keyboard Help */}
      <div
        className="mt-6 pt-4 flex justify-between text-xs"
        style={{
          borderTop: '1px solid var(--color-border-subtle)',
          color: 'var(--color-text-muted)'
        }}
      >
        <span className="hidden sm:inline">Press Enter to continue</span>
        <span className="hidden sm:inline">Esc to go back</span>
        <span className="sm:hidden">← Swipe right to go back</span>
        <span className="sm:hidden">Swipe left to continue →</span>
      </div>
    </div>
  );
}

// SECTION: Step Components
// Lines 250-450: Individual step component implementations

// REASONING:
// We need DescriptionInput for step 1
// > What does it need?
// > Textarea for input, word count display, DIG suggestion if < 250 words
// > Enter key should submit to next step
// > Therefore: Controlled textarea with onKeyDown handler
interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function DescriptionInput(props: DescriptionInputProps): JSX.Element {
  const { value, onChange, onSubmit } = props;

  const wordCount = useMemo(() => {
    return value.trim().split(/\s+/).filter(Boolean).length;
  }, [value]);

  const showDigSuggestion = wordCount < 250 && value.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the task in detail..."
          className="w-full h-40 px-4 py-3 rounded-lg resize-none outline-none transition-all"
          style={{
            backgroundColor: 'var(--color-bg-input)',
            border: '1px solid var(--color-border-default)',
            color: 'var(--color-text-primary)'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent-500)';
            e.currentTarget.style.boxShadow = '0 0 0 3px oklch(45% 0.15 195 / 0.2)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-default)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          autoFocus
        />
      </div>

      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <span style={{ fontWeight: 500, color: wordCount >= 250 ? 'var(--color-mint-400)' : 'var(--color-text-muted)' }}>
            {wordCount} words
          </span>
          {showDigSuggestion && (
            <span 
              className="px-2 py-1 rounded text-xs"
              style={{ 
                backgroundColor: 'var(--color-warning-bg)',
                color: 'var(--color-warning-text)'
              }}
            >
              /DIG suggested — enhance task for better clarity
            </span>
          )}
        </div>
        <span style={{ color: 'var(--color-text-muted)' }}>Press Enter to continue</span>
      </div>
    </div>
  );
}

// REASONING:
// We need ValueClassSelector for step 2
// > What does it need?
// > 6 buttons for ValueClass enum, highlight selected, keyboard navigation
// > Arrow keys / W,S to navigate, Enter to confirm
// > Therefore: Array of options with keyboard handler
const valueClassOptions: { value: ValueClass; label: string; description: string }[] = [
  { value: ValueClass.FUN_USEFUL, label: 'Fun & Useful', description: 'Enjoyable and valuable work' },
  { value: ValueClass.USEFUL, label: 'Useful', description: 'Important but not exciting' },
  { value: ValueClass.HAS_TO_BE_DONE, label: 'Has to be Done', description: 'Necessary obligations' },
  { value: ValueClass.HAS_TO_BE_DONE_BORING, label: 'Has to be Done (Boring)', description: 'Tedious but required' },
  { value: ValueClass.FUN_USELESS, label: 'Fun but Useless', description: 'Enjoyable distractions' },
  { value: ValueClass.BORING_USELESS, label: 'Boring & Useless', description: 'Should be eliminated' },
];

interface ValueClassSelectorProps {
  selected: ValueClass | null;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  onSelect: (value: ValueClass) => void;
  onSubmit: () => void;
}

export function ValueClassSelector(props: ValueClassSelectorProps): JSX.Element {
  const { selected, selectedIndex, setSelectedIndex, onSelect, onSubmit } = props;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          setSelectedIndex(Math.max(0, selectedIndex - 1));
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setSelectedIndex(Math.min(valueClassOptions.length - 1, selectedIndex + 1));
          break;
      case 'Enter':
        e.preventDefault();
        // Guard: Must have selected a value class before advancing
        // Prevents step skipping bug when user clicks with mouse then presses Enter
        if (selected == null) {
          return; // Don't advance without selection
        }
        // Sync selectedIndex with selected prop for keyboard consistency
        const selectedOptionIndex = valueClassOptions.findIndex(opt => opt.value === selected);
        if (selectedOptionIndex !== -1) {
          setSelectedIndex(selectedOptionIndex);
        }
        onSubmit();
        break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, setSelectedIndex, onSelect, onSubmit]);

  return (
    <div className="space-y-2">
      {valueClassOptions.map((option, index) => {
        const isSelected = selected === option.value;
        const isHighlighted = selectedIndex === index;
        return (
          <button
            key={option.value}
            onClick={() => { setSelectedIndex(index); onSelect(option.value); }}
            onDoubleClick={() => { onSelect(option.value); onSubmit(); }}
            className="w-full text-left px-4 py-3 rounded-lg border transition-all duration-150"
            style={{
              backgroundColor: isSelected
                ? 'oklch(45% 0.15 195 / 0.2)'
                : isHighlighted
                  ? 'var(--color-bg-hover)'
                  : 'var(--color-bg-elevated)',
              borderColor: isSelected
                ? 'var(--color-accent-700)'
                : isHighlighted
                  ? 'var(--color-border-focus)'
                  : 'var(--color-border-subtle)',
              boxShadow: isSelected ? '0 0 0 2px oklch(45% 0.15 195 / 0.35)' : 'none'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{option.label}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{option.description}</div>
              </div>
              {isSelected && (
                <svg style={{ width: '1.25rem', height: '1.25rem', color: 'var(--color-accent-400)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        );
      })}
      <div className="pt-2 text-xs flex items-center gap-4" style={{ color: 'var(--color-text-muted)' }}>
        <span>↑/↓ or W/S to navigate</span>
        <span>Enter to select</span>
      </div>
    </div>
  );
}

// REASONING:
// We need TypeSelector for step 3
// > What does it need?
// > 3 buttons: "Agentic" / "Hybrid" / "Non-agentic"
// > Same navigation pattern as ValueClassSelector
// > Therefore: Version with 3 options including new HYBRID type
const typeOptions: { value: TaskType; label: string; description: string }[] = [
  { value: TaskType.AGENTIC, label: 'Agentic', description: 'Autonomous task execution with minimal supervision' },
  { value: TaskType.HYBRID, label: 'Hybrid', description: 'Mixed execution - AI assistance with human oversight' },
  { value: TaskType.NON_AGENTIC, label: 'Non-Agentic', description: 'Directed task execution with human oversight' },
];

interface TypeSelectorProps {
  selected: TaskType | null;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  onSelect: (value: TaskType) => void;
  onSubmit: () => void;
}

export function TypeSelector(props: TypeSelectorProps): JSX.Element {
  const { selected, selectedIndex, setSelectedIndex, onSelect, onSubmit } = props;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          setSelectedIndex(Math.max(0, selectedIndex - 1));
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setSelectedIndex(Math.min(typeOptions.length - 1, selectedIndex + 1));
          break;
      case 'Enter':
        e.preventDefault();
        // Guard: Must have selected a type before advancing
        // Prevents step skipping bug when user clicks with mouse then presses Enter
        if (selected == null) {
          return; // Don't advance without selection
        }
        // Sync selectedIndex with selected prop for keyboard consistency
        const selectedOptionIndex = typeOptions.findIndex(opt => opt.value === selected);
        if (selectedOptionIndex !== -1) {
          setSelectedIndex(selectedOptionIndex);
        }
        onSubmit();
        break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, setSelectedIndex, onSelect, onSubmit]);

  return (
    <div className="space-y-2">
      {typeOptions.map((option, index) => {
        const isSelected = selected === option.value;
        const isHighlighted = selectedIndex === index;
        const accentColor = option.value === TaskType.AGENTIC ? 'var(--color-mint-500)' : 
                           option.value === TaskType.HYBRID ? 'var(--color-accent-500)' :
                           'var(--color-text-muted)';
        return (
          <button
            key={option.value}
            onClick={() => { setSelectedIndex(index); onSelect(option.value); }}
            onDoubleClick={() => { onSelect(option.value); onSubmit(); }}
            className="w-full text-left px-4 py-3 rounded-lg border transition-all duration-150"
            style={{
              backgroundColor: isSelected 
                ? `${accentColor}26`
                : isHighlighted 
                  ? 'var(--color-bg-hover)' 
                  : 'var(--color-bg-elevated)',
              borderColor: isSelected 
                ? accentColor
                : isHighlighted 
                  ? 'var(--color-border-focus)' 
                  : 'var(--color-border-subtle)',
              boxShadow: isSelected ? `0 0 0 2px ${accentColor}4D` : 'none'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{option.label}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{option.description}</div>
              </div>
              {isSelected && (
                <svg style={{ width: '1.25rem', height: '1.25rem', color: accentColor }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        );
      })}
      <div className="pt-2 text-xs flex items-center gap-4" style={{ color: 'var(--color-text-muted)' }}>
        <span>↑/↓ or W/S to navigate</span>
        <span>Enter to select</span>
      </div>
    </div>
  );
}

// REASONING:
// We need TrajectoryMatchInput for step 4
// > What does it need?
// > Range input 0-100, display current value, Enter confirms
// > Visual feedback showing the percentage
// > Therefore: Range input with number display
interface TrajectoryMatchInputProps {
  value: number | null;
  onChange: (value: number) => void;
  onSubmit: () => void;
}

export function TrajectoryMatchInput(props: TrajectoryMatchInputProps): JSX.Element {
  const { value, onChange, onSubmit } = props;
  const currentValue = value ?? 50;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSubmit]);

  return (
    <div className="space-y-6">
      <div className="vesper-slider-display">
        <div className="vesper-slider-display-value">
          {currentValue}%
        </div>
        <div className="vesper-slider-display-label">Trajectory Match</div>
      </div>

      <div className="vesper-slider-container px-2">
        <input
          type="range"
          min="0"
          max="100"
          value={currentValue}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="vesper-slider"
          style={{
            background: `linear-gradient(to right, oklch(70% 0.25 195) 0%, oklch(72% 0.22 145) ${currentValue}%, oklch(18% 0.03 260) ${currentValue}%, oklch(18% 0.03 260) 100%)`
          }}
          autoFocus
        />
        <div className="vesper-slider-labels">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Press Enter to confirm
      </div>
    </div>
  );
}

// REASONING:
// We need ActorNoteInput for step 5
// > What does it need?
// > Show current actor name, text input for note, Enter advances
// > If more actors remain, stay on this step with next actor
// > Otherwise complete the flow
// > Therefore: Input with actor context and progress indicator
interface ActorNoteInputProps {
  actorName: string;
  actorIndex: number;
  totalActors: number;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function ActorNoteInput(props: ActorNoteInputProps): JSX.Element {
  const { actorName, actorIndex, totalActors, value, onChange, onSubmit } = props;

  // Use global keydown listener like other step components for consistency
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSubmit]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center font-medium"
            style={{ 
              backgroundColor: 'var(--color-accent-700)',
              color: 'var(--color-bg-base)'
            }}
          >
            {actorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{actorName}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Actor {actorIndex + 1} of {totalActors}
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Add notes for ${actorName}...`}
          className="w-full px-4 py-3 rounded-lg outline-none transition-all"
          style={{
            backgroundColor: 'var(--color-bg-input)',
            border: '1px solid var(--color-border-default)',
            color: 'var(--color-text-primary)'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-accent-500)';
            e.currentTarget.style.boxShadow = '0 0 0 3px oklch(45% 0.15 195 / 0.2)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border-default)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          autoFocus
        />
      </div>

      <div className="flex justify-between items-center text-sm">
        <span style={{ color: 'var(--color-text-muted)' }}>
          {actorIndex < totalActors - 1 ? 'Press Enter for next actor' : 'Press Enter to complete'}
        </span>
        <span style={{ color: 'var(--color-text-secondary)' }}>
          {actorIndex + 1} / {totalActors}
        </span>
      </div>
    </div>
  );
}

// SECTION MAP:
// Lines 1-22: File header with purpose
// Lines 24-35: Step type definitions
// Lines 38-50: State interface
// Lines 53-60: Props interface
// Lines 62-230: Main TaskInput component with state machine
// Lines 232-320: DescriptionInput component
// Lines 322-410: ValueClassSelector component
// Lines 412-490: TypeSelector component
// Lines 492-560: TrajectoryMatchInput component
// Lines 562-630: ActorNoteInput component
// Lines 632-650: Section map for navigation
