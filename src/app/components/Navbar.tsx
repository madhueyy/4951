import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import ProfilePopup from "./ProfilePopup";
import { BsLayoutSidebar } from "react-icons/bs";
import { FiPlusCircle } from "react-icons/fi";

function Navbar() {
  const { data: session } = useSession();

  const [popupOpen, setPopupOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);

  if (!session) {
    return <div></div>;
  }

  if (navbarOpen) {
    return (
      <div className="flex flex-col h-[100vh] fixed left-0 top-0 gap-y-2 px-1 w-60 bg-zinc-900 border-r border-zinc-600">
        <button
          className="rounded-md ml-auto mt-2 p-3 hover:bg-zinc-50/10 hover:cursor-pointer transition-colors"
          onClick={() => setNavbarOpen((prev) => !prev)}
        >
          <BsLayoutSidebar className="text-md" />
        </button>

        <button className="flex flex-row gap-x-2 items-center rounded-md p-3 hover:bg-zinc-50/10 hover:cursor-pointer transition-colors">
          <FiPlusCircle className="text-lg" />
          <p>New simulation</p>
        </button>

        <p className="text-md text-zinc-400 pl-3 mt-4">Simulations</p>

        <button
          className="flex flex-row gap-x-2 items-center rounded-md p-2 mt-auto mb-4 hover:bg-zinc-50/10 hover:cursor-pointer transition-colors"
          onClick={() => setPopupOpen((prev) => !prev)}
        >
          {session.user?.image && (
            <Image
              src={session.user?.image}
              alt="Profile"
              width={30}
              height={30}
              className="rounded-full"
            />
          )}
          {session.user?.name && <p>{session.user?.name}</p>}
        </button>

        {popupOpen && <ProfilePopup userEmail={session.user?.email} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100vh] fixed left-0 top-0 gap-y-2 px-1 border-r border-zinc-600">
      <button
        className="rounded-md mx-auto mt-2 p-3 hover:bg-zinc-50/10 hover:cursor-pointer transition-colors"
        onClick={() => setNavbarOpen((prev) => !prev)}
      >
        <BsLayoutSidebar className="text-md" />
      </button>

      <button className="flex flex-row mx-auto items-center rounded-md p-3 hover:bg-zinc-50/10 hover:cursor-pointer transition-colors">
        <FiPlusCircle className="text-lg" />
      </button>

      <button
        className="rounded-md p-2 mt-auto mb-4 hover:bg-zinc-50/10 hover:cursor-pointer transition-colors"
        onClick={() => setPopupOpen((prev) => !prev)}
      >
        {session.user?.image && (
          <Image
            src={session.user?.image}
            alt="Profile"
            width={30}
            height={30}
            className="rounded-full"
          />
        )}
      </button>

      {popupOpen && <ProfilePopup userEmail={session.user?.email} />}
    </div>
  );
}

export default Navbar;
