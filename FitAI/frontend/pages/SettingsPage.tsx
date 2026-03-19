import { useAuth } from "../services/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useState } from "react";
import { LogOut, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await api.delete("/auth/delete-account");
      logout();
      navigate("/login");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete account");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-textDark">Settings</h2>
        <p className="text-sm text-slate-500">Manage your account and preferences.</p>
      </div>

      <div className="max-w-lg">
        <div className="card space-y-4">
          <div className="border-b border-borderGray pb-4">
            <h3 className="text-sm font-semibold text-textDark mb-3">Account</h3>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          <div className="pt-2">
            <h3 className="text-sm font-semibold text-textDark mb-3">Danger Zone</h3>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-accentRed hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={18} />
                Delete Account
              </button>
            ) : (
              <div className="bg-red-50 border border-accentRed rounded-lg p-3 space-y-3">
                <p className="text-sm text-accentRed font-medium">
                  Are you sure? This action cannot be undone. All your data will be permanently deleted.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="flex-1 px-3 py-2 bg-accentRed text-white text-sm rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Yes, Delete"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={loading}
                    className="flex-1 px-3 py-2 bg-slate-200 text-textDark text-sm rounded-lg hover:opacity-90 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
