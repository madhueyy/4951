import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Session } from "next-auth";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

interface Simulation {
  _id: ObjectId;
  userEmail: string;
  title: string;
  createdAt: Date;
  data: any;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = (await getServerSession(authOptions)) as Session;

  if (!session || !session.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return new Response("Simulation ID is required", { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    const simulation = await db
      .collection("simulations")
      .findOne({ _id: new ObjectId(id), userEmail: session.user.email });

    if (!simulation) {
      return new Response("Simulation not found", { status: 404 });
    }

    return new Response(JSON.stringify(simulation.data), { status: 200 });
  } catch (error) {
    console.error("Error fetching simulation:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
