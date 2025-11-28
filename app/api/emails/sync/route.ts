import { auth } from "@/auth";
import { db } from "@/app/lib/db";
import { fetchEmails } from "@/app/lib/gmail";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  //get or create user
  let user = await db.user.findUnique({
    where: { email: session.user?.email! },
  });

  if (!user) {
    user = await db.user.create({
      data: { email: session.user?.email! },
    });
  }

  //fetch emails
  const emails = await fetchEmails(session.accessToken);

  //upsert emails to database
  let savedCount = 0;
  for (const email of emails) {
    await db.email.upsert({
      where: { providerMessageId: email.providerMessageId },
      update: {},
      create: {
        userId: user!.id,
        providerMessageId: email.providerMessageId,
        subject: email.subject || "",
        fromAddress: email.fromAddress || "",
        receivedAt: email.receivedAt,
      },
    });
    savedCount++;
  }

  return NextResponse.json({
    message: `Synced ${savedCount} emails`,
    count: savedCount,
  });
}
