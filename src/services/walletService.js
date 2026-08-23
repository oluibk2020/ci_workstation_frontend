import { apiFetch } from "./api";

// Not yet called by WalletContext (which is mocked). Wire these up once the
// Express/Prisma Wallet endpoints and a payment provider exist — see docs
// Section 13 and 22. A deposit must be verified server-side with the
// payment provider before the balance is credited.
export const walletService = {
  getBalance: () => apiFetch("/wallet"),
  listTransactions: () => apiFetch("/wallet/transactions"),
  deposit: (amount, method) => apiFetch("/wallet/deposit", { method: "POST", body: { amount, method } }),
};
