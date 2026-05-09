import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { DEFAULT_SETTINGS } from "../storage";

const inputCls =
  "px-3.5 py-3 border border-neutral-200 rounded-lg text-base bg-white focus:outline-2 focus:outline-orange focus:-outline-offset-1";

export default function Onboarding({ onFinish, onLanguageChange }) {
  const [form, setForm] = useState({ ...DEFAULT_SETTINGS });
  const [step, setStep] = useState(0);

  const update = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (k === "language") onLanguageChange(v);
  };

  const finish = () => {
    onFinish({
      initialInterval: Math.max(1, parseInt(form.initialInterval) || 60),
      dailyIncrease: Math.max(0, parseInt(form.dailyIncrease) || 5),
      cigarettesPerPack: Math.max(1, parseInt(form.cigarettesPerPack) || 20),
      packCost: Math.max(0, parseFloat(form.packCost) || 10),
      initialCigarettesPerDay: Math.max(1, parseInt(form.initialCigarettesPerDay) || 20),
      language: form.language,
    });
  };

  const steps = [
    {
      labelId: "onb_step1",
      input: (
        <input type="number" min="1" className={inputCls}
          value={form.initialInterval}
          onChange={(e) => update("initialInterval", e.target.value)} />
      ),
    },
    {
      labelId: "onb_step2",
      input: (
        <input type="number" min="0" className={inputCls}
          value={form.dailyIncrease}
          onChange={(e) => update("dailyIncrease", e.target.value)} />
      ),
    },
    {
      labelId: "onb_step3a",
      input: (
        <>
          <input type="number" min="1" className={inputCls}
            value={form.cigarettesPerPack}
            onChange={(e) => update("cigarettesPerPack", e.target.value)} />
          <label className="flex flex-col gap-1.5 mt-3">
            <span className="text-sm text-neutral-500"><FormattedMessage id="onb_step3b" /></span>
            <input type="number" min="0" step="0.01" className={inputCls}
              value={form.packCost}
              onChange={(e) => update("packCost", e.target.value)} />
          </label>
        </>
      ),
    },
    {
      labelId: "onb_step4",
      input: (
        <input type="number" min="1" className={inputCls}
          value={form.initialCigarettesPerDay}
          onChange={(e) => update("initialCigarettesPerDay", e.target.value)} />
      ),
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="max-w-md mx-auto px-5 pt-10 pb-10 flex flex-col gap-6">
      <h1 className="text-center text-3xl font-bold m-0">
        <FormattedMessage id="onb_title" />
      </h1>
      <div className="text-center text-sm text-neutral-500">
        <FormattedMessage id="onb_progress" values={{ step: step + 1, total: steps.length }} />
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-neutral-500"><FormattedMessage id={current.labelId} /></span>
        {current.input}
      </label>

      <div className="flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-3 bg-white border border-neutral-200 rounded-lg text-base"
          >
            <FormattedMessage id="onb_back" />
          </button>
        )}
        {!isLast ? (
          <button
            onClick={() => setStep(step + 1)}
            className="flex-1 bg-orange hover:bg-orange-dark text-white font-semibold rounded-xl py-3.5"
          >
            <FormattedMessage id="onb_next" />
          </button>
        ) : (
          <button
            onClick={finish}
            className="flex-1 bg-orange hover:bg-orange-dark text-white font-semibold rounded-xl py-3.5"
          >
            <FormattedMessage id="onb_finish" />
          </button>
        )}
      </div>

      <button
        onClick={finish}
        className="text-neutral-500 underline text-sm bg-transparent border-0 self-center"
      >
        <FormattedMessage id="onb_skip" />
      </button>

      <div className="flex gap-2 justify-center">
        {["en", "fr"].map((code) => (
          <button
            key={code}
            onClick={() => update("language", code)}
            className={
              "rounded-full px-3.5 py-1.5 text-xs border " +
              (form.language === code
                ? "bg-orange border-orange text-white"
                : "bg-white border-neutral-200 text-neutral-700")
            }
          >
            {code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
