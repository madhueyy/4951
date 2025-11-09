import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Session } from "next-auth";
import clientPromise from "../../../lib/mongodb";

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions)) as Session;

  if (!session || !session.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();

  const { data } = await req.json();

  const newSimulation = {
    userEmail: session.user.email,
    title: `Simulation ${new Date().toLocaleString()}`,
    createdAt: new Date(),
    data: data,
  };

  const result = await db.collection("simulations").insertOne(newSimulation);

  console.log("hi");

  return new Response(
    JSON.stringify({ id: result.insertedId, title: newSimulation.title }),
    {
      status: 200,
    }
  );
}
