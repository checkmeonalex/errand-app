import React, { createContext, useContext, useEffect, useState } from 'react';
import type { UserMode, UserRole } from '@errand/types';
import { loadJSON, saveJSON, STORAGE_KEYS } from '../storage/storage';

type ModeContextValue = {
  activeMode: UserMode;
  roles: UserRole[];
  switchMode: (mode: UserMode) => void;
  hasRunnerAccess: boolean;
  // True until the saved mode has been read on launch.
  isRestoring: boolean;
  // DEV ONLY: skip the waitlist and become a runner on this device.
  devGrantRunnerAccess: () => Promise<void>;
};

const ModeContext = createContext<ModeContextValue | undefined>(undefined);

// TODO: replace this mock with the real profile fetched after login.
// `roles` reflects what the backend returns for Profile.roles —
// 'runner' only appears once the Taskly team adds someone as a runner (the
// first 15 by hand, then people from the waitlist).
const MOCK_ROLES: UserRole[] = ['poster'];

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [activeMode, setActiveMode] = useState<UserMode>('poster');
  const [roles, setRoles] = useState<UserRole[]>(MOCK_ROLES);
  const [isRestoring, setIsRestoring] = useState(true);

  // DEV: remember a skipped waitlist across reloads.
  useEffect(() => {
    if (!__DEV__) return;
    loadJSON<boolean>(STORAGE_KEYS.devRunnerAccess).then((granted) => {
      if (granted) setRoles([...MOCK_ROLES, 'runner']);
    });
  }, []);

  async function devGrantRunnerAccess() {
    if (!__DEV__) return;
    setRoles([...MOCK_ROLES, 'runner']);
    await saveJSON(STORAGE_KEYS.devRunnerAccess, true);
  }

  // Reopen in the mode the user left, but only if they still have access to it.
  useEffect(() => {
    loadJSON<UserMode>(STORAGE_KEYS.activeMode).then((saved) => {
      if (saved && roles.includes(saved)) setActiveMode(saved);
      setIsRestoring(false);
    });
  }, [roles]);

  function switchMode(mode: UserMode) {
    if (mode === 'runner' && !roles.includes('runner')) {
      // Not verified as a runner yet — caller should route to runner
      // verification instead of switching. Left as a no-op here so this
      // context stays dumb; the UI decides what to show for this case.
      return;
    }
    setActiveMode(mode);
    saveJSON(STORAGE_KEYS.activeMode, mode);
    // TODO: also save active_mode to the profile via @errand/api so it's
    // remembered across devices.
  }

  return (
    <ModeContext.Provider
      value={{
        activeMode,
        roles,
        switchMode,
        hasRunnerAccess: roles.includes('runner'),
        isRestoring,
        devGrantRunnerAccess,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
