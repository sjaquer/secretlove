import { CodeGate } from '@/components/CodeGate';

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background">
        <ul className="circles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      <CodeGate />
    </main>
  );
}
