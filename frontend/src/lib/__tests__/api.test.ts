import { describe, expect, it } from 'vitest';
import { AxiosError } from 'axios';
import { extractErrorMessage } from '../api';

describe('extractErrorMessage', () => {
  it('extracts the message field from an Axios error response body', () => {
    const err = new AxiosError('Request failed');
    err.response = {
      data: { message: 'Invalid email or password' },
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      // @ts-expect-error minimal mock, config isn't exercised by extractErrorMessage
      config: {},
    };
    expect(extractErrorMessage(err)).toBe('Invalid email or password');
  });

  it('falls back to the Axios error message when no response body is present', () => {
    const err = new AxiosError('Network Error');
    expect(extractErrorMessage(err)).toBe('Network Error');
  });

  it('handles a plain Error instance', () => {
    expect(extractErrorMessage(new Error('Something broke'))).toBe('Something broke');
  });

  it('falls back to a generic message for unknown thrown values', () => {
    expect(extractErrorMessage('a raw string, not an Error')).toBe('Something went wrong');
    expect(extractErrorMessage(undefined)).toBe('Something went wrong');
  });
});
