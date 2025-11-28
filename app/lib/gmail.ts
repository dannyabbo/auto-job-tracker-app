import { google } from "googleapis";

export function getGmailClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

export async function fetchEmails(accessToken: string, maxResults = 50) {
  const gmail = getGmailClient(accessToken);

  //get list of message IDs form the last 30 days
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const response = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: `after:${thirtyDaysAgo}`,
  });

  const messages = response.data.messages || [];

  //fetch each message
  const emails = await Promise.all(
    messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "metadata",
        metadataHeaders: ["subject", "from", "date"],
      });

      const headers = detail.data.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name === name)?.value;

      return {
        providerMessageId: msg.id!,
        subject: getHeader("Subject"),
        fromAddress: getHeader("From"),
        receivedAt: new Date(getHeader("Date") || Date.now()),
      };
    })
  );

  return emails;
}
