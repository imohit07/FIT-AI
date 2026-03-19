import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="card w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2 text-black">Welcome back</h2>
        <p className="text-sm text-black mb-4">Sign in to your fitness dashboard.</p>
        {error && <p className="text-sm text-red-400 mb-2">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-black mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-lg bg-white border border-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-black mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-lg bg-white border border-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full mt-2 rounded-lg bg-primary text-black font-medium py-2 text-sm hover:bg-emerald-400"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-xs text-black">
          New here?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

