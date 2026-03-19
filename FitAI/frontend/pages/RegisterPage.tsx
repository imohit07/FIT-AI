import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await register(name, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="card w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2 text-black">Create your account</h2>
        <p className="text-sm text-black mb-4">Start tracking your fitness journey.</p>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-black mb-1">Name</label>
            <input
              className="w-full rounded-lg bg-white border border-black px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
            Register
          </button>
        </form>
        <p className="mt-4 text-xs text-black">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

