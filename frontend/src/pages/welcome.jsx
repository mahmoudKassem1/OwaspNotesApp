import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <nav className="w-full max-w-5xl mx-auto flex justify-between items-center p-4">
        <div className="text-2xl font-bold text-[#1E293B]">OwaspNotesApp</div>
        <div>
          <Link
            to="/login"
            className="text-[#64748B] hover:text-[#1E293B] mr-4"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-[#4F46E5] text-white px-4 py-2 rounded-md font-bold hover:bg-[#4338CA]"
          >
            Get Started
          </Link>
        </div>
      </nav>
      <div className="flex-grow flex items-center justify-center text-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#1E293B] mb-4 leading-tight">
            Capture your thoughts instantly.
          </h1>
          <p className="text-lg md:text-xl text-[#64748B] mb-8 leading-relaxed">
            Your secure and private space for managing notes. Keep your thoughts organized,
            private, or share them with the world.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-lg text-white bg-[#4F46E5] hover:bg-[#4338CA] transition duration-300 ease-in-out shadow-lg"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-lg text-[#1E293B] bg-white hover:bg-gray-100 transition duration-300 ease-in-out shadow-lg"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
