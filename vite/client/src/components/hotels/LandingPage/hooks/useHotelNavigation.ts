import { useSearchParams } from "react-router-dom";
import { useMemo, useCallback } from "react";

const VALID_VIEWS = ["arrivals", "departures", "stays", "rooms", "tasks"];
const DEFAULT_VIEW = "arrivals";

export const useHotelNavigation = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = useMemo(() => {
    const view = searchParams.get("view");
    return view && VALID_VIEWS.includes(view) ? view : DEFAULT_VIEW;
  }, [searchParams]);

  const setActiveTab = useCallback(
    (tab: string) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("view", tab);
        return newParams;
      });
    },
    [setSearchParams]
  );

  return { activeTab, setActiveTab };
};
