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

_logger(HUB_CONFIG);

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
  const [connections, setConnections] = useState(initialConnections);

  useEffect(() => {
    const newConnections = { ...initialConnections };
    const connectionPromises: Promise<void>[] = [];

    (Object.keys(HUB_CONFIG) as HubKey[]).forEach((key) => {
      const url = HUB_CONFIG[key];

      // Build the connection
      const connection = new signalR.HubConnectionBuilder()
        .withUrl(url, {
          withCredentials: true,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      newConnections[key] = connection;

      // Start the connection
      const startPromise = connection
        .start()
        .then(() => _logger(`Connected to ${key} hub`))
        .catch((err: any) => _logger(`Failed to connect to ${key} hub`, err));

      connectionPromises.push(startPromise);
    });

    // Update state once connections are created (even if they haven't finished connecting yet)
    setConnections(newConnections);

    // Cleanup: Stop all connections when the Provider unmounts
    return () => {
      Object.values(newConnections).forEach((conn) => {
        if (conn) conn.stop();
      });
    };
  }, []);

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
