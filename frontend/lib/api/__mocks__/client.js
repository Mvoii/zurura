import { jest } from '@jest/globals';
// Mock the apiClient module

export const apiClient = {
  post: jest.fn(),
  getToken: jest.fn()
};