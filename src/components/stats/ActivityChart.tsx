"use client";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ActivityChart({ data }: { data: { month: string; count: number }[] }) {
  if (!data || data.length === 0) return <div className="text-center text-[#c8c4bc]/50 py-10">No activity data available</div>;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="month" 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            cursor={{ fill: '#ffffff0a' }}
            contentStyle={{ backgroundColor: '#192134', borderColor: '#ffffff1a', borderRadius: '8px', color: '#fff' }}
          />
          <Bar dataKey="count" fill="#8b3a2a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
