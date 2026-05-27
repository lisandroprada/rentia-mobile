import { ArrowLeft } from 'lucide-react';

interface TopBarProps {
  title: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

export default function TopBar({ title, onBack, action }: TopBarProps) {
  return (
    <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 safe-top">
      {onBack && (
        <button
          onClick={onBack}
          className="p-1 -ml-1 rounded-lg text-gray-600 active:bg-gray-100"
          aria-label="Volver"
        >
          <ArrowLeft size={22} />
        </button>
      )}
      <h1 className="flex-1 text-base font-semibold text-gray-900 truncate">{title}</h1>
      {action && <div>{action}</div>}
    </header>
  );
}
