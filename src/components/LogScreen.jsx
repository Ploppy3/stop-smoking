import { useState } from "react";
import { FormattedMessage, FormattedDate, FormattedTime, useIntl } from "react-intl";

function toLocalInputValue(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function LogScreen({ state, onEdit, onDelete }) {
  const intl = useIntl();
  const { logs } = state;
  const [editingIdx, setEditingIdx] = useState(null);
  const [draft, setDraft] = useState("");

  const startEdit = (idx) => {
    setEditingIdx(idx);
    setDraft(toLocalInputValue(logs[idx].timestamp));
  };

  const saveEdit = () => {
    const iso = new Date(draft).toISOString();
    onEdit(editingIdx, iso);
    setEditingIdx(null);
  };

  const handleDelete = (idx) => {
    if (confirm(intl.formatMessage({ id: "log_confirmDelete" }))) onDelete(idx);
  };

  if (logs.length === 0) {
    return (
      <div className="text-center text-neutral-500 py-16">
        <FormattedMessage id="log_empty" />
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2 list-none p-0 m-0">
      {logs.map((log, idx) => (
        <li
          key={log.timestamp + ":" + idx}
          className="flex items-center gap-3 p-3.5 border border-neutral-200 rounded-xl"
        >
          {editingIdx === idx ? (
            <div className="flex gap-1.5 w-full items-center">
              <input
                type="datetime-local"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="flex-1 p-2 border border-neutral-200 rounded-lg"
              />
              <button
                onClick={saveEdit}
                className="px-3 py-2 bg-orange text-white rounded-lg font-semibold"
              >
                OK
              </button>
              <button
                onClick={() => setEditingIdx(null)}
                className="px-3 py-2 bg-white border border-neutral-200 rounded-lg"
              >
                ×
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => startEdit(idx)}
                className="flex-1 text-left bg-transparent border-0 p-0 font-semibold text-neutral-900"
              >
                <FormattedDate value={log.timestamp} year="numeric" month="short" day="2-digit" />
                {", "}
                <FormattedTime value={log.timestamp} hour="2-digit" minute="2-digit" />
              </button>
              <span className="text-xs text-neutral-500">
                <FormattedMessage id="log_intervalUsed" values={{ n: log.intervalUsed }} />
              </span>
              <button
                onClick={() => handleDelete(idx)}
                aria-label={intl.formatMessage({ id: "log_delete" })}
                className="bg-transparent border-0 text-red-600 px-2 py-1 text-lg"
              >
                🗑
              </button>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
