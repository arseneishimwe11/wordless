import { createContext, useContext, useId, type ReactNode } from 'react';

interface OptionGroupContext {
  name: string;
  type: 'radio' | 'checkbox';
}

const Context = createContext<OptionGroupContext | null>(null);

/** The surrounding group's input name and type, for cards, swatches and person chips. */
export function useOptionGroup(): OptionGroupContext | null {
  return useContext(Context);
}

export interface OptionGroupProps {
  /** Names the group for screen readers ("Form", "Rules", "Color and pattern"). */
  label?: string | undefined;
  /** Or point at visible text that names it. */
  labelledBy?: string | undefined;
  /** `radio`: one choice (forms, colours, people). `checkbox`: any number (rules). */
  type: 'radio' | 'checkbox';
  className?: string | undefined;
  children: ReactNode;
}

/**
 * Groups ToggleCards, Swatches or PersonChips: gives them one input name and
 * names the group, so arrow keys and screen readers treat it as one control.
 */
export function OptionGroup({ label, labelledBy, type, className, children }: OptionGroupProps) {
  const name = useId();
  return (
    <Context.Provider value={{ name, type }}>
      <div
        role={type === 'radio' ? 'radiogroup' : 'group'}
        aria-label={label}
        aria-labelledby={labelledBy}
        className={className}
      >
        {children}
      </div>
    </Context.Provider>
  );
}
