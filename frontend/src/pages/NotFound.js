import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-green-50 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-pink-600 drop-shadow mb-2">404</h1>
          <h2 className="mt-4 text-3xl font-bold text-primary-700">Page Not Found</h2>
          <p className="mt-2 text-base text-gray-500">The page you're looking for doesn't exist or has been moved.</p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 btn-gradient font-semibold rounded-xl shadow-lg hover:scale-[1.03] transition-all duration-200"
            >
              Go back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;