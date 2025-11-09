import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import ProfilePopup from "./ProfilePopup";
import { BsLayoutSidebar } from "react-icons/bs";
import { FiPlusCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";

function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const [popupOpen, setPopupOpen] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [simulations, setSimulations] = useState<
    { _id: string; title: string }[]
  >([]);

  useEffect(() => {
    if (navbarOpen) {
      const fetchSimulations = async () => {
        try {
          const res = await fetch("/api/simulations");

          if (!res.ok) {
            throw new Error("Failed to fetch simulations");
          }

          const data = await res.json();
          setSimulations(data);
          console.log(data);
        } catch (error) {
          console.error(error);
        }
      };

      fetchSimulations();
    }
  }, [navbarOpen]);

  // Reset everything and redirect to start page
  const resetSimulation = () => {
    localStorage.removeItem("simulationResponse");
    localStorage.removeItem("simulationQuestions");
    localStorage.removeItem("simulationAnswers");
    localStorage.removeItem("simulationScores");
    localStorage.removeItem("simulationDisability");
    localStorage.removeItem("WCAGAndUDLFeedback");
    localStorage.removeItem("improvement");

    router.push("/home");
  };

  const addSimulation = async () => {
    router.push(`/new_simulation`);
  };

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

        <button
          className="flex flex-row gap-x-2 items-center rounded-md p-3 hover:bg-zinc-50/10 hover:cursor-pointer transition-colors"
          onClick={addSimulation}
        >
          <FiPlusCircle className="text-lg" />
          <p>New simulation</p>
        </button>

        <p className="text-md text-zinc-300 pl-3 mt-4">Simulations</p>

        <div className="flex flex-col gap-y-2 mt-2">
          {simulations.map((sim, idx) => {
            const titleWithoutSeconds = sim.title.replace(
              /:(\d{2})(?=\s?(AM|PM))/i,
              ""
            );

            return (
              <p
                key={idx}
                className="flex flex-row text-zinc-400 text-sm px-2 py-1 mx-1 min-h-12 items-center rounded-lg hover:bg-zinc-500/40 hover:text-white cursor-pointer"
                onClick={() => router.push(`/simulation/${sim._id}`)}
              >
                {titleWithoutSeconds}
              </p>
            );
          })}
        </div>

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

      <button
        className="flex flex-row mx-auto items-center rounded-md p-3 hover:bg-zinc-50/10 hover:cursor-pointer transition-colors"
        onClick={addSimulation}
      >
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
