import { jest } from '@jest/globals';
// Mock the secureStorage module

export const setSecureItem = jest.fn();
export const removeSecureItem = jest.fn();
export const clearSecureStorage = jest.fn();
export const getSecureItem = jest.fn();