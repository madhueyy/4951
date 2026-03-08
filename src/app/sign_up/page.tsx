"use client";

import React, { useState } from "react";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [success, setSuccess] = useState("");

  // Email validation
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value) && value.length > 0) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  // Password validation
  const validatePassword = (value: string) => {
    if (value.length < 8 && value.length > 0) {
      setPasswordError("Password must be at least 8 characters long.");
    } else if (!/[A-Z]/.test(value) && value.length > 0) {
      setPasswordError("Password must contain at least one uppercase letter.");
    } else if (!/[a-z]/.test(value) && value.length > 0) {
      setPasswordError("Password must contain at least one lowercase letter.");
    } else if (!/[0-9]/.test(value) && value.length > 0) {
      setPasswordError("Password must contain at least one number.");
    } else if (!/[!@#$%^&*]/.test(value) && value.length > 0) {
      setPasswordError("Password must contain at least one special character.");
    } else {
      setPasswordError("");
    }
  };

  // Confirm password validation
  const validateConfirmPassword = (value: string) => {
    if (value !== password) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (emailError || passwordError || confirmPasswordError) {
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        // Try to parse the error message if the response contains JSON
        let errorMessage = "Failed to sign up";
        try {
          const data = await response.json();
          errorMessage = data.message;
        } catch (err) {
          console.error("Response is not valid JSON:", err);
        }
        throw new Error(errorMessage);
      }

      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setSuccess(
        "Sign-up successful! Please check your email to verify your account."
      );
    } catch (err: any) {
      setConfirmPasswordError(
        err.message || "An error occurred during sign-up."
      );
    }
  };

  const handleSignUpGoogle = async (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = "/api/auth/signin/google";
  };

  return (
    <main className="w-[100vw] min-h-[100vh] font-[family-name:var(--font-geist-sans)] flex flex-col items-center justify-center bg-zinc-800">
      <div className="bg-zinc-700 py-10 px-10 space-y-4 justify-items-center rounded-lg drop-shadow-2xl">
        <p className="text-3xl font-semibold">Sign Up</p>

        <form className="flex flex-col space-y-2 py-4" onSubmit={handleSignUp}>
          {/* Name */}
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter your name..."
            className="w-100 text-sm rounded px-3 py-3 bg-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Email */}
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email..."
            className="w-100 text-sm rounded px-3 py-3 bg-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
          />
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}

          {/* Password */}
          <label className="mt-2">Password</label>
          <input
            type="password"
            placeholder="Enter your password..."
            className="w-100 text-sm rounded px-3 py-3 bg-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
          />
          {passwordError && (
            <p className="text-red-500 text-sm">{passwordError}</p>
          )}

          {/* Confirm Password */}
          <label className="mt-2">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password..."
            className="w-100 text-sm rounded px-3 py-3 bg-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              validateConfirmPassword(e.target.value);
            }}
          />
          {confirmPasswordError && (
            <p className="text-red-500 text-sm">{confirmPasswordError}</p>
          )}

          {/* Success text */}
          {!success && <p className="text-green-500 text-md mt-4">{success}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              !email ||
              !password ||
              !confirmPassword ||
              Boolean(emailError) ||
              Boolean(passwordError) ||
              Boolean(confirmPasswordError)
            }
            className="bg-blue-500 py-2 px-4 mt-4 font-medium rounded hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-default cursor-pointer text-white"
          >
            Sign Up
          </button>
        </form>

        <div className="flex flex-row w-full items-center gap-x-2">
          <hr className="text-zinc-500 w-full" />
          <p className="text-sm text-zinc-400">or</p>
          <hr className="text-zinc-500 w-full" />
        </div>

        <button
          className="flex flex-row flex-grow text-center items-center justify-center gap-x-2 w-full bg-white py-1.5 px-4 mt-8 font-medium rounded hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-default cursor-pointer text-black"
          onClick={handleSignUpGoogle}
        >
          <img
            src="../../google-icon.png"
            className="w-8 h-8"
            alt="Google Icon"
          />
          Sign up with Google
        </button>
      </div>
    </main>
  );
}

export default SignUp;
