import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { TextField } from './TextField';

describe('TextField', () => {
  it('is labelled by its label and hint', async () => {
    render(<TextField label="Medicine name" hint="— for you, not the patient" />);
    const input = screen.getByRole('textbox', { name: 'Medicine name — for you, not the patient' });
    await userEvent.type(input, 'Amoxicillin');
    expect(input).toHaveValue('Amoxicillin');
  });

  it('marks an error and describes the field with it', () => {
    render(<TextField label="Medicine name" error="Give the medicine a name" />);
    const input = screen.getByRole('textbox', { name: 'Medicine name' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Give the medicine a name');
  });
});
