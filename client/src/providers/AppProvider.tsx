import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppContextProvider } from "../contexts/GlobalAppContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { SignalRProvider } from "contexts/SignalRContext";
import { HelmetProvider } from "react-helmet-async";

import i18n from "../locales/i18n";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    // <BrowserRouter basename="/app">

    <GoogleReCaptchaProvider
      reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? ""}
      language={i18n.language}>
      <LanguageProvider>
        <AppContextProvider>
          <SignalRProvider>
            <HelmetProvider>{children}</HelmetProvider>
          </SignalRProvider>
        </AppContextProvider>
      </LanguageProvider>
    </GoogleReCaptchaProvider>
    // </BrowserRouter>
  );
}
