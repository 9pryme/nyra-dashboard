import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Move Funds",
  description: "Transfer funds between company accounts and view transaction history.",
};

export default function MoveFundsLayout({
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