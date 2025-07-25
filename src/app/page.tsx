import { CodeGate } from '@/components/CodeGate';
import { AquariumBackground } from '@/components/AquariumBackground';

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center p-8 overflow-hidden">
      <AquariumBackground />
      <CodeGate />
    </main>
  );
}
