// Adding a login page with Firebase Auth, restricted to a specific UID set in env vars.

// ---------------- file: app/login/page.tsx ----------------
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const uid = userCred.user.uid;

        if (uid !== process.env.NEXT_PUBLIC_ALLOWED_ADMIN_UID) {
            setError("You are not authorized to access the admin portal.");
            await auth.signOut();
            setLoading(false);
            return;
        }

        router.push("/");
        } catch (err: unknown) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("Failed to sign in");
        }
        } finally {
        setLoading(false);
        }
    };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={handleLogin} className="bg-white shadow-md rounded-lg p-6 w-full max-w-md space-y-4">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Login"}
        </Button>
      </form>
    </div>
  );
}

/*
ENV setup:
NEXT_PUBLIC_ALLOWED_ADMIN_UID=<the-uid-you-want-to-allow>

Notes:
- We check the UID immediately after successful sign in.
- Unauthorized users are signed out instantly and see an error.
- In production, you should also protect API routes server-side with the same UID check (via admin SDK verifyIdToken).
*/
