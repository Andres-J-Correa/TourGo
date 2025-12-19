import { useState, useEffect } from "react";

export const useIsMobile = () => {
  // 768px is a standard breakpoint for tablets/mobiles
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    // Handler to update state when match changes
    const handleResize = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Add listener
    mediaQuery.addEventListener("change", handleResize);

    // Clean up
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  return isMobile;
};
