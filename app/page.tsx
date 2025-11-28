import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">AutoJobTracker</h1>

      {session ? (
        <div className="text-center">
          <p className="mb-4">Signed in as {session.user?.email}</p>

          <div className="flex gap-4 mb-4">
            <form action="/api/emails/sync" method="POST">
              <button className="bg-green-500 text-white px-4 py-2 rounded">
                Sync Emails
              </button>
            </form>

            <form action="/api/emails/classify" method="POST">
              <button className="bg-purple-500 text-white px-4 py-2 rounded">
                Classify Emails
              </button>
            </form>
          </div>

          <div className="flex gap-4">
            <a
              href="/settings"
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Settings
            </a>

            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button className="bg-red-500 text-white px-4 py-2 rounded">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      ) : (
        <form
          action={async () => {
            "use server";
            await signIn("google");
          }}
        >
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Sign in with Google
          </button>
        </form>
      )}
    </main>
  );
}