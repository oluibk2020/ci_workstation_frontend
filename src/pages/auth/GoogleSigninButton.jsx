import { useEffect, useRef, useState } from "react";

/**
 * Uses Google's own Identity Services script directly (loaded via a
 * <script> tag in index.html) rather than adding an npm dependency —
 * Google publishes and maintains this script themselves, so there's
 * nothing to keep in sync with a wrapper package.
 *
 * Requires a Google OAuth Client ID from Google Cloud Console, set as
 * VITE_GOOGLE_CLIENT_ID in the frontend's .env — this is a *public*
 * identifier (safe to ship in client-side code, unlike a client secret).
 * The backend independently needs the exact same value as GOOGLE_CLIENT_ID
 * in its own .env, since it re-verifies the token's audience server-side
 * (services/authService.js's googleLogin) — both must match or every
 * sign-in will fail token verification.
 *
 * onSuccess receives the raw Google ID token (a JWT) — pass it straight
 * to authService.googleLogin / AuthContext's loginWithGoogle, which sends
 * it to POST /auth/google for the backend to verify and act on.
 *
 * BUG FIX ("google login is not very easy" — the button was flickering/
 * re-rendering constantly): LoginPage.jsx and RegisterPage.jsx were both
 * passing onSuccess/onError as a plain function and an inline arrow —
 * each gets a brand-new reference on every render, including every
 * keystroke in the email/password fields elsewhere on the same page.
 * Since this component's setup effect depended on both props directly,
 * the entire Google button was re-initializing from scratch on every
 * keystroke. Fixed at both call sites with useCallback — but ALSO made
 * defensive here, so the same mistake by a future caller can't cause it
 * again: the latest onSuccess/onError are kept in a ref, updated every
 * render without triggering anything, while the actual Google SDK setup
 * effect below depends only on `clientId` (which never changes) — so
 * initialization now happens essentially once, no matter how the props
 * are passed in.
 */
export default function GoogleSignInButton({ onSuccess, onError }) {
  const buttonRef = useRef(null);
  const [notConfigured, setNotConfigured] = useState(false);

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      setNotConfigured(true);
      return;
    }

    let cancelled = false;

    function render() {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current)
        return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            onSuccessRef.current?.(response.credential);
          } else {
            onErrorRef.current?.("Google didn't return a valid credential.");
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    }

    // The script (added in index.html) loads async — if it hasn't
    // finished yet, poll briefly rather than assuming it's ready.
    if (window.google?.accounts?.id) {
      render();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          render();
        }
      }, 100);
      setTimeout(() => clearInterval(interval), 5000);
      return () => clearInterval(interval);
    }

    return () => {
      cancelled = true;
    };
    // Deliberately NOT depending on onSuccess/onError — see header note.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (notConfigured) {
    return (
      <p className="rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-400">
        Google sign-in isn't configured yet — set VITE_GOOGLE_CLIENT_ID to
        enable it.
      </p>
    );
  }

  return <div ref={buttonRef} className="flex justify-center" />;
}
