import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#64D600]">
      {/* Centered Login Form */}
      <div className="w-full max-w-md">
       
        <div className="bg-card rounded-lg shadow-xl border border-border/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-clash font-bold mb-2 tracking-[-0.02em] text-foreground">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your credentials to access your account
            </p>
          </div>
          
          <LoginForm />
          
         
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-white/80">
            © 2025 Nyra. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}