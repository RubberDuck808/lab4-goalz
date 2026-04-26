import React from "react";
import LineChart from "./charts/LineChart";
import BarChart from "./charts/BarChart";
import PieChart from "./charts/PieChart";

export default function Chart({ color, type, title, value, data, bars, lines }) {
    const renderChart = () => {
        switch (type) {
            case "line":
                return <LineChart data={data} lines={lines} />;
            case "bar":
                return <BarChart data={data} bars={bars} />;
            case "pie":
                return <PieChart data={data} />;
            default:
                return <BarChart data={data} bars={bars} />;
        }
    };

    return (
        <div className={`bg-white p-3 grow-1 border-t-5 ${color} h-full shadow rounded-lg flex flex-col`}>
            <h6 className="text-gray-500 text-xs">{title}</h6>
            <h1 className="text-black font-bold text-lg">{value}</h1>
            <div className="grow-1 min-h-0 flex-1">
                {renderChart()}
            </div>
        </div>
    );
}
