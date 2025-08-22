/* eslint-env jest */
/* eslint-disable import/no-extraneous-dependencies */
import { jest } from '@jest/globals';

describe('APM Module', () => {
  it('should handle APM initialization', async () => {
    // Mock the elastic-apm-node module
    const mockApm = {
      start: jest.fn().mockReturnValue({}),
      captureError: jest.fn(),
      captureException: jest.fn(),
      setCustomContext: jest.fn(),
      setUserContext: jest.fn()
    };

    jest.unstable_mockModule('elastic-apm-node', () => mockApm);

    // Import the apm module
    const apmModule = await import('../apm.js');
    
    // The module should be imported successfully
    expect(apmModule).toBeDefined();
  });

  it('should handle APM when not in production', async () => {
    // Save original NODE_ENV
    const originalEnv = process.env.NODE_ENV;
    
    // Set to development
    process.env.NODE_ENV = 'development';

    const mockApm = {
      start: jest.fn().mockReturnValue({}),
      captureError: jest.fn(),
      captureException: jest.fn(),
      setCustomContext: jest.fn(),
      setUserContext: jest.fn()
    };

    jest.unstable_mockModule('elastic-apm-node', () => mockApm);

    // Import the apm module
    const apmModule = await import('../apm.js');
    
    expect(apmModule).toBeDefined();

    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });
});