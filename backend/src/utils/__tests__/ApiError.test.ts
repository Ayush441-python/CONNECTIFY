import { describe, expect, it } from 'vitest';
import { ApiError } from '../ApiError';

describe('ApiError', () => {
  it('sets statusCode and message from the constructor', () => {
    const err = new ApiError(418, "I'm a teapot");
    expect(err.statusCode).toBe(418);
    expect(err.message).toBe("I'm a teapot");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });

  it('carries optional details', () => {
    const details = [{ field: 'email', message: 'Invalid email' }];
    const err = ApiError.badRequest('Validation failed', details);
    expect(err.statusCode).toBe(400);
    expect(err.details).toEqual(details);
  });

  it.each([
    ['badRequest', 400],
    ['unauthorized', 401],
    ['forbidden', 403],
    ['notFound', 404],
    ['conflict', 409],
    ['internal', 500],
  ] as const)('%s() produces status %i', (method, expectedStatus) => {
    const err = ApiError[method]();
    expect(err.statusCode).toBe(expectedStatus);
  });

  it('is catchable via instanceof after crossing a try/catch boundary', () => {
    function throwIt() {
      throw ApiError.notFound('Campaign not found');
    }
    try {
      throwIt();
      expect.unreachable('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      if (err instanceof ApiError) {
        expect(err.statusCode).toBe(404);
      }
    }
  });
});
