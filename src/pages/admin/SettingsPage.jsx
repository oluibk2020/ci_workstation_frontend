import { useState, useEffect, useCallback } from "react";
import { Settings, CheckCircle2 } from "lucide-react";
import { systemConfigService } from "../../services/systemConfigService";
import Button from "../../components/common/Button";

const LABELS = {
  max_booking_days: "Max operating days per booking",
  max_advance_booking_days: "Max calendar days you can book in advance",
  max_monthly_reassignments: "Max reassignment operations per month",
};

/**
 * These settings genuinely take effect now — bookingService.js and
 * reassignmentService.js were re-wired this session to read live from
 * SystemConfig instead of hardcoded constants. Editing a value here
 * actually changes enforcement on the next booking/reassignment attempt.
 */
export default function SettingsPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await systemConfigService.getAll();
      setConfigs(result.configs || []);
    } catch (err) {
      setError(err.message || "Couldn't load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(config) {
    setEditingKey(config.key);
    setEditValue(config.value);
    setSavedKey(null);
  }

  async function handleSave(key) {
    setSaving(true);
    setError("");
    try {
      const { config } = await systemConfigService.update(key, editValue);
      setConfigs((prev) => prev.map((c) => (c.key === key ? config : c)));
      setEditingKey(null);
      setSavedKey(key);
    } catch (err) {
      setError(err.message || "Couldn't save this setting.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-400">Loading settings...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--color-primary)]">Settings</h1>
        <p className="text-sm text-slate-500">
          These are read live by the booking system — a change here takes effect on the very next
          booking or reassignment attempt.
        </p>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <div className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-white">
        {configs.map((c) => (
          <div key={c.key} className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-line)] p-4 last:border-b-0">
            <div>
              <p className="font-medium text-[var(--color-primary)]">{LABELS[c.key] || c.key}</p>
              <p className="font-mono-tight text-xs text-slate-400">{c.key}</p>
            </div>

            {editingKey === c.key ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-24 rounded-lg border border-[var(--color-line)] px-3 py-1.5 text-sm focus:border-[var(--color-accent)] focus:outline-none"
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={() => setEditingKey(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => handleSave(c.key)} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {savedKey === c.key && <CheckCircle2 size={16} className="text-[var(--color-success)]" />}
                <span className="font-mono-tight text-lg font-bold text-[var(--color-primary)]">{c.value}</span>
                <Button size="sm" variant="outline" onClick={() => startEdit(c)}>
                  Edit
                </Button>
              </div>
            )}
          </div>
        ))}

        {configs.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Settings size={28} className="text-slate-300" />
            <p className="text-sm text-slate-500">No settings found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
