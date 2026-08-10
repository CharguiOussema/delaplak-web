import { Tooltip } from "antd";

export interface BarListItem {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface BarListProps {
  items: BarListItem[];
  valueFormatter?: (value: number) => string;
  emptyLabel?: string;
}

/** Horizontal bar list — the right form for "compare a handful of named categories"
 * (order status, products by category, users by role): identity (the label) and
 * magnitude (the bar) both read directly, no axis needed. Each row carries its own
 * direct label, so color never has to carry meaning alone. */
export const BarList = ({ items, valueFormatter = (v) => String(v), emptyLabel }: BarListProps) => {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-sm text-charcoal" title={item.label}>
            {item.label}
          </span>
          <Tooltip title={`${item.label}: ${valueFormatter(item.value)}`}>
            <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-[width]"
                style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color }}
              />
            </div>
          </Tooltip>
          <span className="w-12 shrink-0 text-end text-sm font-medium tabular-nums">{valueFormatter(item.value)}</span>
        </div>
      ))}
    </div>
  );
};
