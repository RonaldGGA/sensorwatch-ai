"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) {
      setError("ACCESS DENIED — Invalid credentials");
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        background: "#080c12",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, #1a2332 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }}
    >
      <div
        className="w-full max-w-sm p-8 rounded"
        style={{
          background: "#0d1219",
          border: "1px solid #1a2332",
          boxShadow: "0 0 40px rgba(0, 212, 255, 0.05)",
        }}
      >
        <div className="mb-8 text-center">
          <p
            className="text-2xl font-bold tracking-widest"
            style={{
              fontFamily: "JetBrains Mono",
              color: "#00d4ff",
              letterSpacing: "0.2em",
            }}
          >
            SENSORWATCH
          </p>
          <p
            className="text-xs tracking-widest mt-1"
            style={{ fontFamily: "JetBrains Mono", color: "#364152" }}
          >
            INDUSTRIAL MONITORING SYSTEM
          </p>
          <div
            className="mt-4 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, #1a2332, transparent)",
            }}
          />
        </div>

        {error && (
          <div
            className="mb-4 px-3 py-2 rounded text-xs"
            style={{
              fontFamily: "JetBrains Mono",
              color: "#ff4444",
              background: "rgba(255, 68, 68, 0.08)",
              border: "1px solid rgba(255, 68, 68, 0.2)",
            }}
          >
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label
              className="block text-xs mb-1.5 tracking-widest"
              style={{ fontFamily: "JetBrains Mono", color: "#52627a" }}
            >
              OPERATOR ID
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full px-3 py-2 rounded text-sm outline-none transition-all"
              style={{
                fontFamily: "JetBrains Mono",
                background: "#080c12",
                border: "1px solid #1a2332",
                color: "#e2e8f0",
              }}
              placeholder="operator@facility.com"
            />
          </div>

          <div>
            <label
              className="block text-xs mb-1.5 tracking-widest"
              style={{ fontFamily: "JetBrains Mono", color: "#52627a" }}
            >
              ACCESS CODE
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full px-3 py-2 rounded text-sm outline-none"
              style={{
                fontFamily: "JetBrains Mono",
                background: "#080c12",
                border: "1px solid #1a2332",
                color: "#e2e8f0",
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-2.5 rounded text-xs font-semibold tracking-widest transition-all mt-2"
            style={{
              fontFamily: "JetBrains Mono",
              background: loading ? "#052830" : "rgba(0, 212, 255, 0.1)",
              border: "1px solid rgba(0, 212, 255, 0.3)",
              color: loading ? "#364152" : "#00d4ff",
            }}
          >
            {loading ? "AUTHENTICATING..." : "AUTHORIZE ACCESS →"}
          </button>
        </div>
      </div>
    </div>
  );
}
