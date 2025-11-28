import { auth } from "@/auth"
import { db } from "@/app/lib/db"
import { encrypt } from "@/app/lib/encryption"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
    const session = await auth()

    if (!session?.user?.email) {
        redirect("/")
    }

    const user = await db.user.findUnique({
        where: { email: session.user.email },
    })

    const hasApiKey = !!user?.openaiApiKey

    async function saveApiKey(formData: FormData) {
        "use server"

        const apiKey = formData.get("apiKey") as string
        const session = await auth()

        if (!session?.user?.email || !apiKey) return

        const encrypted = encrypt(apiKey)

        await db.user.update({
            where: { email: session.user.email },
            data: { openaiApiKey: encrypted },
        })

        redirect("/settings")
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
          <h1 className="text-2xl font-bold mb-8">Settings</h1>
    
          <div className="w-full max-w-md">
            <form action={saveApiKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  name="apiKey"
                  placeholder={hasApiKey ? "••••••••••••••••" : "sk-..."}
                  className="w-full p-2 border rounded text-black"
                />
                {hasApiKey && (
                  <p className="text-sm text-green-500 mt-1">API key is saved</p>
                )}
              </div>
    
              <button
                type="submit"
                className="w-full bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save API Key
              </button>
            </form>
    
            <a href="/" className="block text-center mt-4 text-blue-400 underline">
              Back to Home
            </a>
          </div>
        </main>
      );
}