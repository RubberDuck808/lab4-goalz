import React from "react";
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

// lines prop: [{ dataKey: "temp", color: "#ef4444", name: "Temp °C" }]
export default function LineChart({ data = [], lines = [{ dataKey: "value", color: "#22c55e", name: "Value" }] }) {
    if (!data.length) {
        return <div className="h-full w-full flex justify-center items-center text-gray-400 text-sm">No data</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 10 }} />}
                {lines.map((line) => (
                    <Line key={line.dataKey} type="monotone" dataKey={line.dataKey} stroke={line.color} name={line.name} dot={false} strokeWidth={2} />
                ))}
            </RechartsLineChart>
        </ResponsiveContainer>
    );
}
