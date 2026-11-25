import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';

/** Renders inside a router, for components that contain links. */
export function renderWithRouter(ui: ReactElement, options?: RenderOptions) {
  return render(<MemoryRouter>{ui}</MemoryRouter>, options);
}
