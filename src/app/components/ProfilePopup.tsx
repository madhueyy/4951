import React from "react";
import { signOut } from "next-auth/react";
import { PiSignOutBold } from "react-icons/pi";
import { CgProfile } from "react-icons/cg";

function ProfilePopup({ userEmail }: { userEmail: string | null | undefined }) {
  return (
    <div className="absolute bg-zinc-700 py-2 px-1 space-y-2 rounded-md left-1 bottom-16">
      <p className="flex flex-row text-sm items-center gap-x-2 text-zinc-400 px-3 py-2 select-none">
        <CgProfile className="text-lg" />
        {userEmail}
      </p>
      <hr className="text-zinc-500 mx-3"></hr>
      <button
        className="flex flex-row justify-start items-center gap-x-2 text-sm font-medium w-full px-3 py-2 rounded-md hover:bg-zinc-800 hover:cursor-pointer transition-colors"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <PiSignOutBold className="text-lg" />
        Log out
      </button>
    </div>
  );
}

export default ProfilePopup;
