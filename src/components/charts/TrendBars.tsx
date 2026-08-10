import { Tooltip } from "antd";

export interface TrendPoint {
  date: string;
  count: number;
}

interface TrendBarsProps {
  data: TrendPoint[];
  color: string;
  dateFormatter?: (date: string) => string;
}

/** Vertical bar trend — a short (≤ ~30 point) daily series read as discrete counts,
 * not a continuous line. One series, one hue: no legend needed, the chart title
 * names it. Every bar is its own hover target (dataviz interaction default). */
export const TrendBars = ({ data, color, dateFormatter = (d) => d.slice(5) }: TrendBarsProps) => {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div>
      <div className="flex items-end gap-1 h-32">
        {data.map((point) => (
          <Tooltip key={point.date} title={`${dateFormatter(point.date)}: ${point.count}`}>
            <div className="flex-1 h-full flex items-end cursor-default">
              <div
                className="w-full rounded-t-sm min-h-[3px] transition-[height]"
                style={{ height: `${(point.count / max) * 100}%`, backgroundColor: color }}
              />
            </div>
          </Tooltip>
        ))}
      </div>
      <div className="mt-1 h-px bg-border" />
      <div className="mt-1.5 flex text-[10px] text-muted-foreground">
        <span className="flex-1 text-start">{dateFormatter(data[0]?.date ?? "")}</span>
        <span className="flex-1 text-end">{dateFormatter(data[data.length - 1]?.date ?? "")}</span>
      </div>
    </div>
  );
};
