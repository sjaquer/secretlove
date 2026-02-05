import { CodeGate } from '@/components/CodeGate';
import { AquariumBackground } from '@/components/AquariumBackground';

export default function Home() {
  return (
    <main className="relative flex h-screen w-full flex-col items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden">
      <AquariumBackground />
      <CodeGate />
    </main>
  );
}
