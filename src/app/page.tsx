import { CodeGate } from '@/components/CodeGate';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-8 bg-grid-primary/5">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#84A56833_1px,transparent_1px)] [background-size:32px_32px]"></div>
      <CodeGate />
    </main>
  );
}
