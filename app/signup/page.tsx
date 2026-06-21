"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 1. Check karein ki dono password match ho rahe hain ya nahi
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // 🌟 2. Dynamic Backend URL configuration
    // Local laptop par automatic localhost uthayega, aur Vercel par environment variable ka use karega
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

    try {
      // 🌟 Hardcoded IP hata kar backticks (`) ke saath dynamic link set kiya hai
      const response = await fetch(`${BACKEND_URL}/api/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Agar backend se koi error aaye (jaise username already exists)
        throw new Error(data.error || "Signup fail ho gaya!");
      }

      setSuccess("Account created successfully! Redirecting to login...");
      
      // 3. Success hone par 2 second baad login page par bhejein
      setTimeout(() => {
        window.location.href = "/login"; 
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Failed to connect to the server.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <h1 className="text-3xl font-bold mb-4">Signup</h1>
      <form onSubmit={handleSignup} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-700 font-bold mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your username"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your password"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Confirm your password"
          />
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            {success}
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
        >
          Signup
        </button>
      </form>
      <p className="mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-500 hover:text-blue-800 font-semibold">
          Login here
        </Link>
      </p>
    </div>
  );
}