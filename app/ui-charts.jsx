import React, { Children, isValidElement } from "react";

const PALETTE = ["#3E7EE0", "#17A9C0", "#3EC775", "#F5A83C", "#9B6FD1", "#F15B71", "#6B7688"];
const role = (name) => {
  const Component = () => null;
  Component.chartRole = name;
  return Component;
};
const elements = (children, name) => Children.toArray(children).filter((child) => isValidElement(child) && child.type?.chartRole === name);
const one = (children, name) => elements(children, name)[0];
const money = (value) => `฿${Math.round(value).toLocaleString("th-TH")}`;

export function ResponsiveContainer({ children }) {
  return <div className="pandora-chart-container">{children}</div>;
}

export function LineChart({ data = [], children }) {
  const lineEls = elements(children, "line");
  const xAxis = one(children, "x-axis");
  const yAxis = one(children, "y-axis");
  const refs = elements(children, "reference-line");
  const xKey = xAxis?.props?.dataKey || "date";
  const keys = lineEls.map((line) => line.props.dataKey).filter(Boolean);
  const rawValues = data.flatMap((row) => keys.map((key) => Number(row[key]))).filter(Number.isFinite);
  const requestedDomain = yAxis?.props?.domain;
  const rawMin = rawValues.length ? Math.min(...rawValues) : 0;
  const rawMax = rawValues.length ? Math.max(...rawValues) : 100;
  const spread = Math.max(1, rawMax - rawMin);
  const min = Array.isArray(requestedDomain) && Number.isFinite(requestedDomain[0]) ? requestedDomain[0] : Math.max(0, rawMin - spread * 0.18);
  const max = Array.isArray(requestedDomain) && Number.isFinite(requestedDomain[1]) ? requestedDomain[1] : rawMax + spread * 0.18;
  const W = 760, H = 260, L = 58, R = 18, T = 28, B = 38;
  const x = (i) => L + (data.length <= 1 ? 0 : (i / (data.length - 1)) * (W - L - R));
  const y = (v) => T + ((max - Number(v)) / Math.max(1, max - min)) * (H - T - B);
  const labelIndexes = new Set(data.length <= 8 ? data.map((_, i) => i) : [0, Math.floor((data.length - 1) / 4), Math.floor((data.length - 1) / 2), Math.floor(((data.length - 1) * 3) / 4), data.length - 1]);

  return (
    <svg className="data-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="กราฟแนวโน้มข้อมูลรายวัน" preserveAspectRatio="none">
      {[0, 1, 2, 3, 4].map((step) => {
        const value = max - ((max - min) * step) / 4;
        const yy = T + ((H - T - B) * step) / 4;
        return <g key={step}><line x1={L} y1={yy} x2={W - R} y2={yy} stroke="#DCE4EE" strokeDasharray="4 5" /><text x={L - 9} y={yy + 4} textAnchor="end" fontSize="10" fill="#718096">{max > 1000 ? `${Math.round(value / 1000)}k` : value.toFixed(max <= 100 ? 1 : 0)}</text></g>;
      })}
      {refs.map((ref, i) => <g key={`ref-${i}`}><line x1={L} y1={y(ref.props.y)} x2={W - R} y2={y(ref.props.y)} stroke={ref.props.stroke || "#F15B71"} strokeDasharray="6 5" /><text x={W - R} y={y(ref.props.y) - 5} textAnchor="end" fontSize="10" fill={ref.props.stroke || "#F15B71"}>{ref.props.label?.value || `เป้าหมาย ${ref.props.y}`}</text></g>)}
      {data.map((row, i) => labelIndexes.has(i) && <text key={`x-${i}`} x={x(i)} y={H - 13} textAnchor="middle" fontSize="10" fill="#718096">{row[xKey]}</text>)}
      {lineEls.map((line, lineIndex) => {
        const color = line.props.stroke || PALETTE[lineIndex % PALETTE.length];
        const points = data.map((row, i) => `${x(i)},${y(row[line.props.dataKey])}`).join(" ");
        return <g key={line.props.dataKey}><polyline points={points} fill="none" stroke={color} strokeWidth={line.props.strokeWidth || 2.5} strokeLinejoin="round" strokeLinecap="round" />{data.map((row, i) => <circle key={i} cx={x(i)} cy={y(row[line.props.dataKey])} r="3.5" fill="#fff" stroke={color} strokeWidth="2"><title>{`${row[xKey]}: ${row[line.props.dataKey]}${max <= 100 ? "%" : ""}`}</title></circle>)}</g>;
      })}
      {lineEls.length > 1 && lineEls.map((line, i) => <g key={`legend-${line.props.dataKey}`} transform={`translate(${L + i * 150},12)`}><circle r="4" cx="4" cy="0" fill={line.props.stroke || PALETTE[i]} /><text x="13" y="4" fontSize="10" fill="#566275">{line.props.name || line.props.dataKey}</text></g>)}
    </svg>
  );
}

export function BarChart({ data = [], layout, children }) {
  const bar = one(children, "bar");
  const yAxis = one(children, "y-axis");
  const xAxis = one(children, "x-axis");
  const valueKey = bar?.props?.dataKey || "value";
  const nameKey = (layout === "vertical" ? yAxis : xAxis)?.props?.dataKey || "name";
  const values = data.map((row) => Number(row[valueKey]) || 0);
  const max = Math.max(1, ...values) * 1.12;
  const color = bar?.props?.fill || "#3E7EE0";
  const W = 760, H = 260, L = layout === "vertical" ? 145 : 50, R = 28, T = 18, B = 38;
  if (layout === "vertical") {
    const rowH = (H - T - B) / Math.max(1, data.length);
    const formatValue = (value) => Math.max(...values) <= 100 ? Number(value).toLocaleString("th-TH") : money(value);
    return <svg className="data-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="กราฟเปรียบเทียบ"><line x1={L} y1={T} x2={L} y2={H - B} stroke="#CBD5E1" />{data.map((row, i) => { const yy = T + i * rowH + rowH * .17; const bw = ((Number(row[valueKey]) || 0) / max) * (W - L - R); return <g key={i}><text x={L - 9} y={yy + rowH * .35} textAnchor="end" fontSize="10" fill="#566275">{row[nameKey]}</text><rect x={L} y={yy} width={bw} height={rowH * .56} rx="5" fill={color}><title>{`${row[nameKey]}: ${formatValue(row[valueKey])}`}</title></rect><text x={Math.min(W - 36, L + bw + 7)} y={yy + rowH * .35} fontSize="10" fill="#566275">{formatValue(row[valueKey])}</text></g>; })}</svg>;
  }
  const slot = (W - L - R) / Math.max(1, data.length);
  return <svg className="data-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="กราฟแท่งเปรียบเทียบ">{[0, 1, 2, 3, 4].map((s) => <line key={s} x1={L} y1={T + s * (H - T - B) / 4} x2={W - R} y2={T + s * (H - T - B) / 4} stroke="#E0E7EF" strokeDasharray="4 5" />)}{data.map((row, i) => { const bh = ((Number(row[valueKey]) || 0) / max) * (H - T - B); const bx = L + i * slot + slot * .18; return <g key={i}><rect x={bx} y={H - B - bh} width={slot * .64} height={bh} rx="5" fill={color}><title>{`${row[nameKey]}: ${row[valueKey]}`}</title></rect><text x={bx + slot * .32} y={H - 15} textAnchor="middle" fontSize="9" fill="#718096">{row[nameKey]}</text></g>; })}</svg>;
}

export function PieChart({ children }) {
  const pie = one(children, "pie");
  const data = pie?.props?.data || [];
  const valueKey = pie?.props?.dataKey || "value";
  const nameKey = pie?.props?.nameKey || "name";
  const cells = elements(pie?.props?.children, "cell");
  const total = Math.max(1, data.reduce((sum, row) => sum + (Number(row[valueKey]) || 0), 0));
  let cursor = 0;
  return <svg className="data-chart" viewBox="0 0 760 260" role="img" aria-label="กราฟสัดส่วน"><g transform="translate(185 130) rotate(-90)">{data.map((row, i) => { const pct = (Number(row[valueKey]) || 0) / total * 100; const offset = -cursor; cursor += pct; return <circle key={i} r="76" cx="0" cy="0" fill="none" stroke={cells[i]?.props?.fill || PALETTE[i % PALETTE.length]} strokeWidth="34" pathLength="100" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={offset}><title>{`${row[nameKey]}: ${pct.toFixed(1)}%`}</title></circle>; })}</g><circle cx="185" cy="130" r="51" fill="#fff" /><text x="185" y="126" textAnchor="middle" fontSize="21" fontWeight="700" fill="#16233D">100%</text><text x="185" y="145" textAnchor="middle" fontSize="10" fill="#718096">สัดส่วนรวม</text>{data.map((row, i) => { const pct = (Number(row[valueKey]) || 0) / total * 100; return <g key={`l-${i}`} transform={`translate(330 ${55 + i * 30})`}><rect width="11" height="11" rx="3" fill={cells[i]?.props?.fill || PALETTE[i % PALETTE.length]} /><text x="20" y="10" fontSize="11" fill="#465368">{row[nameKey]}</text><text x="390" y="10" textAnchor="end" fontSize="11" fontWeight="700" fill="#263348">{pct.toFixed(1)}%</text></g>; })}</svg>;
}

export function ScatterChart({ children }) {
  const scatter = one(children, "scatter");
  const data = scatter?.props?.data || [];
  const xs = data.map((d) => Number(d.x) || 0), ys = data.map((d) => Number(d.y) || 0);
  const minX = Math.min(...xs, 0), maxX = Math.max(...xs, 1), minY = Math.min(...ys, 0), maxY = Math.max(...ys, 100);
  const px = (v) => 58 + ((v - minX) / Math.max(1, maxX - minX)) * 670;
  const py = (v) => 220 - ((v - minY) / Math.max(1, maxY - minY)) * 185;
  return <svg className="data-chart" viewBox="0 0 760 260" role="img" aria-label="กราฟความสัมพันธ์ต้นทุนและผลงาน">{[0,1,2,3,4].map((i)=><line key={i} x1="58" y1={35+i*46} x2="728" y2={35+i*46} stroke="#E0E7EF" strokeDasharray="4 5"/>)}{data.map((d,i)=><g key={i}><circle cx={px(d.x)} cy={py(d.y)} r="8" fill={scatter?.props?.fill || PALETTE[0]} opacity=".85"><title>{`${d.name}: ต้นทุน ${money(d.x)}, คะแนน ${d.y}`}</title></circle><text x={px(d.x)+11} y={py(d.y)+4} fontSize="9" fill="#566275">{d.name}</text></g>)}</svg>;
}

export const Line = role("line");
export const XAxis = role("x-axis");
export const YAxis = role("y-axis");
export const CartesianGrid = role("grid");
export const Tooltip = role("tooltip");
export const Pie = role("pie");
export const Cell = role("cell");
export const Bar = role("bar");
export const Legend = role("legend");
export const Scatter = role("scatter");
export const ZAxis = role("z-axis");
export const ReferenceLine = role("reference-line");
