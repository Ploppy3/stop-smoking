import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { loadState, saveState, emptyState, STORAGE_KEY } from "./storage";
import { currentInterval, sortLogsDesc } from "./logic";
import Main from "./components/Main";
import LogScreen from "./components/LogScreen";
import Settings from "./components/Settings";
import Onboarding from "./components/Onboarding";

export default function App({ onLanguageChange }) {
  const [state, setState] = useState(() => loadState());
  const [screen, setScreen] = useState("main");

  useEffect(() => {
    const handler = (e) => {
      if (e.key === STORAGE_KEY) setState(loadState());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const persist = (next) => {
    setState(next);
    saveState(next);
    if (next?.settings?.language) onLanguageChange(next.settings.language);
  };

  if (!state) {
    return (
      <Onboarding
        onLanguageChange={onLanguageChange}
        onFinish={(settings) => persist(emptyState(settings))}
      />
    );
  }

  const logCigarette = () => {
    const now = new Date();
    const planStart = state.planStartTimestamp ?? now.toISOString();
    const intervalUsed = currentInterval(state.settings, planStart, now.getTime());
    const newLog = { timestamp: now.toISOString(), intervalUsed };
    const logs = sortLogsDesc([newLog, ...state.logs]);
    persist({ ...state, logs, planStartTimestamp: planStart });
  };

  const editLog = (idx, newTimestampIso) => {
    const logs = [...state.logs];
    logs[idx] = { ...logs[idx], timestamp: newTimestampIso };
    persist({ ...state, logs: sortLogsDesc(logs) });
  };

  const deleteLog = (idx) => {
    const logs = state.logs.filter((_, i) => i !== idx);
    const planStartTimestamp = logs.length === 0 ? null : state.planStartTimestamp;
    persist({ ...state, logs, planStartTimestamp });
  };

  const saveSettings = (settings) => persist({ ...state, settings });
  const resetPlan = () => persist({ ...state, logs: [], planStartTimestamp: null });

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto">
      <main className="flex-1 px-5 pt-6 pb-24">
        {screen === "main" && <Main state={state} onLog={logCigarette} />}
        {screen === "log" && <LogScreen state={state} onEdit={editLog} onDelete={deleteLog} />}
        {screen === "settings" && (
          <Settings state={state} onSave={saveSettings} onReset={resetPlan} />
        )}
      </main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-neutral-200 flex pb-[env(safe-area-inset-bottom)]">
        <TabButton id="main" icon="⏱" msgId="nav_main" active={screen === "main"} onClick={setScreen} />
        <TabButton id="log" icon="📋" msgId="nav_log" active={screen === "log"} onClick={setScreen} />
        <TabButton id="settings" icon="⚙" msgId="nav_settings" active={screen === "settings"} onClick={setScreen} />
      </nav>
    </div>
  );
}

function TabButton({ id, icon, msgId, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={
        "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 pb-3 bg-transparent border-0 text-xs " +
        (active ? "text-orange" : "text-neutral-500")
      }
    >
      <span className="text-xl leading-none">{icon}</span>
      <FormattedMessage id={msgId} />
    </button>
  );
}
