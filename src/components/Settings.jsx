import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { daysElapsed } from "../logic";

const fieldCls = "flex flex-col gap-1.5";
const labelCls = "text-sm text-neutral-500";
const inputCls =
  "px-3.5 py-3 border border-neutral-200 rounded-lg text-base bg-white focus:outline-2 focus:outline-orange focus:-outline-offset-1";

export default function Settings({ state, onSave, onReset }) {
  const intl = useIntl();
  const days = daysElapsed(state.planStartTimestamp);
  const computedCurrent =
    state.settings.initialInterval + days * state.settings.dailyIncrease;
  const [form, setForm] = useState({ ...state.settings, currentInterval: computedCurrent });
  const [savedFlag, setSavedFlag] = useState(false);

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
    </form>
  );
}
