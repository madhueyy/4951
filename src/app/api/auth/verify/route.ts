import clientPromise from "../../../lib/mongodb";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return new Response("Invalid token", { status: 400 });

  const db = (await clientPromise).db();
  const users = db.collection("users");

  const user = await users.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() },
  });

  if (!user) return new Response("Token expired or invalid", { status: 400 });

  await users.updateOne(
    { _id: user._id },
    {
      $set: { verified: true },
      $unset: { verificationToken: "", verificationTokenExpires: "" },
    }
  );

  return new Response("Email verified successfully. You can now log in.");
}
