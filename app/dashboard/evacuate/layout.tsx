import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Funds Evacuation",
  description: "Evacuate funds from 9PSB to your designated account.",
};

export default function EvacuateLayout({
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