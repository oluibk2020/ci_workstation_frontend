import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { paymentService } from "../../services/paymentService";
import { useWallet } from "../../context/WalletContext";
import Button from "../../components/common/Button";

/**
 * NEW — this route (/payment/callback) didn't exist at all before. It's
 * where Paystack sends the browser back after checkout (the
 * callback_url set in paymentService.initializePayment on the backend).
 * Paystack appends the reference as both `reference` and `trxref` query
 * params (same value, kept for backward compatibility with older
 * integrations) — either works, `reference` is used here.
 *
 * Calling verify() here is not just a status check — it's the primary
 * way a deposit actually gets credited in local/dev environments, since
 * Paystack's webhook cannot reach localhost. See
 * services/paymentService.js's completePaymentIfNeeded on the backend.
 */
export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const { reload } = useWallet();
  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "failed"
  const [error, setError] = useState("");

  useEffect(() => {
    const reference =
      searchParams.get("reference") || searchParams.get("trxref");

    if (!reference) {
      setStatus("failed");
      setError("No payment reference was provided.");
      return;
    }

    paymentService
      .verify(reference)
      .then((result) => {
        if (result.status === "success") {
          setStatus("success");
          reload(); // refresh wallet balance to reflect the new credit
        } else {
          setStatus("failed");
          setError(`Payment status: ${result.status}`);
        }
      })
      .catch((err) => {
        setStatus("failed");
        setError(err.message || "Couldn't verify this payment.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
      {status === "verifying" && (
        <>
          <Loader2 size={40} className="animate-spin text-slate-300" />
          <p className="text-slate-500">
            Confirming your payment with Paystack...
          </p>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle2 size={40} className="text-[var(--color-success)]" />
          <h1 className="text-xl font-bold text-[var(--color-primary)]">
            Wallet funded successfully
          </h1>
          <p className="text-sm text-slate-500">
            Your new balance is already reflected in your wallet.
          </p>
          <Button as={Link} to="/client/wallet" className="mt-2">
            Go to my wallet
          </Button>
        </>
      )}
      {status === "failed" && (
        <>
          <XCircle size={40} className="text-[var(--color-danger)]" />
          <h1 className="text-xl font-bold text-[var(--color-primary)]">
            Payment not completed
          </h1>
          <p className="text-sm text-slate-500">{error}</p>
          <Button
            as={Link}
            to="/client/wallet"
            variant="outline"
            className="mt-2"
          >
            Back to my wallet
          </Button>
        </>
      )}
    </div>
  );
}
