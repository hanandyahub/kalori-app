import { Show, SignInButton } from "@clerk/nextjs";
import { PhotoUploader } from "@/components/PhotoUploader";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-4 py-12">
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Hitung kalori dari foto 🥗
        </h1>
        <p className="text-muted-foreground max-w-md">
          Foto makananmu, biar AI yang tebak kalori & nutrisinya.
        </p>
      </div>

      <Show when="signed-in">
        <PhotoUploader />
      </Show>

      <Show when="signed-out">
        <div className="rounded-2xl border border-border bg-card p-8 text-center flex flex-col items-center gap-4">
          <p className="text-muted-foreground">
            Login dulu untuk mulai analisis foto & menyimpan riwayat kalori harianmu.
          </p>
          <SignInButton mode="modal">
            <button className="rounded-full bg-primary text-primary-foreground px-6 py-2 font-medium hover:opacity-90 transition-opacity">
              Login / Daftar
            </button>
          </SignInButton>
        </div>
      </Show>
    </main>
  );
}
