import { auth, signIn, signOut } from "@/auth"

export default async function Home() {
  const session = await auth()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8" >Auto Job Tracker</h1>
      {session ? (
        <div className="text-center">
          <p className="mb-4">Singned in as {session.user?.email}</p>
          <form
            action={async () => {
              "use server"
              await signOut()
            }}
            >
              <button className="bg-red-500 text-white px-4 py-2 rounded">
                Sign Out
              </button>
            </form>
        </div>
      ) :
      (
        <form action={async () => {
          "use server"
          await signIn("google")
          
        }}>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            Sign in with google
          </button>
        </form>
      )}
    </main>
  )
}