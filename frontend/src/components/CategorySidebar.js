import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const CategorySidebar = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  return (
    <aside className="w-full sm:w-64 bg-white shadow rounded-2xl p-6 mb-6 max-w-full sm:max-w-xs mx-auto sm:mx-0 border border-pink-100">
      <h2 className="text-lg font-bold mb-4 text-pink-600">Categories</h2>
      <ul className="space-y-2">
        {categories.map(cat => (
          <li key={cat._id}>
            <Link to={`/category/${cat._id}`} className="text-blue-700 hover:underline text-base font-semibold">
              {cat.name}
            </Link>
            {cat.subcategories && cat.subcategories.length > 0 && (
              <ul className="ml-4 mt-1 space-y-1">
                {cat.subcategories.map(sub => (
                  <li key={sub._id}>
                    <Link to={`/category/${sub._id}`} className="text-blue-500 hover:underline text-sm">
                      {sub.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default CategorySidebar;
