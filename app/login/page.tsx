"use client";

import { useState } from "react";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || "Login fail ho gaya!");
      }

      // Tokens ko browser cookies mein save karein
      Cookies.set("access_token", data.access, { expires: 1 });
      Cookies.set("refresh_token", data.refresh, { expires: 7 });

      alert("Login Successful! Redirecting to Map...");
      
      // Sahi redirection method browser loop se bachne ke liye
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Invalid username or password");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 text-black">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded-lg shadow-md w-96 border border-gray-200">
        <h2 className="mb-6 text-2xl font-bold text-center text-blue-600">SafeRoute Login</h2>
        
        {error && <p className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded text-center">{error}</p>}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded text-black focus:outline-blue-500 bg-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded text-black focus:outline-blue-500 bg-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="w-full p-2 text-white bg-blue-600 rounded font-semibold hover:bg-blue-700 transition">
          Sign In
        </button>
      </form>
    </div>
  );
}