import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl w-fit">
          <span className="text-primary">Shop</span>
          <span>Elite</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
