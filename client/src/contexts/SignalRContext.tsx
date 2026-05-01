import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  type ReactNode,
} from "react";
import * as signalR from "@microsoft/signalr";

const _logger = require("debug")("SignalRContext");

const baseUrl = import.meta.env.VITE_HUBS_HOST_PREFIX;
const HUB_CONFIG = {
  taskReminders: `${baseUrl}/task-reminders`,
};

export type HubKey = keyof typeof HUB_CONFIG;

interface SignalRContextType {
  getConnection: (key: HubKey) => signalR.HubConnection | null;
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

interface SignalRProviderProps {
  children: ReactNode;
}

const initialConnections: Record<HubKey, signalR.HubConnection | null> = {
  taskReminders: null,
};

export const SignalRProvider: React.FC<SignalRProviderProps> = ({
  children,
}) => {
  // Store connections in a Record keyed by the hub name
  const [connections] = useState<Record<HubKey, signalR.HubConnection | null>>(
    () => {
      const conns = { ...initialConnections };

      (Object.keys(HUB_CONFIG) as HubKey[]).forEach((key) => {
        const connection = new signalR.HubConnectionBuilder()
          .withUrl(HUB_CONFIG[key], { withCredentials: true })
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Information)
          .build();

        conns[key] = connection;
      });

      return conns;
    },
  );

  useEffect(() => {
    const connectionPromises: Promise<void>[] = [];

    Object.entries(connections).forEach(([key, conn]) => {
      if (!conn) return;

      const startPromise = conn
        .start()
        .then(() => _logger(`Connected to ${key} hub`))
        .catch((err) => _logger(`Failed to connect to ${key} hub`, err));

      connectionPromises.push(startPromise);
    });

    return () => {
      Object.values(connections).forEach((conn) => {
        if (conn) conn.stop();
      });
    };
  }, [connections]);

  const getConnection = (key: HubKey) => {
    return connections[key];
  };

  return (
    <SignalRContext.Provider value={{ getConnection }}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = (hubKey: HubKey) => {
  const context = useContext(SignalRContext);

  if (!context) {
    throw new Error("useSignalR must be used within a SignalRProvider");
  }

  const connection = context.getConnection(hubKey);
  return { connection };
};
