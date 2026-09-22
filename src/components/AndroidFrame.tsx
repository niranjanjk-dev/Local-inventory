import React from 'react';

interface AndroidFrameProps {
  children: React.ReactNode;
}

/**
 * AppShell provides a clean, responsive layout container for the app,
 * seamlessly uniting the main screen and docked bottom navigation.
 * All fake phone hardware bezels, punch-hole cameras, and fake status bars are removed.
 */
export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-100 flex justify-center w-full">
      <div className="w-full max-w-lg min-h-screen bg-white sm:border-x sm:border-zinc-200/90 shadow-sm flex flex-col relative">
        {children}
      </div>
    </div>
  );
};
