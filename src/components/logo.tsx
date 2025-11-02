import { Scissors } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center justify-center size-10 bg-primary rounded-lg">
      <Scissors className="h-5 w-5 text-primary-foreground" />
    </div>
  );
}
