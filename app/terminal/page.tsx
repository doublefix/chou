import TerminalComponent from '@/components/terminal';

export default function Home() {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="w-full max-w-4xl h-96 border rounded-lg overflow-hidden">
          <TerminalComponent />
        </div>
      </main>
    )
  }