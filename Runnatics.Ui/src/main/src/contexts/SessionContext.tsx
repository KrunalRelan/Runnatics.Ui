import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";

import { AppPermission } from "../models/AppPermission";
import { User } from "../models/User";
import { SessionService } from "../services/SessionService";

export interface SessionContextType {
  user?: User;
  dateFormat: string;
  timeFormat: string;
  userHasPermission: ([permission]: Array<AppPermission>) => boolean;
  isSuperAdmin?: boolean;
  isAdmin?: boolean;
}

export const defaultSessionContext: SessionContextType = {
  user: undefined,
  dateFormat: "MM/DD/YYYY",
  timeFormat: "hh:mm A",
  userHasPermission: () => false,
  isSuperAdmin: false,
  isAdmin: false,
};

export const SessionContext = createContext<SessionContextType>(
  defaultSessionContext
);

interface SessionContextProviderProps {
  children: ReactNode;
}

export const SessionContextProvider = ({
  children,
}: SessionContextProviderProps) => {
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [timeFormat, setTimeFormat] = useState("hh:mm A");

  const { data, error, isFetching } = useQuery({
    queryKey: [SessionService.getAppContext.name],

    queryFn: SessionService.getAppContext,
  });

  useEffect(() => {
    if (error) {
      console.error("Error fetching session data:", error);
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      if (data.dateFormat) {
        setDateFormat(data.dateFormat);
      }
      if (data.timeFormat) {
        setTimeFormat(data.timeFormat);
      }
    }
  }, [data?.dateFormat, data?.timeFormat]);

  const userHasPermission = useCallback(
    (allowedPermissions: Array<AppPermission>): boolean =>
      !!data?.permissions?.find((role) => allowedPermissions.includes(role)),
    [data?.permissions]
  );

  const isAdmin = useMemo(() => {
    return !!data?.permissions?.find((role) => role === AppPermission.Admin);
  }, [data?.permissions]);

  const isSuperAdmin = useMemo(() => {
    return !!data?.permissions?.find(
      (role) => role === AppPermission.SuperAdmin
    );
  }, [data?.permissions]);

  if (isFetching) {
    return <div>Loading...</div>;
  }
  const contextValue: SessionContextType = {
    user: data?.user,
    dateFormat,
    timeFormat,
    userHasPermission,
    isSuperAdmin: isSuperAdmin,
    isAdmin: isAdmin,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};
