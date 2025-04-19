import React from 'react';
import useAuth from '../../hooks/useAuth';

export const LoginStatus: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  
  return (
    <div className="p-4 bg-white shadow rounded">
      <h3 className="text-lg font-semibold">Authentication Status</h3>
      {isAuthenticated ? (
        <div>
          <p className="text-green-600">Authenticated as: {user?.first_name} {user?.last_name}</p>
          <p>Role: {user?.role || 'commuter'}</p>
          <button 
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded" 
            onClick={() => logout()}
          >
            Logout
          </button>
        </div>
      ) : (
        <p className="text-red-600">Not authenticated</p>
      )}
    </div>
  );
};