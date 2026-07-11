import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge, Button, EmptyState, ErrorState, Input } from '../ui';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Save changes</Button>);
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and does not fire onClick while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Submit
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('respects an explicit disabled prop', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

describe('Input', () => {
  it('renders a label and forwards value changes', async () => {
    const onChange = vi.fn();
    render(<Input label="Email" value="" onChange={onChange} placeholder="you@example.com" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    const input = screen.getByPlaceholderText('you@example.com');
    await userEvent.type(input, 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('shows a validation error message when provided', () => {
    render(<Input label="Password" error="At least 8 characters" value="" onChange={() => {}} />);
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('renders its label text', () => {
    render(<Badge tone="success">ACCEPTED</Badge>);
    expect(screen.getByText('ACCEPTED')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders title, description, and an optional action', () => {
    render(<EmptyState title="No campaigns yet" description="Create your first one" action={<button>Create</button>} />);
    expect(screen.getByText('No campaigns yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first one')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('shows a retry button that calls onRetry when clicked', async () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Network error" onRetry={onRetry} />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders without a retry button when onRetry is omitted', () => {
    render(<ErrorState message="Failed to load" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
