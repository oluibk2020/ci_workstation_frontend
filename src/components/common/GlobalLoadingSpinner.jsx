import { useEffect, useState } from "react";
import { loadingManager } from "../../utils/loadingManager";

export default function GlobalLoadingSpinner() {
  const [loading, setLoading] = useState(false);

  useEffect(() => loadingManager.subscribe(setLoading), []);

  if (!loading) return null;

  return (
    <div className="global-loader" role="status" aria-live="polite" aria-label="Loading">
      <div className="global-loader-card">
        <div className="global-loader-orbit" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div>
          <p className="global-loader-title">Please wait</p>
          <p className="global-loader-text">Loading your Workstation data…</p>
        </div>
      </div>
    </div>
  );
}
