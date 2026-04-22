import React from "react";
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const COLORS = ["#22c55e", "#94a3b8", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

export default function PieChart({ data = [] }) {
    if (!data.length) {
        return <div className="h-full w-full flex justify-center items-center text-gray-400 text-sm">No data</div>;
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius="30%"
                    outerRadius="60%"
                    dataKey="value"
                >
                    {data.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
                <Legend />
            </RechartsPieChart>
        </ResponsiveContainer>
    );
}
