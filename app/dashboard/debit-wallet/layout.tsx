import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debit Wallet",
  description: "Debit a user's wallet and view transaction history.",
};

export default function DebitWalletLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 container">
      {children}
    </div>
  );
} 