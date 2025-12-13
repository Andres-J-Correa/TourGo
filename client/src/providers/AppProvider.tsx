import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { AppContextProvider } from "../contexts/GlobalAppContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { SignalRProvider } from "contexts/SignalRContext";
import i18n from "../locales/i18n";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter basename="/app">
      <LanguageProvider>
        <GoogleReCaptchaProvider
          reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY ?? ""}
          language={i18n.language}>
          <AppContextProvider>
            <SignalRProvider>{children}</SignalRProvider>
          </AppContextProvider>
        </GoogleReCaptchaProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
