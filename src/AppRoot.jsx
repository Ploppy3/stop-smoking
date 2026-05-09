import { useEffect, useState } from "react";
import { IntlProvider } from "react-intl";
import App from "./App";
import { messages } from "./i18n";
import { loadState, STORAGE_KEY, DEFAULT_SETTINGS } from "./storage";

export default function AppRoot() {
  const initial = loadState();
  const [lang, setLang] = useState(initial?.settings?.language || DEFAULT_SETTINGS.language);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      const s = loadState();
      if (s?.settings?.language) setLang(s.settings.language);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <IntlProvider locale={lang} messages={messages[lang] || messages.en} defaultLocale="en">
      <App onLanguageChange={setLang} />
    </IntlProvider>
  );
}
