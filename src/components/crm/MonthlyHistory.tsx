import { useCrm } from '@/store/useCrm';
import { formatEuro } from '@/types/crm';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

const PRIMARY = '#4edea3';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { label: string } }>;
}

const GlassTooltip = ({ active, payload }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  const { value, payload: row } = payload[0];
  return (
    <div className="bg-[#242c27]/80 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-xl pointer-events-none">
      <p className="text-body-sm text-[#bbcabf] mb-1">{row.label}</p>
      <p className="text-lg font-semibold text-[#4edea3] tabular-nums">{formatEuro(value)}</p>
    </div>
  );
};

export const MonthlyHistory = () => {
  const { monthlyBreakdown } = useCrm();
  const chartData = monthlyBreakdown.map(m => ({
    label: m.label,
    value: Math.round(m.net_business),
  }));

  return (
    <div className="bg-[#1a211d]/40 backdrop-blur-xl border border-white/10 shadow-lg rounded-2xl p-6 flex flex-col relative overflow-hidden h-full">
      <h3 className="font-semibold text-lg text-[#dde4dd] mb-6">Andamento Storico</h3>

      {monthlyBreakdown.length === 0 ? (
        <div className="flex-1 min-h-[300px] flex items-center justify-center rounded-xl border border-dashed border-white/10">
          <p className="text-sm text-[#bbcabf]">Nessun mese disponibile.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#bbcabf' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#bbcabf' }}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<GlassTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={PRIMARY}
                strokeWidth={3}
                fill="url(#historyGradient)"
                dot={{ r: 4, fill: '#1a211d', stroke: PRIMARY, strokeWidth: 2 }}
                activeDot={{ r: 5, fill: '#1a211d', stroke: PRIMARY, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
