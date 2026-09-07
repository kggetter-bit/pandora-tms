import React from "react";

export function ResponsiveContainer({ children }) {
  return <div className="pandora-chart-container">{children}</div>;
}

const bars = [42, 64, 51, 78, 58, 88, 71, 93, 68, 82];
const dots = [[12,66],[22,52],[34,72],[45,44],[57,58],[68,31],[79,47],[88,22]];

export function LineChart({ children }) { return <div className="pandora-chart line-chart"><div className="chart-grid" /><div className="line-segment s1"/><div className="line-segment s2"/><div className="line-segment s3"/><div className="line-segment s4"/>{children}</div>; }
export function BarChart({ children }) { return <div className="pandora-chart bar-chart"><div className="chart-grid"/><div className="chart-bars">{bars.map((h,i)=><i key={i} style={{height:`${h}%`}} />)}</div>{children}</div>; }
export function PieChart({ children }) { return <div className="pandora-chart pie-chart"><div className="chart-pie"><span>100%</span></div>{children}</div>; }
export function ScatterChart({ children }) { return <div className="pandora-chart scatter-chart"><div className="chart-grid"/>{dots.map(([x,y],i)=><i key={i} style={{left:`${x}%`,top:`${y}%`}}/>)}{children}</div>; }

export function Line(){ return null; }
export function XAxis(){ return null; }
export function YAxis(){ return null; }
export function CartesianGrid(){ return null; }
export function Tooltip(){ return null; }
export function Pie(){ return null; }
export function Cell(){ return null; }
export function Bar(){ return null; }
export function Legend(){ return null; }
export function Scatter(){ return null; }
export function ZAxis(){ return null; }
export function ReferenceLine(){ return null; }

