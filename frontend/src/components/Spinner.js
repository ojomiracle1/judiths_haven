import React from 'react';

const Spinner = () => {
  return (
    <div className="flex justify-center items-center min-h-[40vh] sm:min-h-screen w-full">
      <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default Spinner;