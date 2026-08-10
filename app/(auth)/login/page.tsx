"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data?.error?.message || "Login failed. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setErrorMsg("An unexpected network error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4">
      {errorMsg && (
        <div className="mb-4 w-full max-w-md">
          <Toast
            type="error"
            title="Authentication Error"
            message={errorMsg}
            onClose={() => setErrorMsg(null)}
          />
        </div>
      )}

      <Card className="w-full max-w-md bg-white p-2 border-slate-200 shadow-2xl">
        <CardHeader className="text-center">
          <img src="/logo.jpg" alt="EVOLIX OS" className="mx-auto mb-2 h-14 w-14 object-contain rounded-2xl shadow-md" />
          <CardTitle className="text-xl font-bold text-slate-900">EVOLIX OS</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Internal Agency Operating System
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="founder1@evolix.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <Button variant="primary" className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In to Evolix OS"}
            </Button>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <Link href="/" className="text-teal-600 hover:underline text-xs">
              ← Return to Public Website
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
