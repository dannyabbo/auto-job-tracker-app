import { auth } from "@/auth";
import { db } from "@/app/lib/db";
import { classifyEmail } from "@/app/lib/openai";
import { NextResponse } from "next/server";
import { decrypt } from "@/app/lib/encryption";

export async function POST() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user?.openaiApiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not set. Go to /settings" },
      { status: 400 }
    );
  }

  const apiKey = decrypt(user.openaiApiKey);

  //get unclassified email

  const emails = await db.email.findMany({
    where: {
      userId: user.id,
      classificationResult: null,
    },
    take: 20,
  });

  let jobCount = 0;

  for (const email of emails) {
    try {
      const result = await classifyEmail(
        apiKey,
        email.subject,
        email.fromAddress
      );

      // Save classification result
      await db.email.update({
        where: { id: email.id },
        data: { classificationResult: JSON.stringify(result) },
      });

      // If job-related, find or create job application
      if (result.isJobRelated && result.company) {
        const role = result.role || "Unknown Role";

        // Find existing application at same company + role
        let application = await db.jobApplication.findFirst({
          where: {
            userId: user.id,
            company: result.company,
            role: role,
          },
        });

        if (!application) {
          application = await db.jobApplication.create({
            data: {
              userId: user.id,
              company: result.company,
              role: role,
              status: result.status || "applied",
              confidenceScore: result.confidence,
            },
          });
          jobCount++;
        } else {
          // Update status if this email indicates progress
          await db.jobApplication.update({
            where: { id: application.id },
            data: { status: result.status || application.status },
          });
        }

        // Link email to application via event (if not already linked)
        const existingEvent = await db.applicationEvent.findFirst({
          where: { emailId: email.providerMessageId },
        });

        if (!existingEvent) {
          await db.applicationEvent.create({
            data: {
              applicationId: application.id,
              eventType: result.status || "applied",
              eventTimestamp: email.receivedAt,
              summary: email.subject,
              emailId: email.providerMessageId,
            },
          });
        }
      }
    } catch (error) {
      console.error(`Failed to classify email ${email.id}:`, error);
    }
  }

  return NextResponse.json({
    message: `Classified ${emails.length} emails, found ${jobCount} job-related`,
    processed: emails.length,
    jobsFound: jobCount,
  });
}
