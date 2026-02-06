export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Board.Africa
        </h1>
        <p className="text-xl text-center text-muted-foreground">
          Africa's Leading Platform for Board Excellence & Corporate Governance
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Board Management</h2>
            <p className="text-sm text-muted-foreground">
              Streamline board operations with digital meeting management
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Talent Marketplace</h2>
            <p className="text-sm text-muted-foreground">
              Connect with board-ready professionals across Africa
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Governance Training</h2>
            <p className="text-sm text-muted-foreground">
              Enhance board effectiveness with expert-led courses
            </p>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-green-600 font-semibold">
            ✓ Project initialized successfully!
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
          </p>
        </div>
      </div>
    </main>
  )
}
