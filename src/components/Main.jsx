import { useEffect, useState } from "react";
import { FormattedMessage, FormattedNumber, useIntl } from "react-intl";
import { currentInterval, nextAllowedTime, computeSavings, formatHMS } from "../logic";

export default function Main({ state, onLog }) {
  const { settings, logs, planStartTimestamp } = state;
  const intl = useIntl();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const next = nextAllowedTime(logs);
  const remaining = next ? next - now : null;
  const canSmoke = next !== null && remaining <= 0;
  const interval = currentInterval(settings, planStartTimestamp, now);
  const savings = computeSavings(settings, logs, planStartTimestamp, now);

  const monthlyFormatted = savings
    ? intl.formatNumber(savings.monthlyEstimate, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center py-8">
        {next === null ? (
          <>
            <div className="text-6xl font-bold tracking-tight tabular-nums">--:--:--</div>
            <div className="mt-2 text-sm text-neutral-500">
              <FormattedMessage id="waitFirst" />
            </div>
          </>
        ) : canSmoke ? (
          <div className="text-4xl font-bold text-orange animate-pulse-soft">
            <FormattedMessage id="canSmokeNow" />
          </div>
        ) : (
          <>
            <div className="text-6xl font-bold tracking-tight tabular-nums">
              {formatHMS(remaining)}
            </div>
            <div className="mt-2 text-sm text-neutral-500">{interval} min</div>
          </>
        )}
      </div>

      <button
        onClick={onLog}
        className="w-full bg-orange hover:bg-orange-dark active:scale-[0.98] transition text-white font-semibold rounded-2xl py-5 text-xl"
      >
        <FormattedMessage id="iSmoked" />
      </button>

      {savings && (
        <div className="text-center bg-orange-soft border border-orange-soft-border rounded-2xl p-5">
          <div className="text-xs uppercase tracking-wide text-neutral-500">
            <FormattedMessage id="savedThisWeek" />
          </div>
          <div className="text-4xl font-bold text-orange mt-1">
            <FormattedNumber
              value={savings.weeklySaved}
              minimumFractionDigits={2}
              maximumFractionDigits={2}
            />
          </div>
          <div className="mt-1 text-sm text-neutral-500">
            <FormattedMessage id="perMonth" values={{ amount: monthlyFormatted }} />
          </div>
          {savings.daysUsed < 7 && (
            <div className="mt-1 text-xs text-neutral-400">
              <FormattedMessage id="savings_basedOn" values={{ n: savings.daysUsed }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
