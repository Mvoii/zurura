import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Import these using the unstable_mockModule API which works with ES modules
await jest.unstable_mockModule('../client', () => ({
  apiClient: {
    post: jest.fn(),
    getToken: jest.fn()
  }
}));

await jest.unstable_mockModule('../../utils/secureStorage', () => ({
  setSecureItem: jest.fn(),
  removeSecureItem: jest.fn(),
  clearSecureStorage: jest.fn(),
  getSecureItem: jest.fn()
}));

// Import actual modules AFTER mocking them
const { loginUser, registerUser, registerOperator, logoutUser, isAuthenticated } = await import('../authService');
const { apiClient } = await import('../client');
const { setSecureItem, removeSecureItem } = await import('../../utils/secureStorage');

describe('Auth Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should login successfully and store token and user data', async () => {
      // Mock successful API response
      const mockResponse = { token: 'test-token', user: { id: '123', email: 'test@example.com', role: 'commuter' } };
      apiClient.post.mockResolvedValue(mockResponse);

      // Call the function with test credentials
      const credentials = { email: 'test@example.com', password: 'password123' };
      const result = await loginUser(credentials);

      // Verify API was called correctly
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      
      // Verify token and user data were stored
      expect(setSecureItem).toHaveBeenCalledWith('auth-token', 'test-token');
      expect(setSecureItem).toHaveBeenCalledWith('user', mockResponse.user);
      
      // Verify the function returns the expected result
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error when login fails', async () => {
      // Mock API error response
      apiClient.post.mockResolvedValue({ error: true, message: 'Invalid credentials' });

      // Call the function with test credentials
      const credentials = { email: 'test@example.com', password: 'wrong-password' };
      
      // Verify function throws expected error
      await expect(loginUser(credentials)).rejects.toThrow('Invalid credentials');
      
      // Verify secure storage was NOT updated
      expect(setSecureItem).not.toHaveBeenCalled();
    });

    it('should handle network errors during login', async () => {
      // Mock network error
      const networkError = new Error('Network error');
      apiClient.post.mockRejectedValue(networkError);

      // Call the function
      const credentials = { email: 'test@example.com', password: 'password123' };
      
      // Verify function throws the network error
      await expect(loginUser(credentials)).rejects.toThrow('Network error');
    });
  });

  describe('registerUser', () => {
    it('should register a new commuter successfully', async () => {
      // Mock successful API response
      const mockResponse = { token: 'new-token', user: { id: '456', email: 'new@example.com', role: 'commuter' } };
      apiClient.post.mockResolvedValue(mockResponse);

      // Call the function with test user data
      const userData = { 
        email: 'new@example.com', 
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe'
      };
      const result = await registerUser(userData);

      // Verify API was called correctly
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', userData);
      
      // Verify token and user data were stored
      expect(setSecureItem).toHaveBeenCalledWith('auth-token', 'new-token');
      expect(setSecureItem).toHaveBeenCalledWith('user', mockResponse.user);
      
      // Verify the function returns the expected result
      expect(result).toEqual(mockResponse);
    });

    // Add similar tests for registerUser failure cases
  });

  describe('registerOperator', () => {
    it('should register a new operator successfully', async () => {
      // Mock successful API response
      const mockResponse = { token: 'op-token', user: { id: '789', email: 'operator@example.com', role: 'operator' } };
      apiClient.post.mockResolvedValue(mockResponse);

      // Call the function with test operator data
      const operatorData = { 
        email: 'operator@example.com', 
        password: 'password123',
        company_name: 'ABC Transport',
        business_license: 'LIC-12345'
      };
      const result = await registerOperator(operatorData);

      // Verify API was called correctly
      expect(apiClient.post).toHaveBeenCalledWith('/auth/register/op', operatorData);
      
      // Verify token and user data were stored
      expect(setSecureItem).toHaveBeenCalledWith('auth-token', 'op-token');
      expect(setSecureItem).toHaveBeenCalledWith('user', mockResponse.user);
      
      // Verify the function returns the expected result
      expect(result).toEqual(mockResponse);
    });

    // Add similar tests for registerOperator failure cases
  });

  describe('logoutUser', () => {
    it('should logout successfully and clear storage', async () => {
      // Mock successful API response
      const mockResponse = { message: 'Logged out successfully' };
      apiClient.post.mockResolvedValue(mockResponse);

      // Call the function
      const result = await logoutUser();

      // Verify API was called correctly
      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
      
      // Verify secure storage was cleared
      expect(removeSecureItem).toHaveBeenCalledWith('auth-token');
      expect(removeSecureItem).toHaveBeenCalledWith('user');
      
      // Verify the function returns the expected result
      expect(result).toEqual(mockResponse);
    });

    it('should clear storage even when API call fails', async () => {
      // Mock API error
      const apiError = new Error('API server error');
      apiClient.post.mockRejectedValue(apiError);

      // Call the function and expect it to throw
      await expect(logoutUser()).rejects.toThrow('API server error');
      
      // Verify secure storage was still cleared despite the error
      expect(removeSecureItem).toHaveBeenCalledWith('auth-token');
      expect(removeSecureItem).toHaveBeenCalledWith('user');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when valid token exists', () => {
      // Mock token retrieval
      apiClient.getToken.mockReturnValue('valid-token');
      
      // Check authentication status
      expect(isAuthenticated()).toBe(true);
    });

    it('should return false when no token exists', () => {
      // Mock token retrieval returning null
      apiClient.getToken.mockReturnValue(null);
      
      // Check authentication status
      expect(isAuthenticated()).toBe(false);
    });
  });
});