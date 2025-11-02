import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import type { Session } from "next-auth";
import clientPromise from "../../lib/mongodb";

export async function GET() {
  const session = (await getServerSession(authOptions)) as Session;

  if (!session || !session.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db();

  const simulations = await db
    .collection("simulations")
    .find({ userEmail: session.user.email })
    .project({ title: 1, _id: 0 })
    .sort({ createdAt: -1 })
    .toArray();

  return new Response(JSON.stringify(simulations), { status: 200 });
}
