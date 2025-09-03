import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface InteractionContextState {
  screen: string;
  action: string;
  data: Record<string, any>;
}

interface UserInteractionContextType {
  context: InteractionContextState;
  setContext: (context: Partial<InteractionContextState>) => void;
}

const UserInteractionContext = createContext<UserInteractionContextType | undefined>(undefined);

export const UserInteractionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [context, setContextState] = useState<InteractionContextState>({
    screen: 'Dashboard',
    action: 'N/A',
    data: {},
  });

  const setContext = (newContext: Partial<InteractionContextState>) => {
    setContextState(prevContext => ({ ...prevContext, ...newContext }));
  };

  return (
    <UserInteractionContext.Provider value={{ context, setContext }}>
      {children}
    </UserInteractionContext.Provider>
  );
};

export const useUserInteraction = (): UserInteractionContextType => {
  const context = useContext(UserInteractionContext);
  if (!context) {
    throw new Error('useUserInteraction must be used within a UserInteractionProvider');
  }
  return context;
};
