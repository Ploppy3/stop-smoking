import { useState } from "react";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";
import { dayKey, daysElapsed } from "../logic";

const fieldCls = "flex flex-col gap-1.5";
const labelCls = "text-sm text-neutral-500";
const inputCls =
  "px-3.5 py-3 border border-neutral-200 rounded-lg text-base bg-white focus:outline-2 focus:outline-orange focus:-outline-offset-1";

export default function Settings({ state, onSave, onReset, onIgnoredDaysChange }) {
  const intl = useIntl();
  const days = daysElapsed(state.planStartTimestamp);
  const computedCurrent =
    state.settings.initialInterval + days * state.settings.dailyIncrease;
  const [form, setForm] = useState({ ...state.settings, currentInterval: computedCurrent });
  const [savedFlag, setSavedFlag] = useState(false);
  const [newIgnoredDate, setNewIgnoredDate] = useState("");

  const ignoredDays = state.ignoredDays ?? [];
  const todayKey = dayKey(Date.now());
  const planStartKey = state.planStartTimestamp ? dayKey(state.planStartTimestamp) : null;

  const addIgnoredDay = () => {
    if (!newIgnoredDate) return;
    if (ignoredDays.includes(newIgnoredDate)) return;
    if (newIgnoredDate >= todayKey) return;
    if (planStartKey && newIgnoredDate < planStartKey) return;
    const next = [...ignoredDays, newIgnoredDate].sort().reverse();
    onIgnoredDaysChange(next);
    setNewIgnoredDate("");
  };

  const removeIgnoredDay = (k) => {
    onIgnoredDaysChange(ignoredDays.filter((d) => d !== k));
  };

  const update = (k, v) => setForm({ ...form, [k]: v });

  const submit = (e) => {
    e.preventDefault();
    const dailyIncrease = Math.max(0, parseInt(form.dailyIncrease) || 0);
    const newCurrent = Math.max(1, parseInt(form.currentInterval) || 1);
    const initialInterval = Math.max(1, newCurrent - days * dailyIncrease);
    onSave({
      initialInterval,
      dailyIncrease,
      cigarettesPerPack: Math.max(1, parseInt(form.cigarettesPerPack) || 1),
      packCost: Math.max(0, parseFloat(form.packCost) || 0),
      initialCigarettesPerDay: Math.max(1, parseInt(form.initialCigarettesPerDay) || 1),
      language: form.language,
    });
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 1500);
  };

  const reset = () => {
    if (confirm(intl.formatMessage({ id: "settings_resetConfirm" }))) onReset();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <label className={fieldCls}>
        <span className={labelCls}><FormattedMessage id="settings_currentInterval" /></span>
        <input type="number" min="1" step="1" className={inputCls}
          value={form.currentInterval}
          onChange={(e) => update("currentInterval", e.target.value)} />
      </label>
      <label className={fieldCls}>
        <span className={labelCls}><FormattedMessage id="settings_dailyIncrease" /></span>
        <input type="number" min="0" step="1" className={inputCls}
          value={form.dailyIncrease}
          onChange={(e) => update("dailyIncrease", e.target.value)} />
      </label>
      <label className={fieldCls}>
        <span className={labelCls}><FormattedMessage id="settings_cigarettesPerPack" /></span>
        <input type="number" min="1" step="1" className={inputCls}
          value={form.cigarettesPerPack}
          onChange={(e) => update("cigarettesPerPack", e.target.value)} />
      </label>
      <label className={fieldCls}>
        <span className={labelCls}><FormattedMessage id="settings_packCost" /></span>
        <input type="number" min="0" step="0.01" className={inputCls}
          value={form.packCost}
          onChange={(e) => update("packCost", e.target.value)} />
      </label>
      <label className={fieldCls}>
        <span className={labelCls}><FormattedMessage id="settings_initialCigarettesPerDay" /></span>
        <input type="number" min="1" step="1" className={inputCls}
          value={form.initialCigarettesPerDay}
          onChange={(e) => update("initialCigarettesPerDay", e.target.value)} />
      </label>
      <label className={fieldCls}>
        <span className={labelCls}><FormattedMessage id="settings_language" /></span>
        <select className={inputCls}
          value={form.language}
          onChange={(e) => update("language", e.target.value)}>
          <option value="en">{intl.formatMessage({ id: "lang_en" })}</option>
          <option value="fr">{intl.formatMessage({ id: "lang_fr" })}</option>
        </select>
      </label>

      <div className="flex flex-col gap-2 pt-1">
        <span className={labelCls}>
          <FormattedMessage id="settings_ignoredDays" />
        </span>
        <div className="flex gap-2">
          <input
            type="date"
            className={inputCls + " flex-1"}
            value={newIgnoredDate}
            max={todayKey}
            min={planStartKey ?? undefined}
            onChange={(e) => setNewIgnoredDate(e.target.value)}
          />
          <button
            type="button"
            onClick={addIgnoredDay}
            disabled={!newIgnoredDate}
            className="px-4 rounded-lg bg-orange text-white text-sm font-semibold disabled:opacity-40"
          >
            <FormattedMessage id="settings_ignoredDays_add" />
          </button>
        </div>
        {ignoredDays.length === 0 ? (
          <p className="text-xs text-neutral-400">
            <FormattedMessage id="settings_ignoredDays_empty" />
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {ignoredDays.map((k) => {
              const [y, m, d] = k.split("-").map(Number);
              const date = new Date(y, m - 1, d);
              return (
                <li
                  key={k}
                  className="flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 text-sm"
                >
                  <FormattedDate value={date} year="numeric" month="short" day="2-digit" weekday="short" />
                  <button
                    type="button"
                    onClick={() => removeIgnoredDay(k)}
                    className="text-red-600 text-xs"
                  >
                    <FormattedMessage id="settings_ignoredDays_remove" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-xs text-neutral-400">
          <FormattedMessage id="settings_ignoredDays_help" />
        </p>
      </div>

      <button
        type="submit"
        className="w-full bg-orange hover:bg-orange-dark active:scale-[0.98] transition text-white font-semibold rounded-xl py-4 text-base"
      >
        <FormattedMessage id={savedFlag ? "settings_saved" : "settings_save"} />
      </button>

      <button
        type="button"
        onClick={reset}
        className="w-full bg-white text-red-600 border border-red-600 rounded-xl py-3.5 text-base"
      >
        <FormattedMessage id="settings_reset" />
      </button>

      <p className="text-sm text-neutral-500 text-center mt-8">
        <FormattedMessage id="settings_version" /> 1.0.0
      </p>
    </form>
  );
}
