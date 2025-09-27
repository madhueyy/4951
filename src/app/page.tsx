"use client";

import React from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";

function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginGoogle = (e: any) => {
    e.preventDefault();

    signIn("google", { callbackUrl: "/home" });
  };

  return (
    <main className="w-[100vw] min-h-[100vh] font-[family-name:var(--font-geist-sans)] flex flex-col items-center justify-center bg-zinc-800">
      <div className=" bg-zinc-700 py-10 px-10 space-y-4 justify-items-center rounded-lg drop-shadow-2xl">
        <p className="text-3xl font-semibold">Login</p>

        <form className="flex flex-col space-y-2 py-4">
          <label>Your Email</label>
          <input
            type="text"
            placeholder="Enter your email..."
            className="w-100 text-sm rounded px-3 py-3 bg-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setEmail(e.target.value)}
          ></input>

          <label className="mt-2">Your Password</label>
          <input
            type="text"
            placeholder="Enter your password..."
            className="w-100 text-sm rounded px-3 py-3 bg-zinc-800 text-white focus:border-blue-500 focus:ring-blue-500"
            onChange={(e) => setPassword(e.target.value)}
          ></input>

          <button
            type="submit"
            disabled={!email || !password}
            className="bg-blue-500 py-2 px-4 mt-8 font-medium rounded hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-default cursor-pointer text-white"
          >
            Login
          </button>
        </form>

        <div className="flex flex-row w-full items-center gap-x-2">
          <hr className="text-zinc-500 w-full"></hr>
          <p className="text-sm text-zinc-400">or</p>
          <hr className="text-zinc-500 w-full"></hr>
        </div>

        <button
          className="flex flex-row flex-grow text-center items-center justify-center gap-x-2 w-full bg-white py-1.5 px-4 mt-8 font-medium rounded hover:bg-gray-100 disabled:text-gray-300 disabled:cursor-default cursor-pointer text-black"
          onClick={(e) => handleLoginGoogle(e)}
        >
          <img src="../../google-icon.png" className="w-8 h-8"></img>
          Sign in with Google
        </button>
      </div>
    </main>
  );
}

export default Page;
