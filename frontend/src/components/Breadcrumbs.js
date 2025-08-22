import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4 px-2 sm:px-0 w-full overflow-x-auto" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex whitespace-nowrap">
        <li>
          <Link to="/" className="text-blue-600 hover:underline px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-pink-500">Home</Link>
        </li>
        {pathnames.map((value, idx) => {
          const to = `/${pathnames.slice(0, idx + 1).join('/')}`;
          const isLast = idx === pathnames.length - 1;
          return (
            <li key={to} className="flex items-center">
              <span className="mx-1">/</span>
              {isLast ? (
                <span className="font-semibold text-gray-800 px-1 py-0.5">{decodeURIComponent(value)}</span>
              ) : (
                <Link to={to} className="text-blue-600 hover:underline px-1 py-0.5 rounded focus:outline-none focus:ring-2 focus:ring-pink-500">
                  {decodeURIComponent(value)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
