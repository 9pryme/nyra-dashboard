import LoginForm from "@/components/auth/LoginForm";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Branding and Info */}
      <div className="relative hidden md:flex md:w-1/2 bg-black text-white flex-col justify-between p-8">
        <Image
          src="https://images.pexels.com/photos/7567434/pexels-photo-7567434.jpeg"
          alt="Background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="relative z-10">
          <div className="flex items-center">
            <span className="text-2xl font-bold tracking-tight">Nyra</span>
          </div>
        </div>
        <div className="relative z-20 mb-40">
          <div className="mt-40">
            <h1 className="text-4xl font-bold mb-4 tracking-[-0.02em]">
              Transform your financial future with Nyra
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              Experience seamless financial management with our cutting-edge platform.
            </p>
          </div>
          <div className="flex space-x-4 mt-12">
            <div className="flex space-x-2 items-center">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Secure</p>
                <p className="text-xs text-gray-400">Bank-grade security</p>
              </div>
            </div>
            <div className="flex space-x-2 items-center">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Fast</p>
                <p className="text-xs text-gray-400">Instant transfers</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 text-sm text-gray-400">
          © 2025 Nyra. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="md:hidden mb-8 flex justify-center">
            <span className="text-2xl font-bold tracking-tight">Nyra</span>
          </div>
          <h2 className="text-3xl font-bold mb-2 tracking-[-0.02em] text-center md:text-left">
            Welcome back
          </h2>
          <p className="text-muted-foreground mb-8 text-center md:text-left">
            Enter your credentials to access your account
          </p>
          <LoginForm />
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="#" className="font-medium text-primary hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}