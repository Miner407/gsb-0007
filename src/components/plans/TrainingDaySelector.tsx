import { WEEKDAY_NAMES } from '@/types';

interface Props {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

export function TrainingDaySelector({ selectedDays, onChange }: Props) {
  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day].sort());
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {WEEKDAY_NAMES.map((name, index) => {
        const selected = selectedDays.includes(index);
        return (
          <button
            key={index}
            type="button"
            onClick={() => toggleDay(index)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[64px] ${
              selected
                ? 'bg-accent text-white shadow-glow'
                : 'bg-bg-tertiary text-text-muted hover:text-text hover:bg-bg-tertiary/80'
            }`}
          >
            {name}
          </button>
        );
      })}
    </div>
  );
}
