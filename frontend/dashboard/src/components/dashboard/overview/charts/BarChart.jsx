import React from "react";
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

// bars prop: [{ dataKey: "value", color: "#22c55e", name: "Count" }]
export default function BarChart({ data = [], bars = [{ dataKey: "value", color: "#22c55e", name: "Value" }] }) {
    if (!data.length) {
        return <div className="h-full w-full flex justify-center items-center text-gray-400 text-sm">No data</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 10 }} />}
                {bars.map((bar) => (
                    <Bar key={bar.dataKey} dataKey={bar.dataKey} fill={bar.color} name={bar.name} radius={[3, 3, 0, 0]} />
                ))}
            </RechartsBarChart>
        </ResponsiveContainer>
    );
}
