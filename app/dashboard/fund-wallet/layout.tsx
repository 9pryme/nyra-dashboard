import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fund Wallet",
  description: "Add funds to a user's wallet and view transaction history.",
};

export default function FundWalletLayout({
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