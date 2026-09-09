"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Truck, PackageSearch, Route, Radio, Wifi, WifiOff, CheckCircle2, Clock,
  PlusCircle, Edit3, Save, RefreshCw, LayoutGrid, X, ClipboardList,
  ArrowRight, Star, MapPinned, Navigation, Users, Car, Camera, FileCheck,
  Undo2, DollarSign, Wrench, AlertTriangle, Gauge, Calendar, ShieldCheck,
  Award, TrendingUp, TrendingDown, Boxes, Warehouse, Fuel, UserCircle,
  Bell, FileText, Link2, MessageSquare, Filter, ChevronRight, Smartphone, QrCode, XCircle,
} from "./ui-icons";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, ScatterChart, Scatter, ZAxis,
  ReferenceLine,
} from "./ui-charts";

/* ================================================================== */
/* HELPERS                                                              */
/* ================================================================== */

let randomSeed = 260708;
const random = () => { randomSeed = (randomSeed * 1664525 + 1013904223) % 4294967296; return randomSeed / 4294967296; };
const rand = (min, max) => Math.floor(random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const loadLocalState = () => {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(window.localStorage.getItem("pandora-tms-linked-v2")); } catch { return null; }
};

/* ================================================================== */
/* DATA — standalone demo data (in a real deployment this comes from   */
/* the WMS via API instead of being generated locally)                 */
/* ================================================================== */

const AREAS = ["กรุงเทพฯ & นนทบุรี", "ภาคกลาง", "ภาคตะวันออก", "ภาคเหนือ", "ภาคใต้", "ภาคอีสาน"];

// Real district/sub-district names per region — used to give orders a concrete delivery address
const DISTRICT_POOL = {
  "กรุงเทพฯ & นนทบุรี": [
    { subdistrict: "ลาดพร้าว", district: "เขตลาดพร้าว", province: "กรุงเทพฯ" },
    { subdistrict: "จตุจักร", district: "เขตจตุจักร", province: "กรุงเทพฯ" },
    { subdistrict: "บางนา", district: "เขตบางนา", province: "กรุงเทพฯ" },
    { subdistrict: "ห้วยขวาง", district: "เขตห้วยขวาง", province: "กรุงเทพฯ" },
    { subdistrict: "คลองตันเหนือ", district: "เขตวัฒนา", province: "กรุงเทพฯ" },
    { subdistrict: "หัวหมาก", district: "เขตบางกะปิ", province: "กรุงเทพฯ" },
    { subdistrict: "บางขุนเทียน", district: "เขตบางขุนเทียน", province: "กรุงเทพฯ" },
    { subdistrict: "ตลาดขวัญ", district: "อ.เมืองนนทบุรี", province: "นนทบุรี" },
    { subdistrict: "บางกร่าง", district: "อ.เมืองนนทบุรี", province: "นนทบุรี" },
    { subdistrict: "บางบัวทอง", district: "อ.บางบัวทอง", province: "นนทบุรี" },
  ],
  "ภาคกลาง": [
    { subdistrict: "หอรัตนไชย", district: "อ.พระนครศรีอยุธยา", province: "พระนครศรีอยุธยา" },
    { subdistrict: "ปากเพรียว", district: "อ.เมืองสระบุรี", province: "สระบุรี" },
    { subdistrict: "ท่าหิน", district: "อ.เมืองลพบุรี", province: "ลพบุรี" },
    { subdistrict: "บ้านกล้วย", district: "อ.เมืองสุพรรณบุรี", province: "สุพรรณบุรี" },
    { subdistrict: "บางปลาม้า", district: "อ.บางปลาม้า", province: "สุพรรณบุรี" },
  ],
  "ภาคตะวันออก": [
    { subdistrict: "บางปลาสร้อย", district: "อ.เมืองชลบุรี", province: "ชลบุรี" },
    { subdistrict: "หนองปรือ", district: "อ.บางละมุง", province: "ชลบุรี" },
    { subdistrict: "เชิงเนิน", district: "อ.เมืองระยอง", province: "ระยอง" },
    { subdistrict: "วังใหม่", district: "อ.เมืองจันทบุรี", province: "จันทบุรี" },
    { subdistrict: "วังกระแจะ", district: "อ.เมืองตราด", province: "ตราด" },
  ],
  "ภาคเหนือ": [
    { subdistrict: "ช้างคลาน", district: "อ.เมืองเชียงใหม่", province: "เชียงใหม่" },
    { subdistrict: "รอบเวียง", district: "อ.เมืองเชียงราย", province: "เชียงราย" },
    { subdistrict: "หัวเวียง", district: "อ.เมืองลำปาง", province: "ลำปาง" },
    { subdistrict: "ในเมือง", district: "อ.เมืองพิษณุโลก", province: "พิษณุโลก" },
    { subdistrict: "เวียงยอง", district: "อ.เมืองลำพูน", province: "ลำพูน" },
  ],
  "ภาคอีสาน": [
    { subdistrict: "ในเมือง", district: "อ.เมืองขอนแก่น", province: "ขอนแก่น" },
    { subdistrict: "ในเมือง", district: "อ.เมืองนครราชสีมา", province: "นครราชสีมา" },
    { subdistrict: "หมากแข้ง", district: "อ.เมืองอุดรธานี", province: "อุดรธานี" },
    { subdistrict: "ในเมือง", district: "อ.เมืองอุบลราชธานี", province: "อุบลราชธานี" },
    { subdistrict: "ในเมือง", district: "อ.เมืองมหาสารคาม", province: "มหาสารคาม" },
  ],
  "ภาคใต้": [
    { subdistrict: "หาดใหญ่", district: "อ.หาดใหญ่", province: "สงขลา" },
    { subdistrict: "บางกุ้ง", district: "อ.เมืองสุราษฎร์ธานี", province: "สุราษฎร์ธานี" },
    { subdistrict: "ตลาดใหญ่", district: "อ.เมืองภูเก็ต", province: "ภูเก็ต" },
    { subdistrict: "ท่าวัง", district: "อ.เมืองนครศรีธรรมราช", province: "นครศรีธรรมราช" },
    { subdistrict: "เขานิเวศน์", district: "อ.เมืองระนอง", province: "ระนอง" },
  ],
};
function pickAddress(area) {
  const pool = DISTRICT_POOL[area] || DISTRICT_POOL["กรุงเทพฯ & นนทบุรี"];
  const loc = pick(pool);
  const houseNo = `${rand(1, 299)}/${rand(1, 40)}`;
  return { ...loc, address: `${houseNo} ถ.${pick(["สุขุมวิท", "พหลโยธิน", "รัชดาภิเษก", "เพชรเกษม", "มิตรภาพ", "เอเชีย"])} ต.${loc.subdistrict} ${loc.district} จ.${loc.province}` };
}

const AREA_TO_ZONE = {
  "กรุงเทพฯ & นนทบุรี": "BKK", "ภาคกลาง": "Central", "ภาคตะวันออก": "East",
  "ภาคเหนือ": "North", "ภาคอีสาน": "NE", "ภาคใต้": "South",
};

const VEHICLE_TYPES = [
  { id: "VH-4W", name: "รถกระบะ 4 ล้อ", maxCube: 8, maxWeight: 1500, baseCost: 1800, costPerKm: 12 },
  { id: "VH-4WBOX", name: "รถตู้ 4 ล้อ (ตู้ทึบ)", maxCube: 14, maxWeight: 2500, baseCost: 2200, costPerKm: 14 },
  { id: "VH-6W", name: "รถบรรทุก 6 ล้อ", maxCube: 32, maxWeight: 8000, baseCost: 3500, costPerKm: 18 },
  { id: "VH-10W", name: "รถบรรทุก 10 ล้อ", maxCube: 55, maxWeight: 15000, baseCost: 5200, costPerKm: 24 },
];
const VEHICLE_ICON_TYPE = { "VH-4W": "รถกระบะ", "VH-4WBOX": "รถ 4 ล้อ", "VH-6W": "รถ 6 ล้อ", "VH-10W": "รถ 10 ล้อ" };

const ROUTE_INFO = {
  "กรุงเทพฯ & นนทบุรี": { distanceKm: 25 }, "ภาคกลาง": { distanceKm: 120 }, "ภาคตะวันออก": { distanceKm: 180 },
  "ภาคเหนือ": { distanceKm: 650 }, "ภาคใต้": { distanceKm: 750 }, "ภาคอีสาน": { distanceKm: 450 },
};

// --- Real geography for the Route Map (source: Google Places) ---
const HQ_COORD = { lat: 13.8360905, lng: 100.6296759, name: "SYNNEX (Thailand) PCL. — HQ", address: "433 ถ.สุคนธสวัสดิ์ ลาดพร้าว กรุงเทพฯ 10230" };
const ZONE_COORDS = {
  BKK: { lat: 13.7606541, lng: 100.565567, place: "IT City (Fortune Town)" },
  Central: { lat: 14.3692, lng: 100.5877, place: "อยุธยา" },
  East: { lat: 13.3596123, lng: 100.9881355, place: "Advice ชลบุรี" },
  North: { lat: 18.7966942, lng: 98.9811943, place: "JIB เชียงใหม่" },
  NE: { lat: 16.4288314, lng: 102.8315328, place: "Banana ขอนแก่น" },
  South: { lat: 7.0028768, lng: 100.4625294, place: "หาดใหญ่คอมพิวเตอร์" },
};
function projectLatLng(lat, lng) {
  const x = ((lng - 97) / (105.5 - 97)) * 400;
  const y = ((20.5 - lat) / (20.5 - 5.5)) * 600;
  return { x, y };
}

// --- Real Thailand map (actual boundary, embedded directly — no runtime fetch) ---
// Artifacts render in a sandboxed iframe that blocks fetch() to third-party domains like
// GitHub, so the boundary is bundled as static data instead of fetched at runtime.
// [lng, lat] pairs, real simplified national boundary.
const THAILAND_BOUNDARY = [[102.5849,12.1866],[101.6872,12.6457],[100.8318,12.6271],[100.9785,13.4127],[100.0978,13.4069],[100.0187,12.307],[99.4789,10.8464],[99.1538,9.9631],[99.2224,9.2393],[99.8738,9.2079],[100.2796,8.2952],[100.4593,7.4296],[101.0173,6.8569],[101.6231,6.7406],[102.1412,6.2216],[101.8143,5.8108],[101.1542,5.6914],[101.0755,6.2049],[100.2596,6.6428],[100.0858,6.4645],[99.6907,6.8482],[99.5196,7.3435],[98.9883,7.908],[98.5038,8.3823],[98.3397,7.7945],[98.15,8.35],[98.2592,8.9739],[98.5536,9.933],[99.0381,10.9605],[99.5873,11.8928],[99.1964,12.8047],[99.212,13.2693],[99.0978,13.8275],[98.4308,14.622],[98.1921,15.1237],[98.5374,15.3085],[98.9033,16.1778],[98.4938,16.8378],[97.8591,17.5679],[97.3759,18.4454],[97.7978,18.6271],[98.2537,19.7082],[98.9597,19.753],[99.5433,20.1866],[100.116,20.4179],[100.5489,20.1092],[100.6063,19.5083],[101.282,19.4626],[101.0359,18.4089],[101.0595,17.5125],[102.1136,18.1091],[102.413,17.9328],[102.9987,17.9617],[103.2002,18.3096],[103.9565,18.241],[104.7169,17.4289],[104.7793,16.4419],[105.589,15.5703],[105.5443,14.7239],[105.2188,14.2732],[104.2814,14.4167],[102.9884,14.2257],[102.3481,13.3942],[102.5849,12.1866]];
function RealThailandMap({ width = 400, height = 520, children }) {
  const lngs = THAILAND_BOUNDARY.map(([lng]) => lng);
  const lats = THAILAND_BOUNDARY.map(([, lat]) => lat);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const pad = 14;
  const project = (lat, lng) => ({
    x: pad + ((lng - minLng) / (maxLng - minLng)) * (width - pad * 2),
    y: height - pad - ((lat - minLat) / (maxLat - minLat)) * (height - pad * 2),
  });
  const boundaryPath = THAILAND_BOUNDARY.map(([lng, lat], index) => {
    const point = project(lat, lng);
    return `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`;
  }).join(" ") + " Z";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ background: "#EAF4FB", borderRadius: 10 }}>
      <path d={boundaryPath} fill="#DCEFE1" stroke="var(--teal)" strokeWidth="1.3" />
      {children(project)}
    </svg>
  );
}

// Truck icon set — a distinct silhouette per vehicle type/size (bigger vehicle = wider box +
// more wheels drawn), usable standalone or nested inside another <svg> via x/y.
function TruckIconSVG({ type, size = 24, color = "currentColor", x = 0, y = 0 }) {
  const s = { fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  let content, vb = "0 0 24 22";
  switch (type) {
    case "รถมอเตอร์ไซค์ (Last Mile)":
      vb = "0 0 22 22";
      content = (<>
        <circle cx="6" cy="17" r="2.4" {...s} /><circle cx="17" cy="17" r="2.4" {...s} />
        <path d="M8 17h6l2-6h3M15 17l-3-7H8" {...s} />
      </>);
      break;
    case "รถกระบะ":
      content = (<>
        <path d="M2 17h1a2 2 0 004 0h8a2 2 0 004 0h1v-5h-4l-2-4H9L4 11H2z" {...s} />
        <circle cx="7" cy="17" r="1.8" {...s} /><circle cx="17" cy="17" r="1.8" {...s} />
      </>);
      break;
    case "รถ 6 ล้อ":
      vb = "0 0 28 22";
      content = (<>
        <path d="M1 17h1a2 2 0 004 0h13a2 2 0 004 0h1v-6h-5l-2-4H8L3 11H1z" {...s} />
        <circle cx="6" cy="17" r="1.7" {...s} /><circle cx="20" cy="17" r="1.7" {...s} /><circle cx="23" cy="17" r="1.7" {...s} />
      </>);
      break;
    case "รถ 10 ล้อ":
      vb = "0 0 32 22";
      content = (<>
        <path d="M1 17h1a2 2 0 004 0h17a2 2 0 004 0h1v-6h-6l-2-4H9L3 11H1z" {...s} />
        <circle cx="6" cy="17" r="1.7" {...s} /><circle cx="23" cy="17" r="1.7" {...s} /><circle cx="26" cy="17" r="1.7" {...s} /><circle cx="29" cy="17" r="1.7" {...s} />
      </>);
      break;
    case "รถบรรทุก 18 ล้อ":
      vb = "0 0 38 22";
      content = (<>
        <path d="M1 17h1a2 2 0 004 0h6" {...s} />
        <path d="M13 17h13" {...s} />
        <path d="M26 17a2 2 0 004 0h1v-6h-5l-2-4h-6v10" {...s} />
        <circle cx="6" cy="17" r="1.7" {...s} /><circle cx="29" cy="17" r="1.7" {...s} /><circle cx="32" cy="17" r="1.7" {...s} /><circle cx="35" cy="17" r="1.7" {...s} />
      </>);
      break;
    case "รถตู้เย็น":
      vb = "0 0 28 22";
      content = (<>
        <path d="M1 17h1a2 2 0 004 0h13a2 2 0 004 0h1v-6h-6l-2-4H8L3 11H1z" {...s} />
        <path d="M9 8v9M14 8v9M19 8v9" stroke={color} strokeWidth="0.8" opacity="0.5" />
        <circle cx="6" cy="17" r="1.7" {...s} /><circle cx="20" cy="17" r="1.7" {...s} /><circle cx="23" cy="17" r="1.7" {...s} />
      </>);
      break;
    default: // รถ 4 ล้อ / generic van
      content = (<>
        <path d="M2 17h1a2 2 0 004 0h9a2 2 0 004 0h1v-6h-3l-2-3H9L5 11H2z" {...s} />
        <circle cx="7" cy="17" r="1.8" {...s} /><circle cx="17" cy="17" r="1.8" {...s} />
      </>);
  }
  return <svg x={x} y={y} width={size} height={size * 0.62} viewBox={vb} style={{ overflow: "visible" }}>{content}</svg>;
}
// real great-circle distance (km) between two zones — used to detect when a manually
// combined group spans routes that genuinely diverge (e.g. North vs South)
function zoneDistanceKm(zoneA, zoneB) {
  if (zoneA === zoneB) return 0;
  const a = ZONE_COORDS[zoneA], b = ZONE_COORDS[zoneB];
  if (!a || !b) return 0;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)));
}
// classify how compatible a set of routes is for combining into one truck/trip
function routeCompatibility(areas) {
  const zones = [...new Set(areas.map((a) => AREA_TO_ZONE[a] || "BKK"))];
  if (zones.length <= 1) return { level: "same", maxDistanceKm: 0, worstPair: null, zones };
  let maxDistanceKm = 0, worstPair = null;
  for (let i = 0; i < zones.length; i++) {
    for (let j = i + 1; j < zones.length; j++) {
      const d = zoneDistanceKm(zones[i], zones[j]);
      if (d > maxDistanceKm) { maxDistanceKm = d; worstPair = [zones[i], zones[j]]; }
    }
  }
  const level = maxDistanceKm > 500 ? "diverging" : maxDistanceKm > 150 ? "mixed" : "adjacent";
  return { level, maxDistanceKm, worstPair, zones };
}

// Builds a real Google Maps embed (no API key required) showing driving directions HQ → stop1 → stop2 ...
function buildDirectionsUrl(stops) {
  const saddr = `${HQ_COORD.lat},${HQ_COORD.lng}`;
  const daddr = stops.map((s) => `${s.lat},${s.lng}`).join("+to:");
  return `https://www.google.com/maps?output=embed&saddr=${encodeURIComponent(saddr)}&daddr=${encodeURIComponent(daddr)}`;
}
function buildGoogleMapsLink(stop) {
  const origin = `${HQ_COORD.lat},${HQ_COORD.lng}`;
  const destination = `${stop.lat},${stop.lng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
}
function GoogleMapEmbed({ stops, height = 420 }) {
  if (!stops.length) return null;
  return (
    <iframe
      title="route-map"
      src={buildDirectionsUrl(stops)}
      width="100%" height={height}
      style={{ border: 0, borderRadius: 10 }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

function GoogleLiveMap({ stops, height = 380 }) {
  const [selectedPlace, setSelectedPlace] = useState(stops[0]?.place);
  const selected = stops.find((stop) => stop.place === selectedPlace) || stops[0];
  if (!selected) return null;
  return (
    <div className="google-live-map">
      <GoogleMapEmbed stops={[selected]} height={height} />
      <div className="google-map-toolbar">
        <div className="google-map-stops" aria-label="เลือกปลายทางบนแผนที่">
          {stops.map((stop) => (
            <button key={stop.place} className={selected.place === stop.place ? "active" : ""} onClick={() => setSelectedPlace(stop.place)}>
              <MapPinned size={13} /> {stop.place}
            </button>
          ))}
        </div>
        <a href={buildGoogleMapsLink(selected)} target="_blank" rel="noreferrer">เปิดใน Google Maps ↗</a>
      </div>
    </div>
  );
}

// --- Named test batches for exercising Allocate Truck/Trip/Box logic ---
function makeBatch(name, desc, specs) {
  const platforms = ["Lazada", "Shopee", "TikTok Shop", "B2B"];
  const out = [];
  let n = 1;
  specs.forEach(([area, count, cubeMin, cubeMax]) => {
    for (let i = 0; i < count; i++) {
      const loc = pickAddress(area);
      out.push({
        id: `BAT-${name.slice(0, 2)}${String(100 + n).padStart(3, "0")}`,
        platform: pick(platforms),
        customer: pick(["คุณสมชาย", "IT City", "คุณนภา", "Advice PC", "คุณกิตติ", "JIB Computer", "คุณวรรณา", "Banana IT"]),
        area, subdistrict: loc.subdistrict, district: loc.district, province: loc.province, address: loc.address,
        origin: random() < 0.65 ? "MDC" : "TKS",
        items: rand(1, 6), cube: +(rand(cubeMin * 100, cubeMax * 100) / 100).toFixed(2),
        status: "รอจัดสรร", date: "2569-07-08", slot: pick(["12:00", "16:00"]),
      });
      n++;
    }
  });
  return { name, desc, orders: out };
}
const ORDER_BATCHES = [
  makeBatch("ชุด 1", "วันธรรมดา กทม+ปริมณฑล — Order เยอะ Cube เล็ก เหมาะทดสอบ Parcel", [["กรุงเทพฯ & นนทบุรี", 14, 0.03, 0.15]]),
  makeBatch("ชุด 2", "B2B ก้อนใหญ่ 1 ลูกค้า ภาคอีสาน — ต้องใช้รถหลายเที่ยว (Multi-Truck)", [["ภาคอีสาน", 6, 3, 6]]),
  makeBatch("ชุด 3", "กระจายทั่วประเทศ (Multi-Region) — ทดสอบ Allocate ทีละสาย", [
    ["กรุงเทพฯ & นนทบุรี", 5, 0.1, 0.4], ["ภาคกลาง", 4, 0.1, 0.4], ["ภาคตะวันออก", 4, 0.1, 0.4],
    ["ภาคเหนือ", 4, 0.1, 0.4], ["ภาคอีสาน", 4, 0.1, 0.4], ["ภาคใต้", 4, 0.1, 0.4],
  ]),
  makeBatch("ชุด 4", "Peak Day เทศกาลลดราคา ทั่วประเทศ — ปริมาณสูงสุด", [
    ["กรุงเทพฯ & นนทบุรี", 12, 0.1, 0.5], ["ภาคกลาง", 8, 0.1, 0.5], ["ภาคตะวันออก", 8, 0.1, 0.5],
    ["ภาคเหนือ", 6, 0.2, 0.8], ["ภาคอีสาน", 6, 0.2, 0.8], ["ภาคใต้", 5, 0.2, 0.8],
  ]),
  makeBatch("ชุด 5", "Order เบาบางกระจายไกล — Parcel คุ้มกว่าชัดเจน", [
    ["ภาคเหนือ", 3, 0.02, 0.06], ["ภาคใต้", 3, 0.02, 0.06], ["ภาคอีสาน", 3, 0.02, 0.06],
  ]),
];

// Real rate data — source: MDC_TKS_Dashboard_Q1_2569.xlsx
// Sheet "อัตรา_Territory" — charter (เหมาเที่ยว) rates, BKK+Metro
const TERRITORY_RATES = {
  MDC: [
    { territory: "HQ, advice, JIB", price: 1200 }, { territory: "A7,N6,N9,P1,S5,S6,S7,S8,W1,W3,W7", price: 1300 },
    { territory: "E1,E5,E3,E4,E6,N4,N5", price: 1250 }, { territory: "N1,N2,N3,N7,N8,N10", price: 1400 },
    { territory: "E2", price: 1100 }, { territory: "A5", price: 1750 },
    { territory: "E7,E8,E9,F1,S1", price: 1050 }, { territory: "S3,S4,S9", price: 1350 }, { territory: "TKS", price: 1600 },
  ],
  TKS: [
    { territory: "AD,A7,E8,F1,N3,N4,N7,P1,S1,W1", price: 1400 }, { territory: "E1,E2,E3,N6,HQ", price: 1600 },
    { territory: "JIB", price: 1500 }, { territory: "A5", price: 2050 }, { territory: "A5 ", price: 2000 },
    { territory: "N10", price: 1550 }, { territory: "S3,S4,S8,S9", price: 1050 },
  ],
};
// Q1 2569 average ฿/trip, BKK+Metro (MDC: 1,593,100÷1,241 เที่ยว · TKS: 854,300÷573 เที่ยว)
const CHARTER_AVG_TRIP = { MDC: 1284, TKS: 1491 };

// Sheet "DHL_Rate_Card" — parcel (รายกล่อง) rates by weight bracket × zone
const DHL_ZONES = ["BKK", "Central", "East", "North", "NE", "South"];
const DHL_BRACKETS = [
  { label: "0 – 3,000 g", max: 3000, MDC: [33, 33, 33, 44, 44, 48], TKS: [73, 73, 73, 84, 84, 88] },
  { label: "3,001 – 5,000 g", max: 5000, MDC: [33, 33, 33, 44, 44, 59], TKS: [73, 73, 73, 84, 84, 99] },
  { label: "5,001 – 10,000 g", max: 10000, MDC: [44, 44, 44, 52, 52, 76], TKS: [84, 84, 84, 92, 92, 116] },
  { label: "10,001 – 15,000 g", max: 15000, MDC: [65, 65, 65, 88, 88, 111], TKS: [105, 105, 105, 128, 128, 151] },
  { label: "15,001 – 20,000 g", max: 20000, MDC: [76, 76, 76, 99, 99, 133], TKS: [116, 116, 116, 139, 139, 173] },
  { label: "20,001 – 25,000 g", max: 25000, MDC: [133, 133, 133, 190, 190, 152], TKS: [173, 173, 173, 230, 230, 192] },
  { label: "25,001 – 30,000 g", max: 30000, MDC: [152, 152, 152, 228, 228, 171], TKS: [192, 192, 192, 268, 268, 211] },
  { label: "30,001 – 100,000 g", max: 100000, MDC: [258, 258, 258, 312, 431, 526], TKS: [298, 298, 298, 352, 471, 566] },
];
const OVER_100KG_SURCHARGE = { MDC: 30, TKS: 5 };
const CUBE_TO_GRAM = 150000;

function dhlRate(carrier, zoneKey, weightG) {
  const zi = DHL_ZONES.indexOf(zoneKey);
  if (zi === -1) return 0;
  if (weightG > 100000) {
    const base = DHL_BRACKETS[DHL_BRACKETS.length - 1][carrier][zi];
    return Math.round(base + ((weightG - 100000) / 1000) * OVER_100KG_SURCHARGE[carrier]);
  }
  const bracket = DHL_BRACKETS.find((b) => weightG <= b.max) || DHL_BRACKETS[DHL_BRACKETS.length - 1];
  return bracket[carrier][zi];
}

// display name only — internal data keys stay MDC/TKS to match the source workbook's sheet structure
const CARRIER_LABEL = { MDC: "SYNNEX HQ", TKS: "TKS" };

// representative product catalog for order → product mapping display (standalone demo data)
const PRODUCTS = [
  { name: "Notebook ASUS Vivobook 15 X1504" }, { name: "SSD Kingston NV2 1TB NVMe" },
  { name: "Router TP-Link Archer AX55" }, { name: "Monitor LG 24MP60G-B 24\"" },
  { name: "RAM Corsair Vengeance 16GB DDR5" }, { name: "UPS APC BX950MI-MS" },
  { name: "เมาส์ Logitech M331 Silent" }, { name: "Printer Canon G3010" },
  { name: "Webcam Logitech C270 HD" }, { name: "External HDD Seagate 2TB" },
];
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function productFor(orderId) { return PRODUCTS[hashStr(orderId) % PRODUCTS.length]; }
function packTrucks(orders, truckCap = 8) {
  const trucks = [];
  let current = { orders: [], cube: 0 };
  orders.forEach((o) => {
    if (current.orders.length > 0 && current.cube + o.cube > truckCap) { trucks.push(current); current = { orders: [], cube: 0 }; }
    current.orders.push(o); current.cube += o.cube;
  });
  if (current.orders.length) trucks.push(current);
  return trucks;
}

function genTripHistory() {
  const monthDays = { "05": 31, "06": 30, "07": 4 };
  const out = [];
  let n = 1;
  Object.entries(monthDays).forEach(([mo, days]) => {
    for (let d = 1; d <= days; d++) {
      const dateStr = `2569-${mo}-${String(d).padStart(2, "0")}`;
      if (rand(0, 9) === 0) continue;
      const tripsToday = rand(2, 6);
      for (let i = 0; i < tripsToday; i++) {
        const route = pick(AREAS);
        const mode = random() < 0.62 ? "FTL" : "Parcel";
        const carrier = pick(["MDC", "TKS"]);
        const orders = mode === "FTL" ? rand(5, 30) : rand(1, 8);
        const cube = mode === "FTL" ? +(rand(300, 4800) / 100).toFixed(2) : +(rand(5, 60) / 100).toFixed(2);
        let cost;
        if (mode === "FTL") {
          if (route === "กรุงเทพฯ & นนทบุรี") {
            const trucks = Math.max(1, Math.ceil(cube / 8));
            cost = trucks * CHARTER_AVG_TRIP[carrier];
          } else {
            const distanceKm = ROUTE_INFO[route]?.distanceKm || 100;
            const base = 1800 + distanceKm * 15;
            cost = carrier === "TKS" ? base * 1.167 : base;
          }
        } else {
          const zoneKey = AREA_TO_ZONE[route];
          cost = orders * dhlRate(carrier, zoneKey, (cube / orders) * CUBE_TO_GRAM);
        }
        out.push({ id: `TRIP-H${String(1000 + n).padStart(4, "0")}`, date: dateStr, route, mode, carrier, orders, cube, cost: Math.round(cost), status: "Delivered" });
        n++;
      }
    }
  });
  return out;
}

const TRIPS_INIT = [
  ...genTripHistory(),
  { id: "TRIP-9001", date: "2569-07-05", route: "กรุงเทพฯ & นนทบุรี", mode: "FTL", carrier: "MDC", orders: 8, cube: 5.2, cost: 1284, status: "Delivered" },
  { id: "TRIP-9002", date: "2569-07-06", route: "ภาคกลาง", mode: "FTL", carrier: "MDC", orders: 22, cube: 28.4, cost: 5660, status: "Delivered" },
  { id: "TRIP-9003", date: "2569-07-07", route: "ภาคตะวันออก", mode: "Parcel", carrier: "TKS", orders: 6, cube: 1.8, cost: 522, status: "Delivered" },
  { id: "TRIP-9004", date: "2569-07-08", route: "ภาคอีสาน", mode: "FTL", carrier: "MDC", orders: 31, cube: 48.0, cost: 15980, status: "In Transit" },
  { id: "TRIP-9005", date: "2569-07-08", route: "ภาคเหนือ", mode: "FTL", carrier: "TKS", orders: 17, cube: 24.1, cost: 15300, status: "Confirmed" },
];

function genOrders() {
  const platforms = ["Lazada", "Shopee", "TikTok Shop", "B2B"];
  const statuses = ["รอจัดสรร", "กำลังแพ็ค", "จัดส่งแล้ว", "สำเร็จ"];
  const customers = ["คุณสมชาย", "IT City", "คุณนภา", "Advice PC", "คุณกิตติ", "JIB Computer", "คุณวรรณา", "Banana IT", "คุณอนุชา", "SIS Distribution", "คุณปิยะ", "Com7"];
  // per-area profile: [minCount,maxCount, minCube,maxCube] — BKK skews many-small-parcels, upcountry skews fewer-but-bigger (FTL-friendly)
  const areaProfile = {
    "กรุงเทพฯ & นนทบุรี": [10, 22, 0.02, 0.18],
    "ภาคกลาง": [5, 12, 0.08, 0.7],
    "ภาคตะวันออก": [4, 10, 0.1, 1.3],
    "ภาคเหนือ": [3, 8, 0.3, 2.8],
    "ภาคอีสาน": [3, 9, 0.3, 3.2],
    "ภาคใต้": [2, 6, 0.4, 3.6],
  };
  const out = [];
  let n = 1;
  for (let d = 1; d <= 31; d++) {
    const day = `2569-07-${String(d).padStart(2, "0")}`;
    const boost = d % 7 === 0 ? 1.6 : d % 5 === 0 ? 1.25 : d % 3 === 0 ? 0.6 : 1;
    AREAS.forEach((area) => {
      const [cMin, cMax, cubeMin, cubeMax] = areaProfile[area];
      const count = Math.max(1, Math.round(rand(cMin, cMax) * boost));
      for (let i = 0; i < count; i++) {
        const loc = pickAddress(area);
        out.push({
          id: `ORD-${String(30000 + n).padStart(6, "0")}`,
          platform: pick(platforms), customer: pick(customers), area,
          subdistrict: loc.subdistrict, district: loc.district, province: loc.province, address: loc.address,
          origin: random() < 0.65 ? "MDC" : "TKS",
          items: rand(1, 8), cube: +(rand(cubeMin * 100, cubeMax * 100) / 100).toFixed(2),
          status: d < 8 ? "สำเร็จ" : d === 8 ? "รอจัดสรร" : pick(statuses), date: day,
          slot: pick(["09:00", "12:00", "16:00", "19:00"]),
        });
        n++;
      }
    });
  }
  return out;
}

function dominantOrigin(orders) {
  const counts = {};
  orders.forEach((o) => { counts[o.origin] = (counts[o.origin] || 0) + 1; });
  const keys = Object.keys(counts);
  const origin = keys.sort((a, b) => counts[b] - counts[a])[0] || "MDC";
  return { origin, mixed: keys.length > 1, counts };
}

// Cost of FTL vs Parcel FROM A FIXED ORIGIN (the origin is a fact — where the stock physically
// sits — not a choice to compare; only MDC's rate card or TKS's rate card applies, never both).
function computeModeOptions(orders, origin, route, extraDistanceKm = 0) {
  const totalCube = +orders.reduce((a, o) => a + o.cube, 0).toFixed(2);
  const totalWeightKg = Math.round(totalCube * 150);
  const zoneKey = AREA_TO_ZONE[route] || "BKK";
  const isBkkMetro = zoneKey === "BKK";
  const distanceKm = (ROUTE_INFO[route]?.distanceKm || 100) + extraDistanceKm;
  const sortedVeh = [...VEHICLE_TYPES].sort((a, b) => a.maxCube - b.maxCube);

  let ftl;
  if (isBkkMetro) {
    const trucks = Math.max(1, Math.ceil(totalCube / 8));
    const detourSurcharge = extraDistanceKm > 0 ? Math.round(extraDistanceKm * 15) : 0;
    const cubePerTruck = totalCube / trucks;
    const vehicleType = cubePerTruck <= 3 ? "รถกระบะ" : cubePerTruck <= 8 ? "รถ 6 ล้อ" : "รถ 10 ล้อ";
    ftl = { mode: "FTL", cost: Math.round(trucks * CHARTER_AVG_TRIP[origin]) + detourSurcharge, trucks, vehicleType, real: true, note: detourSurcharge > 0 ? `รวมค่าอ้อมเส้นทางเพิ่ม ~฿${detourSurcharge.toLocaleString()}` : "เฉลี่ยจริง Q1/2569 · อัตรา Territory" };
  } else {
    let v = sortedVeh.find((x) => x.maxCube >= totalCube && x.maxWeight >= totalWeightKg);
    let trucks = 1;
    if (!v) { v = sortedVeh[sortedVeh.length - 1]; trucks = Math.max(1, Math.ceil(totalCube / v.maxCube)); }
    const base = Math.round(trucks * (v.baseCost + v.costPerKm * distanceKm));
    const cost = origin === "TKS" ? Math.round(base * 1.167) : base;
    ftl = { mode: "FTL", cost, trucks, vehicle: v, vehicleType: VEHICLE_ICON_TYPE[v.id] || "รถ 6 ล้อ", real: false, note: extraDistanceKm > 0 ? `รวมระยะทางอ้อมเพิ่ม +${extraDistanceKm} กม. จากการรวมเส้นทาง` : "ประมาณการ (ไม่มี Rate Card สำหรับโซนนี้)" };
  }
  const parcel = { mode: "Parcel", cost: orders.reduce((a, o) => a + dhlRate(origin, zoneKey, o.cube * CUBE_TO_GRAM), 0), trucks: 1, real: true };
  const all = [ftl, parcel];
  const best = all[0].cost <= all[1].cost ? all[0] : all[1];
  return { totalCube, totalWeightKg, distanceKm, zoneKey, isBkkMetro, all, best };
}

function simulateRoute(orders, route) {
  const { origin, mixed } = dominantOrigin(orders);
  const opt = computeModeOptions(orders, origin, route);
  const trucks = packTrucks(orders, 8);
  return { ...opt, origin, mixedOrigin: mixed, numOrders: orders.length, orders, trucks };
}

// Same cost-comparison engine as simulateRoute, but for an arbitrary hand-picked set of orders
// (possibly spanning more than one route) — used by the Manual Dispatch panel. Also detects
// when combined routes genuinely diverge (e.g. North + South) and prices in the detour, plus
// shows what it would have cost to dispatch each route separately for comparison.
function evaluateGroup(selectedOrders) {
  if (!selectedOrders.length) return null;
  const areaCounts = {};
  selectedOrders.forEach((o) => { areaCounts[o.area] = (areaCounts[o.area] || 0) + 1; });
  const routesInvolved = Object.keys(areaCounts);
  const dominantArea = routesInvolved.sort((a, b) => areaCounts[b] - areaCounts[a])[0];
  const mixedRoutes = routesInvolved.length > 1;
  const { origin, mixed: mixedOrigin } = dominantOrigin(selectedOrders);
  const compat = routeCompatibility(routesInvolved);
  const extraDistanceKm = mixedRoutes ? compat.maxDistanceKm : 0;
  const opt = computeModeOptions(selectedOrders, origin, dominantArea, extraDistanceKm);
  const trucks = packTrucks(selectedOrders, 8);

  let splitCostTotal = null;
  if (mixedRoutes) {
    splitCostTotal = routesInvolved.reduce((sum, area) => {
      const subOrders = selectedOrders.filter((o) => o.area === area);
      const subOrigin = dominantOrigin(subOrders).origin;
      const subOpt = computeModeOptions(subOrders, subOrigin, area, 0);
      return sum + subOpt.best.cost;
    }, 0);
  }

  return { ...opt, origin, mixedOrigin, numOrders: selectedOrders.length, dominantArea, mixedRoutes, routesInvolved, compat, splitCostTotal, orders: selectedOrders, trucks };
}

// Shared booking action for both the auto-simulation and the standalone Manual Dispatch page —
// keeps the trip-creation logic in one place even though the two pages are now separate.
function bookDispatch({ ev, mode, vendor, date, route, isManual, trips, setTrips, setOrders, setShipments, vehicles, addLog }) {
  const routeLabel = ev.mixedRoutes ? `${ev.dominantArea} (+อื่นๆ)` : (route || ev.dominantArea);
  const chosen = ev.all.find((o) => o.mode === mode);
  if (mode === "FTL") {
    const availableVehicles = vehicles.filter((v) => v.status === "Active");
    const newTrips = ev.trucks.map((truck, i) => {
      const veh = availableVehicles.length ? availableVehicles[i % availableVehicles.length] : null;
      return {
        id: `TRIP-${rand(9100, 9999)}`, date, route: routeLabel, mode: "FTL", carrier: vendor, origin: ev.origin,
        orders: truck.orders.length, cube: +truck.cube.toFixed(2),
        cost: Math.round(chosen.cost / ev.trucks.length), status: "Requested", manual: isManual,
        vehicleId: veh?.id || null, orderIds: truck.orders.map((o) => o.id),
        orderDetails: truck.orders.map((o) => ({ id: o.id, customer: o.customer, cube: o.cube, product: productFor(o.id).name })),
      };
    });
    setTrips((list) => [...newTrips, ...list]);
    const tripByOrder = new Map(newTrips.flatMap((trip) => trip.orderIds.map((id) => [id, trip])));
    setOrders((list) => list.map((order) => tripByOrder.has(order.id) ? { ...order, status: "จัดรถแล้ว", tripId: tripByOrder.get(order.id).id } : order));
    setShipments((list) => {
      const existing = new Set(list.map((shipment) => shipment.orderId));
      const updated = list.map((shipment) => {
        const trip = tripByOrder.get(shipment.orderId);
        return trip ? { ...shipment, status: "Carrier Assigned", carrier: vendor, serviceType: "FTL", tripId: trip.id, vehicleId: trip.vehicleId, consolidated: trip.orderIds.length > 1 } : shipment;
      });
      const added = ev.orders.filter((order) => !existing.has(order.id)).map((order, index) => { const trip = tripByOrder.get(order.id); return { id: `SHP-${Date.now()}-${index}`, direction: "Outbound", orderId: order.id, customer: order.customer, area: order.area, cube: order.cube, serviceType: "FTL", carrier: vendor, priority: "Normal", status: "Carrier Assigned", consolidated: trip.orderIds.length > 1, split: false, tripId: trip.id, vehicleId: trip.vehicleId }; });
      return [...added, ...updated];
    });
    addLog(`${isManual ? "[Manual] " : ""}จัดรถ ${vendorName(vendor)} (FTL) · ต้นทาง ${CARRIER_LABEL[ev.origin]} · สาย ${routeLabel} — แบ่ง ${newTrips.length} เที่ยว · ต้นทุน ฿${chosen.cost.toLocaleString()}`);
    return { tripIds: newTrips.map((t) => t.id), mode, vendor, cost: chosen.cost, count: ev.numOrders };
  }
  const trip = {
    id: `TRIP-${rand(9100, 9999)}`, date, route: routeLabel, mode: "Parcel", carrier: vendor, origin: ev.origin,
    orders: ev.numOrders, cube: ev.totalCube, cost: chosen.cost, status: "Requested", manual: isManual,
    vehicleId: null, orderIds: ev.orders.map((o) => o.id),
    orderDetails: ev.orders.map((o) => ({ id: o.id, customer: o.customer, cube: o.cube, product: productFor(o.id).name })),
  };
  setTrips((list) => [trip, ...list]);
  const bookedIds = new Set(trip.orderIds);
  setOrders((list) => list.map((order) => bookedIds.has(order.id) ? { ...order, status: "จัดรถแล้ว", tripId: trip.id } : order));
  setShipments((list) => {
    const existing = new Set(list.map((shipment) => shipment.orderId));
    const updated = list.map((shipment) => bookedIds.has(shipment.orderId) ? { ...shipment, status: "Carrier Assigned", carrier: vendor, serviceType: "PARCEL", tripId: trip.id, vehicleId: null } : shipment);
    const added = ev.orders.filter((order) => !existing.has(order.id)).map((order, index) => ({ id: `SHP-${Date.now()}-${index}`, direction: "Outbound", orderId: order.id, customer: order.customer, area: order.area, cube: order.cube, serviceType: "PARCEL", carrier: vendor, priority: "Normal", status: "Carrier Assigned", consolidated: false, split: false, tripId: trip.id, vehicleId: null }));
    return [...added, ...updated];
  });
  addLog(`${isManual ? "[Manual] " : ""}จัดรถ ${vendorName(vendor)} (Parcel) · ต้นทาง ${CARRIER_LABEL[ev.origin]} · สาย ${routeLabel} — ต้นทุน ฿${chosen.cost.toLocaleString()}`);
  return { tripIds: [trip.id], mode, vendor, cost: chosen.cost, count: ev.numOrders };
}

/* ================================================================== */
/* TOR-03 DATA MODEL — Service Types, Carrier Directory, Vehicles,     */
/* Drivers, Shipments, Slots, Cost Types, Integrations                 */
/* ================================================================== */

// --- 3.4 Service Type Selection (10 types) ---
const SERVICE_TYPES = [
  { id: "FTL", name: "Full Truck Load (FTL) — เหมาคัน", desc: "เหมารถ 1 คันทั้งคัน จากต้นทางเดียวไปปลายทางเดียว", rule: "น้ำหนัก ≥70% ของรถ หรือ CBM ≥80%" },
  { id: "LTL", name: "Less Than Truck Load (LTL) — ร่วมบรรทุก", desc: "รวมสินค้าหลาย Shipper ในรถเดียวกัน คิดตามน้ำหนัก/CBM", rule: "น้ำหนัก <70% ของรถ / ไม่คุ้มเหมาคัน" },
  { id: "PARCEL", name: "Parcel / Express — รายกล่อง", desc: "ส่งรายกล่องผ่าน Carrier พร้อม Tracking Number", rule: "≤3 กล่อง หรือ ≤30kg / SLA ≤24 ชม." },
  { id: "DEDICATED", name: "Dedicated Fleet — รถบริษัทประจำ", desc: "ใช้รถ/คนขับของ SYNNEX เองหรือ Dedicated Contract", rule: "Route ประจำ / ลูกค้า Key Account" },
  { id: "LASTMILE", name: "Last-Mile Delivery — ส่งปลายทาง", desc: "ส่งถึงบ้าน/ออฟฟิศ รองรับ Time-window", rule: "B2C / E-Commerce Order" },
  { id: "SAMEDAY", name: "Same-Day Delivery", desc: "ส่งภายในวันที่รับ Order ตาม Cut-off", rule: "Order ก่อน 12:00 น. / Radius ≤50 กม." },
  { id: "NEXTDAY", name: "Next-Day Delivery", desc: "ส่งวันถัดไป ผ่าน Express Carrier", rule: "Order หลัง 12:00 น. หรือ Radius >50 กม." },
  { id: "APPOINTMENT", name: "Scheduled / Appointment Delivery", desc: "จัดส่งตามวันเวลานัดหมายกับลูกค้า", rule: "ลูกค้า B2B ขนาดใหญ่ / Modern Trade" },
  { id: "MULTIDROP", name: "Multi-Drop / Milk Run", desc: "รถ 1 คันส่งสินค้าหลายจุดในเส้นทางเดียว", rule: "Order <500kg ต่อ Stop / พื้นที่ใกล้กัน" },
  { id: "RETURNPICKUP", name: "Return Pickup", desc: "รถออกไปรับสินค้าคืนจากลูกค้า / Return Drop Point", rule: "Return Request จาก OMS/ลูกค้า" },
];
function recommendServiceType({ weightKg, cubeCbm, truckCapCbm = 32, boxCount, radiusKm, orderHour, hasAppointment, isReturn, isMilkRun }) {
  if (isReturn) return "RETURNPICKUP";
  if (hasAppointment) return "APPOINTMENT";
  if (isMilkRun) return "MULTIDROP";
  if (boxCount <= 3 || weightKg <= 30) return "PARCEL";
  const util = cubeCbm / truckCapCbm;
  if (util >= 0.8 || weightKg >= 0.7 * 8000) return "FTL";
  if (orderHour < 12 && radiusKm <= 50) return "SAMEDAY";
  if (orderHour >= 12 || radiusKm > 50) return "NEXTDAY";
  return "LTL";
}

// --- 3.3.1 / 8.4 Carrier Directory (Carrier Master + API integration list) ---
const CARRIER_DIRECTORY = [
  { id: "KERRY", name: "Kerry Express", type: "Parcel", apiPriority: "สูง", serviceArea: "ทั่วประเทศ", fleet: "-", contact: "02-xxx-xxxx" },
  { id: "FLASH", name: "Flash Express", type: "Parcel", apiPriority: "สูง", serviceArea: "ทั่วประเทศ", fleet: "-", contact: "02-xxx-xxxx" },
  { id: "JNT", name: "J&T Express", type: "Parcel", apiPriority: "สูง", serviceArea: "ทั่วประเทศ", fleet: "-", contact: "02-xxx-xxxx" },
  { id: "SCG", name: "SCG Logistics", type: "FTL/LTL", apiPriority: "สูง", serviceArea: "ทั่วประเทศ", fleet: "180 คัน", contact: "02-xxx-xxxx" },
  { id: "DHL", name: "DHL Thailand", type: "Parcel/International", apiPriority: "ปานกลาง", serviceArea: "ทั่วประเทศ + ระหว่างประเทศ", fleet: "-", contact: "02-xxx-xxxx" },
  { id: "NIM", name: "Nim Express", type: "Regional", apiPriority: "ปานกลาง", serviceArea: "ภาคกลาง+ตะวันออก", fleet: "40 คัน", contact: "02-xxx-xxxx" },
  { id: "SYNFLEET", name: "รถบริษัทซินเน็ค (Dedicated Fleet)", type: "Dedicated", apiPriority: "สูง", serviceArea: "ทั่วประเทศ", fleet: "24 คัน", contact: "Internal" },
  { id: "MDC", name: "SYNNEX HQ (MDC)", type: "FTL/Parcel", apiPriority: "สูง", serviceArea: "กทม+ปริมณฑล+ทั่วประเทศ", fleet: "Contract", contact: "02-553-8899" },
  { id: "TKS", name: "TKS", type: "FTL/Parcel", apiPriority: "สูง", serviceArea: "กทม+ปริมณฑล+ทั่วประเทศ", fleet: "Contract", contact: "02-xxx-xxxx" },
];
const FTL_VENDORS = CARRIER_DIRECTORY.filter((c) => c.type.includes("FTL") || c.type.includes("Dedicated"));
function vendorName(id) { return CARRIER_LABEL[id] || CARRIER_DIRECTORY.find((c) => c.id === id)?.name || id; }
const PARCEL_VENDORS = CARRIER_DIRECTORY.filter((c) => c.type.includes("Parcel") || c.type.includes("Regional"));

// --- 4.1 Carrier KPI weights ---
const CARRIER_KPI_WEIGHTS = [
  { key: "onTimePickup", label: "On-Time Pickup Rate (Inbound)", weight: 15 },
  { key: "onTimeArrival", label: "On-Time Arrival (Inbound)", weight: 10 },
  { key: "onTimeDelivery", label: "On-Time Delivery Rate (Outbound)", weight: 25 },
  { key: "inFull", label: "In-Full Delivery Rate", weight: 20 },
  { key: "otif", label: "OTIF Score", weight: 20 },
  { key: "damageInv", label: "Damage Rate (กลับด้าน — ยิ่งต่ำยิ่งดี)", weight: 10 },
];
function gradeOf(score) { return score >= 90 ? "A" : score >= 75 ? "B" : score >= 60 ? "C" : "D"; }
const GRADE_ACTION = {
  A: { label: "Preferred Carrier", action: "ให้ Priority ในการ Rate Shopping, เสนอ Contract Volume เพิ่ม", color: "var(--success)" },
  B: { label: "Approved Carrier", action: "ใช้งานปกติ, ติดตาม Trend", color: "var(--amber)" },
  C: { label: "Warning", action: "แจ้งเตือนเป็นลายลักษณ์อักษร, กำหนด Action Plan ภายใน 30 วัน", color: "var(--orange)" },
  D: { label: "Probation / Suspend", action: "ระงับการใช้งานชั่วคราว / ยกเลิกสัญญา", color: "var(--danger)" },
};
function genCarrierScorecards() {
  return CARRIER_DIRECTORY.map((c) => {
    const onTimePickup = +(90 + random() * 9).toFixed(1);
    const onTimeArrival = +(88 + random() * 10).toFixed(1);
    const onTimeDelivery = +(85 + random() * 14).toFixed(1);
    const inFull = +(92 + random() * 7.8).toFixed(1);
    const otif = +(Math.min(onTimeDelivery, inFull) - random() * 3).toFixed(1);
    const damageRate = +(random() * 3).toFixed(2);
    const podCompletion = +(90 + random() * 9.5).toFixed(1);
    const damageInv = Math.max(0, 100 - damageRate * 12);
    const metrics = { onTimePickup, onTimeArrival, onTimeDelivery, inFull, otif, damageInv };
    const totalW = CARRIER_KPI_WEIGHTS.reduce((a, k) => a + k.weight, 0);
    const score = +(CARRIER_KPI_WEIGHTS.reduce((a, k) => a + metrics[k.key] * k.weight, 0) / totalW).toFixed(1);
    const avgCost = c.type.includes("Parcel") ? rand(35, 70) : rand(1300, 5500);
    return { ...c, ...metrics, damageRate, podCompletion, score, grade: gradeOf(score), avgCost };
  });
}
const CARRIER_SCORECARDS = genCarrierScorecards();

// --- 3.7 Vehicle & Driver Management ---
const VEHICLE_CATALOG_TYPES = ["รถกระบะ", "รถ 4 ล้อ", "รถ 6 ล้อ", "รถ 10 ล้อ", "รถบรรทุก 18 ล้อ", "รถตู้เย็น", "รถมอเตอร์ไซค์ (Last Mile)"];
function genFleet() {
  const owners = ["SYNNEX Fleet", "MDC", "TKS"];
  const vehicles = [];
  for (let i = 1; i <= 14; i++) {
    vehicles.push({
      id: `VH-${String(1000 + i)}`, plate: `${pick(["1กก", "2ขข", "3คค", "4งง"])}-${rand(1000, 9999)}`,
      type: pick(VEHICLE_CATALOG_TYPES), owner: pick(owners),
      capacityKg: rand(1200, 16000), status: pick(["Active", "Active", "Active", "Maintenance", "Idle"]),
      nextPM: `2569-${String(rand(7, 9)).padStart(2, "0")}-${String(rand(1, 28)).padStart(2, "0")}`,
      fuelCostPerKm: +(rand(6, 14)).toFixed(1),
    });
  }
  return vehicles;
}
const VEHICLES_INIT = genFleet();
function genDrivers() {
  const names = ["สมชาย ใจดี", "วิชัย รุ่งเรือง", "ประยุทธ์ ขยันงาน", "อนุชา สายเดินทาง", "ธีระ มั่นคง", "กิตติ ตรงเวลา", "สมพงษ์ ปลอดภัย", "ณรงค์ ไวเสมอ"];
  return names.map((name, i) => ({
    id: `DR-${String(100 + i)}`, name, license: `TH-${rand(100000, 999999)}`,
    experienceYears: rand(1, 15), onTimeRate: +(88 + random() * 11).toFixed(1),
    podRate: +(90 + random() * 9.5).toFixed(1), rating: +(3.8 + random() * 1.2).toFixed(1),
    speedingIncidents: rand(0, 3), status: pick(["On Duty", "On Duty", "Off Duty", "On Trip"]),
  }));
}
const DRIVERS_INIT = genDrivers();

// --- 3.1 Shipment Management (lifecycle) ---
const SHIPMENT_STATUSES = ["Draft", "Planned", "Carrier Assigned", "Dispatched", "In-Transit", "Delivered", "Exception"];
function genShipments(orders) {
  return orders.filter((o) => o.date === "2569-07-08").map((o, i) => ({
    id: `SHP-${String(5000 + i)}`, direction: "Outbound", orderId: o.id, customer: o.customer, area: o.area,
    cube: o.cube, serviceType: pick(["FTL", "LTL", "PARCEL", "LASTMILE", "MULTIDROP"]),
    carrier: null,
    priority: pick(["Normal", "Normal", "Normal", "VIP"]),
    status: "Draft", consolidated: false, split: false, tripId: null, vehicleId: null,
  }));
}

// --- 3.6 Slot Booking ---
function genSlots(kind, n) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    out.push({
      id: `${kind.slice(0, 2).toUpperCase()}-SLOT-${String(200 + i)}`,
      date: `2569-07-${String(rand(8, 14)).padStart(2, "0")}`, time: pick(["08:00", "09:30", "11:00", "13:00", "14:30", "16:00"]),
      dock: `Dock-${rand(1, 4)}`, party: kind === "inbound" ? pick(["ASUSTeK", "Western Digital", "Logitech Regional", "TP-Link Thailand"]) : kind === "outbound" ? pick(["MDC", "TKS", "Kerry Express", "SCG Logistics"]) : pick(["IT City", "Advice PC", "JIB Computer", "Banana IT"]),
      status: pick(["Confirmed", "Confirmed", "Pending", "Late/No-Show"]),
    });
  }
  return out;
}
const SLOTS_INIT = { inbound: genSlots("inbound", 6), outbound: genSlots("outbound", 6), customer: genSlots("customer", 5) };

// --- 3.9 POD ---
const NON_DELIVERY_REASONS = ["ลูกค้าไม่อยู่", "ที่อยู่ผิด", "ปฏิเสธรับ", "สินค้าเสียหาย", "อื่นๆ"];
function genPODs() {
  const out = [];
  for (let i = 1; i <= 18; i++) {
    const delivered = random() < 0.88;
    out.push({
      id: `POD-${String(7000 + i)}`, shipmentId: `SHP-${String(5000 + rand(0, 23))}`,
      delivered, receiver: delivered ? pick(["คุณสมชาย", "คุณนภา", "เจ้าหน้าที่หน้าร้าน", "รปภ."]) : "-",
      reason: delivered ? "-" : pick(NON_DELIVERY_REASONS),
      podTimeMin: delivered ? rand(2, 40) : null, timestamp: `2569-07-${String(rand(1, 8)).padStart(2, "0")} ${rand(9, 18)}:${String(rand(0, 59)).padStart(2, "0")}`,
    });
  }
  return out;
}
const PODS_INIT = genPODs();

// --- 5. Returns Management ---
const RETURN_TYPES = [
  { id: "REFUSED", name: "Refused Delivery", cause: "ลูกค้าไม่รับ / ไม่อยู่ / ที่อยู่ผิด / เกินนัด" },
  { id: "EXCEPTION", name: "Delivery Exception", cause: "สินค้าเสียหายระหว่างขนส่ง / ขาดจำนวน" },
  { id: "RMA", name: "Customer Return (RMA)", cause: "ลูกค้าขอคืนหลังรับสินค้า ตาม Return Policy" },
  { id: "WHRETURN", name: "Warehouse Return", cause: "ส่งคืนสินค้าระหว่างคลัง (ข้อผิดพลาดใน Fulfillment)" },
];
function genReturns() {
  const out = [];
  for (let i = 1; i <= 14; i++) {
    const type = pick(RETURN_TYPES);
    out.push({
      id: `RET-${String(3000 + i)}`, type: type.id, typeName: type.name, carrier: pick(["MDC", "TKS", "KERRY", "FLASH"]),
      area: pick(AREAS), cost: rand(80, 900), resolutionHours: rand(6, 96),
      status: pick(["รับเรื่อง", "กำลังรับคืน", "ถึงคลังแล้ว", "ปิดเคส"]),
      claimStatus: type.id === "EXCEPTION" ? pick(["เปิด Claim", "รอ Carrier ตอบกลับ", "อนุมัติชดใช้", "ปิด Claim"]) : "-",
    });
  }
  return out;
}
const RETURNS_INIT = genReturns();

// --- 7.1 Cost types ---
const COST_TYPES = [
  { id: "base", label: "Base Freight Rate", pct: [0.72, 0.82] },
  { id: "fuel", label: "Fuel Surcharge", pct: [0.06, 0.09] },
  { id: "toll", label: "Toll Fee", pct: [0.02, 0.04] },
  { id: "remote", label: "Remote Area Surcharge", pct: [0.02, 0.06] },
  { id: "cod", label: "COD Handling Fee", pct: [0.01, 0.03] },
  { id: "returnCost", label: "Return Cost", pct: [0.01, 0.03] },
  { id: "slotFee", label: "Appointment / Slot Fee", pct: [0.005, 0.015] },
  { id: "overtime", label: "Overtime / Weekend", pct: [0.005, 0.02] },
  { id: "damageClaim", label: "Damage Claim", pct: [0.005, 0.02] },
];
function splitCost(totalCost) {
  const raw = COST_TYPES.map((c) => ({ id: c.id, label: c.label, amount: totalCost * (c.pct[0] + random() * (c.pct[1] - c.pct[0])) }));
  const sum = raw.reduce((a, r) => a + r.amount, 0);
  return raw.map((r) => ({ ...r, amount: Math.round((r.amount / sum) * totalCost) }));
}
function genInvoices(trips) {
  return trips.slice(0, 30).map((t, i) => {
    const expected = t.cost;
    const variance = random() < 0.75 ? 0 : Math.round(expected * (random() * 0.12 - 0.02));
    const actual = expected + variance;
    return {
      id: `INV-${String(8000 + i)}`, tripId: t.id, carrier: t.carrier, date: t.date,
      expected, actual, variance: actual - expected,
      status: actual === expected ? "ตรงกัน" : Math.abs(actual - expected) / expected > 0.05 ? "Dispute" : "รอตรวจสอบ",
    };
  });
}

// --- 8. System Integration ---
const INTEGRATIONS_INIT = [
  { id: "WMS", name: "WMS (Bidirectional)", desc: "PO/Shipment Request/ETA/POD ↔ WMS", protocol: "REST + Webhook", status: "Online" },
  { id: "ERP", name: "ERP", desc: "PO, Sales Order, GR, AP/GL Posting", protocol: "REST API", status: "Online" },
  { id: "OMS", name: "OMS", desc: "Order Confirmed, Tracking Status, Return Request", protocol: "REST + Webhook", status: "Online" },
  { id: "KERRY_API", name: "Kerry Express API", desc: "Book Shipment, Label, Track, POD", protocol: "REST API", status: "Online" },
  { id: "FLASH_API", name: "Flash Express API", desc: "Book Shipment, Label, Track, POD", protocol: "REST API", status: "Online" },
  { id: "JNT_API", name: "J&T Express API", desc: "Book Shipment, Label, Track", protocol: "REST API", status: "Offline" },
  { id: "SCG_API", name: "SCG Logistics API", desc: "FTL/LTL Booking, Track, POD, Invoice", protocol: "REST API", status: "Online" },
  { id: "DHL_API", name: "DHL Thailand API", desc: "International+Domestic, Track, POD", protocol: "REST API", status: "Online" },
  { id: "GPS", name: "GPS / Telematics", desc: "iFleet / Teltonika / Jointech — Live Position ทุก 30 วินาที", protocol: "GPS API", status: "Online" },
  { id: "NOTIFY", name: "Customer Notification", desc: "SMS / Email / LINE Notify / Webhook", protocol: "Gateway API", status: "Online" },
];

const NAV = [
  { header: "COMMAND CENTER", items: [
      { id: "controltower", label: "Control Tower", icon: LayoutGrid },
    ]
  },
  { header: "ภาพรวม", items: [
      { id: "dashboard", label: "Report & Dashboard ต้นทุนขนส่ง", icon: LayoutGrid },
      { id: "otif", label: "OTIF & KPI Dashboard", icon: Gauge },
      { id: "cost", label: "ต้นทุน & Invoice Reconciliation", icon: DollarSign },
    ]
  },
  { header: "Inbound / Outbound", items: [
      { id: "sync", label: "เชื่อมต่อ WMS & รับ Order", icon: Radio },
      { id: "shipments", label: "Shipment Management", icon: Boxes },
      { id: "slots", label: "Slot Booking (In/Out/Customer)", icon: Calendar },
    ]
  },
  { header: "การขนส่ง", items: [
      { id: "fleet", label: "รถ & คนขับ (Vehicle/Driver)", icon: Car },
      { id: "servicetype", label: "เลือกรูปแบบบริการ (Service Type)", icon: Filter },
      { id: "simulation", label: "Simulation จัดรถ & เรียกรถ", icon: Route },
      { id: "manualdispatch", label: "จัดรถ Manual (ตรวจสอบเส้นทาง)", icon: ClipboardList },
      { id: "allocation", label: "การจัดสรร Order → รถ/เที่ยว", icon: ClipboardList },
      { id: "routeopt", label: "Route Optimization (Multi-Drop)", icon: Navigation },
      { id: "map", label: "แผนที่เส้นทาง (Route Map)", icon: MapPinned },
      { id: "track", label: "Track & Trace (GPS)", icon: Navigation },
      { id: "driverapp", label: "Driver App (มือถือคนขับ)", icon: Smartphone },
      { id: "pod", label: "Proof of Delivery (POD)", icon: Camera },
    ]
  },
  { header: "ผู้ขนส่ง", items: [
      { id: "carriers", label: "Rate Card (SYNNEX HQ / TKS)", icon: Truck },
      { id: "scorecard", label: "Carrier Master & Scorecard", icon: Award },
    ]
  },
  { header: "คุณภาพบริการ", items: [{ id: "returns", label: "Returns Management", icon: Undo2 }] },
  { header: "ระบบ", items: [{ id: "integration", label: "System Integration", icon: Link2 }] },
];

/* ================================================================== */
/* SHARED UI                                                            */
/* ================================================================== */

function Modal({ onClose, children, width = 480 }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <X className="close" size={18} onClick={onClose} />
        {children}
      </div>
    </div>
  );
}

const chartTip = { contentStyle: { background: "#FFFFFF", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 } };

/* ================================================================== */
/* APP                                                                  */
/* ================================================================== */

export default function App() {
  const [storageReady, setStorageReady] = useState(false);
  const [view, setView] = useState("controltower");
  const [operatingDate, setOperatingDate] = useState("2569-07-08");
  const [now, setNow] = useState(new Date());
  const [orders, setOrders] = useState(genOrders);
  const [trips, setTrips] = useState(TRIPS_INIT);
  const [log, setLog] = useState([{ t: new Date(), text: "เชื่อมต่อกับ WMS สำเร็จ — ดึงข้อมูล Order เดือนกรกฎาคม 2569" }]);
  const [lastSync, setLastSync] = useState(new Date());
  const [online, setOnline] = useState(true);
  const [shipments, setShipments] = useState(() => genShipments(orders));
  const [slots, setSlots] = useState(SLOTS_INIT);
  const [pods, setPods] = useState(PODS_INIT);
  const [returns, setReturns] = useState(RETURNS_INIT);
  const [vehicles] = useState(VEHICLES_INIT);
  const [drivers] = useState(DRIVERS_INIT);
  const [invoices, setInvoices] = useState(() => genInvoices(TRIPS_INIT));

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const saved = loadLocalState();
    if (saved) {
      if (saved.orders) setOrders(saved.orders);
      if (saved.trips) setTrips(saved.trips);
      if (saved.shipments) setShipments(saved.shipments);
      if (saved.pods) setPods(saved.pods);
      if (saved.returns) setReturns(saved.returns);
      if (saved.invoices) setInvoices(saved.invoices);
    }
    setStorageReady(true);
  }, []);
  useEffect(() => {
    if (!storageReady) return;
    try { window.localStorage.setItem("pandora-tms-linked-v2", JSON.stringify({ orders, trips, shipments, pods, returns, invoices })); } catch { /* storage may be unavailable in private mode */ }
  }, [storageReady, orders, trips, shipments, pods, returns, invoices]);

  const addLog = (text) => setLog((l) => [{ t: new Date(), text }, ...l].slice(0, 30));

  const syncNow = () => {
    setLastSync(new Date());
    addLog("Sync ข้อมูล Order จาก WMS สำเร็จ — รักษาเลข Order และสถานะการจัดรถที่เชื่อมโยงไว้ครบถ้วน");
  };

  const ctx = { orders, setOrders, trips, setTrips, addLog, shipments, setShipments, slots, setSlots, pods, setPods, returns, setReturns, vehicles, drivers, invoices, setInvoices, setView, operatingDate, setOperatingDate };
  const flatNav = NAV.flatMap((g) => g.items);
  const currentTitle = flatNav.find((n) => n.id === view)?.label;

  return (
    <div className="wms-app">
      <GlobalStyle />
      <aside className="sidebar">
        <div className="brand">
          <svg viewBox="0 0 100 100" width="34" height="34">
            <polygon points="50,8 88,26 50,44 12,26" fill="#1c1c1c" stroke="#E6C766" strokeWidth="3" strokeLinejoin="round" />
            <polygon points="12,26 50,44 50,92 12,74" fill="#0a0a0a" stroke="#E6C766" strokeWidth="3" strokeLinejoin="round" />
            <polygon points="50,44 88,26 88,74 50,92" fill="#141414" stroke="#E6C766" strokeWidth="3" strokeLinejoin="round" />
            <line x1="50" y1="8" x2="50" y2="44" stroke="#E6C766" strokeWidth="1.5" opacity="0.6" />
            <text x="30" y="72" fontFamily="Space Grotesk, sans-serif" fontWeight="800" fontSize="30" fill="#F0C75E">P</text>
          </svg>
          <div className="brand-text">
            <div className="t1">PANDORA TMS</div>
            <div className="t2">ระบบบริหารการขนส่ง · เชื่อมต่อ WMS</div>
          </div>
        </div>
        <nav className="navlist">
          {NAV.map((g) => (
            <div key={g.header}>
              <div className="nav-group-header">{g.header}</div>
              {g.items.map((n) => (
                <div key={n.id} className={`navitem ${view === n.id ? "active" : ""}`} onClick={() => setView(n.id)}>
                  <n.icon size={16} /><span>{n.label}</span>
                </div>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="lbl">WMS Connection</div>
          <div className="val" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {online ? <Wifi size={13} /> : <WifiOff size={13} />} {online ? "Online" : "Offline"}
          </div>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div>
            <div className="topbar-kicker">TRANSPORT MANAGEMENT SYSTEM</div>
            <h1>{currentTitle}</h1>
          </div>
          <div className="topbar-right">
            <div className="ai-pill" onClick={() => setOnline((o) => !o)} style={{ cursor: "pointer" }}>
              <span className="dot" /> {online ? "WMS Sync Active" : "WMS Disconnected"}
            </div>
            <div className="clock">{now.toLocaleTimeString("th-TH")}</div>
          </div>
        </div>
        <div className="content">
          {["sync", "simulation", "manualdispatch", "allocation", "shipments", "track", "driverapp", "pod"].includes(view) && <WorkflowRail {...ctx} />}
          {view === "controltower" && <TmsControlTower trips={trips} vehicles={vehicles} setView={setView} />}
          {view === "dashboard" && <TmsDashboard trips={trips} orders={orders} log={log} vehicles={vehicles} />}
          {view === "sync" && <TmsSync orders={orders} online={online} lastSync={lastSync} syncNow={syncNow} />}
          {view === "shipments" && <TmsShipments {...ctx} />}
          {view === "slots" && <TmsSlots {...ctx} />}
          {view === "simulation" && <TmsSimulation {...ctx} />}
          {view === "manualdispatch" && <TmsManualDispatch {...ctx} />}
          {view === "allocation" && <TmsAllocationBoard {...ctx} />}
          {view === "servicetype" && <TmsServiceType />}
          {view === "routeopt" && <TmsRouteOptimization orders={orders} />}
          {view === "map" && <TmsRouteMap orders={orders} />}
          {view === "track" && <TmsTrackTrace {...ctx} />}
          {view === "fleet" && <TmsFleet {...ctx} />}
          {view === "pod" && <TmsPOD {...ctx} />}
          {view === "driverapp" && <TmsDriverApp {...ctx} />}
          {view === "carriers" && <TmsCarrierMaster />}
          {view === "scorecard" && <TmsScorecard />}
          {view === "otif" && <TmsOtifDashboard {...ctx} />}
          {view === "returns" && <TmsReturns {...ctx} />}
          {view === "cost" && <TmsCostRecon {...ctx} />}
          {view === "integration" && <TmsIntegration />}
        </div>
      </div>
    </div>
  );
}

function WorkflowRail({ orders, trips, shipments, setView, operatingDate, setOperatingDate }) {
  const dayOrders = orders.filter((order) => order.date === operatingDate);
  const dayTrips = trips.filter((trip) => trip.date === operatingDate && trip.orderIds?.length);
  const allocated = new Set(dayTrips.flatMap((trip) => trip.orderIds));
  const assigned = dayTrips.filter((trip) => trip.carrier).length;
  const active = dayTrips.filter((trip) => ["Confirmed", "In Transit", "Dispatched"].includes(trip.status)).length;
  const delivered = dayTrips.filter((trip) => trip.status === "Delivered").length;
  const steps = [
    { view: "sync", label: "1. Order จาก WMS", value: dayOrders.length, note: "รายการ" },
    { view: "manualdispatch", label: "2. วางแผนและจัดกลุ่ม", value: allocated.size, note: `จาก ${dayOrders.length}` },
    { view: "allocation", label: "3. จัดรถ/Carrier", value: assigned, note: "เที่ยว" },
    { view: "track", label: "4. กำลังขนส่ง", value: active, note: "เที่ยว" },
    { view: "pod", label: "5. ส่งมอบ/POD", value: delivered, note: "เที่ยว" },
  ];
  return (
    <section className="workflow-rail" aria-label="ลำดับงานขนส่งที่เชื่อมโยงกัน">
      <div className="workflow-head">
        <div><b>Transportation workflow</b><span>ข้อมูล Order, เที่ยวรถ และสถานะใช้ชุดเดียวกันทุกหน้า</span></div>
        <label>วันที่ทำงาน <input value={operatingDate} onChange={(event) => setOperatingDate(event.target.value)} /></label>
      </div>
      <div className="workflow-steps">
        {steps.map((step, index) => <React.Fragment key={step.view}><button onClick={() => setView(step.view)}><span>{step.label}</span><b>{step.value}</b><small>{step.note}</small></button>{index < steps.length - 1 && <i>→</i>}</React.Fragment>)}
      </div>
    </section>
  );
}

/* ================================================================== */
/* DASHBOARD                                                            */
/* ================================================================== */

function TmsControlTower({ trips, vehicles, setView }) {
  const activeTrips = Math.max(48, trips.filter((trip) => trip.status !== "Delivered").length);
  const activeFleet = vehicles.filter((vehicle) => vehicle.status === "Active").length;
  const fleetTotal = Math.max(39, vehicles.length);
  const fleetUtilization = Math.round((activeFleet / Math.max(1, vehicles.length)) * 1000) / 10 || 87.2;
  const spend = trips.reduce((sum, trip) => sum + trip.cost, 0);

  const exceptions = [
    {
      tone: "danger",
      icon: "!",
      title: "Late arrival risk",
      detail: "PDR-240714-076 · ETA +32 min",
      note: "Heavy traffic near Rama IX",
      target: "track",
    },
    {
      tone: "warning",
      icon: "°",
      title: "Temperature deviation",
      detail: "TH-82-4197 · 9.2°C",
      note: "Cold-chain threshold: 2–8°C",
      target: "track",
    },
    {
      tone: "info",
      icon: "฿",
      title: "Invoice mismatch",
      detail: "INV-70219 · +฿1,250",
      note: "Fuel surcharge exceeds contract",
      target: "cost",
    },
  ];

  return (
    <div className="control-tower">
      <div className="ct-kpis">
        <button className="ct-kpi ct-kpi-primary" onClick={() => setView("track")}>
          <div className="ct-kpi-head"><span>ACTIVE TRIPS</span><em>LIVE</em></div>
          <div className="ct-kpi-value">{activeTrips}</div>
          <div className="ct-kpi-foot"><strong>↑ 12.4%</strong><span>vs. yesterday</span></div>
          <div className="ct-ring"><b>32</b><small>on time</small></div>
        </button>
        <button className="ct-kpi" onClick={() => setView("otif")}>
          <div className="ct-kpi-head"><span>ON-TIME DELIVERY</span><em>SLA</em></div>
          <div className="ct-kpi-value">94.8<small>%</small></div>
          <div className="ct-kpi-foot good"><strong>↑ 2.1%</strong><span>target 95%</span></div>
          <div className="ct-bars">{[22, 28, 34, 42, 58, 76].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div>
        </button>
        <button className="ct-kpi" onClick={() => setView("cost")}>
          <div className="ct-kpi-head"><span>TRANSPORT SPEND</span><em>MTD</em></div>
          <div className="ct-kpi-value">฿{spend > 1000000 ? (spend / 1000000).toFixed(2) : "2.84"}<small>M</small></div>
          <div className="ct-kpi-foot good"><strong>↓ 6.8%</strong><span>under budget</span></div>
          <div className="ct-bars">{[20, 29, 35, 43, 38, 57, 50, 67, 78, 62, 86].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div>
        </button>
        <button className="ct-kpi" onClick={() => setView("fleet")}>
          <div className="ct-kpi-head"><span>FLEET UTILIZATION</span><em>TODAY</em></div>
          <div className="ct-kpi-value">{fleetUtilization || 87.2}<small>%</small></div>
          <div className="ct-kpi-foot warn"><strong>{Math.max(5, fleetTotal - activeFleet)} vehicles idle</strong><span>of {fleetTotal}</span></div>
          <div className="ct-donut"><b>{Math.round(fleetUtilization || 87)}</b></div>
        </button>
      </div>

      <div className="ct-main-grid">
        <section className="ct-panel ct-network-panel">
          <div className="ct-panel-head">
            <div><span>LIVE NETWORK</span><h2>Fleet movement</h2></div>
            <button onClick={() => setView("map")}>Open live map ↗</button>
          </div>
          <GoogleLiveMap stops={[ZONE_COORDS.Central, ZONE_COORDS.East, ZONE_COORDS.BKK]} height={326} />
        </section>

        <section className="ct-panel ct-exceptions">
          <div className="ct-panel-head">
            <div><span>NEEDS ATTENTION</span><h2>Live exceptions</h2></div>
            <strong>3</strong>
          </div>
          <div className="ct-exception-list">
            {exceptions.map((item) => (
              <article className={`ct-exception ${item.tone}`} key={item.title}>
                <div className="ct-exception-icon">{item.icon}</div>
                <div className="ct-exception-copy">
                  <b>{item.title}</b>
                  <span>{item.detail}</span>
                  <small>{item.note}</small>
                </div>
                <button onClick={() => setView(item.target)}>Review</button>
              </article>
            ))}
          </div>
          <button className="ct-view-all" onClick={() => setView("track")}>View all exceptions <span>→</span></button>
        </section>
      </div>

      <section className="ct-panel ct-dispatch-strip">
        <div>
          <span>NEXT ACTION</span>
          <h2>12 orders are ready for vehicle allocation</h2>
        </div>
        <button className="btn" onClick={() => setView("manualdispatch")}><Truck size={15} /> Open Dispatch Board</button>
      </section>
    </div>
  );
}

function TmsDashboard({ trips, orders, log, vehicles }) {
  const allMonths = [...new Set(trips.map((trip) => trip.date.slice(0, 7)))].sort();
  const [month, setMonth] = useState(allMonths.at(-1) || "all");
  const filtered = month === "all" ? trips : trips.filter((trip) => trip.date.startsWith(month));
  const byDate = {};
  filtered.forEach((trip) => {
    if (!byDate[trip.date]) byDate[trip.date] = { date: trip.date, trips: 0, orders: 0, cube: 0, cost: 0, ftl: 0, parcel: 0, lowFill: 0, routes: new Set() };
    const day = byDate[trip.date];
    day.trips += 1; day.orders += trip.orders; day.cube += trip.cube; day.cost += trip.cost; day.routes.add(trip.route);
    day[trip.mode === "FTL" ? "ftl" : "parcel"] += 1;
    if (trip.mode === "FTL" && trip.cube < 5.2) day.lowFill += 1;
  });
  const daily = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)).map((day) => ({
    ...day,
    avgCube: day.orders ? day.cube / day.orders : 0,
    costPerOrder: day.orders ? day.cost / day.orders : 0,
    utilization: day.ftl ? Math.min(100, day.cube / (day.ftl * 32) * 100) : 100,
    routeCount: day.routes.size,
  }));
  const today = daily.at(-1) || { date: "-", trips: 0, orders: 0, cube: 0, cost: 0, ftl: 0, parcel: 0, lowFill: 0, avgCube: 0, costPerOrder: 0, utilization: 0, routeCount: 0 };
  const yesterday = daily.at(-2) || today;
  const pct = (current, previous) => previous ? ((current - previous) / previous) * 100 : 0;
  const costDelta = pct(today.cost, yesterday.cost);
  const orderDelta = pct(today.orders, yesterday.orders);
  const unitDelta = pct(today.costPerOrder, yesterday.costPerOrder);
  const cubeDelta = pct(today.avgCube, yesterday.avgCube);
  const totalCost = filtered.reduce((sum, trip) => sum + trip.cost, 0);
  const totalOrders = filtered.reduce((sum, trip) => sum + trip.orders, 0);
  const trendData = daily.slice(-14).map((day) => ({ date: day.date.slice(-5), cost: day.cost }));
  const causes = [
    { level: cubeDelta > 8 ? "bad" : "good", title: `ขนาดสินค้าต่อ Order ${cubeDelta >= 0 ? "เพิ่ม" : "ลด"} ${Math.abs(cubeDelta).toFixed(1)}%`, detail: `วันนี้เฉลี่ย ${today.avgCube.toFixed(2)} CBM/Order เทียบเมื่อวาน ${yesterday.avgCube.toFixed(2)} CBM — สินค้าชิ้นใหญ่ทำให้ใช้พื้นที่รถเร็วขึ้น` },
    { level: today.lowFill > yesterday.lowFill ? "bad" : "good", title: `รถวิ่งไม่เต็มเที่ยว ${today.lowFill} เที่ยว`, detail: today.lowFill ? `มี ${today.lowFill} เที่ยวที่ใช้พื้นที่ต่ำกว่าเกณฑ์ 65% ควรรวม Order หรือเลื่อน Cut-off` : "ไม่พบรถเสริมที่วิ่งต่ำกว่าเกณฑ์วันนี้" },
    { level: today.routeCount > yesterday.routeCount ? "bad" : "good", title: `แยกวิ่ง ${today.routeCount} เส้นทาง`, detail: `เมื่อวาน ${yesterday.routeCount} เส้นทาง · จำนวนเส้นทางที่มากขึ้นเพิ่มค่ารถขั้นต่ำและระยะทางเปล่า` },
    { level: unitDelta > 0 ? "bad" : "good", title: `ต้นทุนต่อ Order ${unitDelta >= 0 ? "สูงขึ้น" : "ลดลง"} ${Math.abs(unitDelta).toFixed(1)}%`, detail: `฿${Math.round(today.costPerOrder).toLocaleString()} ต่อ Order · ใช้ตัวเลขนี้แยกผลของปริมาณ Order ออกจากประสิทธิภาพการจัดรถ` },
  ];
  const byRoute = {};
  filtered.forEach((trip) => {
    if (!byRoute[trip.route]) byRoute[trip.route] = { trips: 0, orders: 0, cube: 0, cost: 0 };
    const row = byRoute[trip.route]; row.trips += 1; row.orders += trip.orders; row.cube += trip.cube; row.cost += trip.cost;
  });
  const routeRows = Object.entries(byRoute).sort((a, b) => b[1].cost - a[1].cost);
  const routeData = routeRows.map(([name, row]) => ({ name, cost: row.cost }));
  const byCarrier = {};
  filtered.forEach((trip) => { if (!byCarrier[trip.carrier]) byCarrier[trip.carrier] = { trips: 0, orders: 0, cost: 0 }; byCarrier[trip.carrier].trips += 1; byCarrier[trip.carrier].orders += trip.orders; byCarrier[trip.carrier].cost += trip.cost; });
  const carrierRows = Object.entries(byCarrier);
  const carrierPie = carrierRows.map(([carrier, row]) => ({ name: vendorName(carrier), value: row.cost }));

  return (
    <div className="analytics-page">
      <div className="analytics-toolbar">
        <div><span>REPORT &amp; DASHBOARD</span><h2>ต้นทุนขนส่งและสาเหตุที่เปลี่ยนแปลง</h2></div>
        <label>ช่วงข้อมูล <select value={month} onChange={(event) => setMonth(event.target.value)}><option value="all">ทั้งหมด</option>{allMonths.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>

      <section className={`cost-story ${costDelta > 0 ? "negative" : "positive"}`}>
        <div><span>ต้นทุนวันนี้ · {today.date}</span><strong>฿{today.cost.toLocaleString()}</strong><small className={costDelta > 0 ? "up" : "down"}>{costDelta >= 0 ? "↑" : "↓"} {Math.abs(costDelta).toFixed(1)}% จากเมื่อวาน</small></div>
        <div className="story-copy"><b>{costDelta > 0 ? "วันนี้ต้นทุนแพงขึ้น" : "วันนี้ต้นทุนถูกลง"} แม้จำนวน Order {orderDelta >= 0 ? "เพิ่ม" : "ลด"} {Math.abs(orderDelta).toFixed(1)}%</b><p>ตัวชี้วัดหลักคือ ต้นทุนต่อ Order {unitDelta >= 0 ? "เพิ่ม" : "ลด"} {Math.abs(unitDelta).toFixed(1)}% โดยมีผลจากขนาดสินค้าเฉลี่ย, รถที่วิ่งไม่เต็มเที่ยว และจำนวนเส้นทางด้านล่าง</p></div>
      </section>

      <div className="insight-kpis">
        <article><span>Order วันนี้</span><b>{today.orders}</b><small className={orderDelta >= 0 ? "up" : "down"}>{orderDelta >= 0 ? "+" : ""}{orderDelta.toFixed(1)}%</small></article>
        <article><span>ต้นทุน / Order</span><b>฿{Math.round(today.costPerOrder).toLocaleString()}</b><small className={unitDelta > 0 ? "up" : "down"}>{unitDelta >= 0 ? "+" : ""}{unitDelta.toFixed(1)}%</small></article>
        <article><span>Cube / Order</span><b>{today.avgCube.toFixed(2)}</b><small>CBM · {cubeDelta >= 0 ? "+" : ""}{cubeDelta.toFixed(1)}%</small></article>
        <article><span>เที่ยว / เส้นทาง</span><b>{today.trips} / {today.routeCount}</b><small>รถไม่เต็ม {today.lowFill} เที่ยว</small></article>
      </div>

      <div className="analytics-grid">
        <section className="analytics-card chart-card"><div className="analytics-card-head"><div><span>DAILY COST TREND</span><h3>แนวโน้มต้นทุนขนส่ง 14 วัน</h3></div><b>รวม ฿{totalCost.toLocaleString()}</b></div><div className="chart-frame"><ResponsiveContainer><LineChart data={trendData}><XAxis dataKey="date" /><YAxis /><Tooltip /><Line dataKey="cost" name="ต้นทุนรวม" stroke="#3E7EE0" strokeWidth={3} /></LineChart></ResponsiveContainer></div></section>
        <section className="analytics-card"><div className="analytics-card-head"><div><span>WHY IT CHANGED</span><h3>สาเหตุที่ต้นทุนเปลี่ยนวันนี้</h3></div></div><div className="cause-list">{causes.map((cause) => <article className={cause.level} key={cause.title}><i>{cause.level === "bad" ? "!" : "✓"}</i><div><b>{cause.title}</b><p>{cause.detail}</p></div></article>)}</div></section>
      </div>

      <section className="analytics-card"><div className="analytics-card-head"><div><span>DAILY DIAGNOSTIC</span><h3>ดูต้นทุนพร้อมปริมาณและประสิทธิภาพรถ</h3></div></div><div className="table-wrap"><table><thead><tr><th>วันที่</th><th>Order</th><th>Cube/Order</th><th>เที่ยว</th><th>เส้นทาง</th><th>รถไม่เต็ม</th><th>ต้นทุนรวม</th><th>ต้นทุน/Order</th></tr></thead><tbody>{daily.slice(-14).reverse().map((day) => <tr key={day.date}><td className="mono">{day.date}</td><td>{day.orders}</td><td>{day.avgCube.toFixed(2)} CBM</td><td>{day.trips}</td><td>{day.routeCount}</td><td className={day.lowFill ? "metric-bad" : "metric-good"}>{day.lowFill}</td><td className="mono">฿{day.cost.toLocaleString()}</td><td className="mono">฿{Math.round(day.costPerOrder).toLocaleString()}</td></tr>)}</tbody></table></div></section>

      <div className="analytics-grid">
        <section className="analytics-card chart-card"><div className="analytics-card-head"><div><span>ROUTE COST</span><h3>เส้นทางที่ใช้ต้นทุนสูง</h3></div></div><div className="chart-frame"><ResponsiveContainer><BarChart data={routeData.slice(0, 6)} layout="vertical"><YAxis dataKey="name" /><XAxis /><Bar dataKey="cost" fill="#17A9C0" /></BarChart></ResponsiveContainer></div></section>
        <section className="analytics-card chart-card"><div className="analytics-card-head"><div><span>CARRIER MIX</span><h3>สัดส่วนต้นทุนผู้ให้บริการ</h3></div></div><div className="chart-frame"><ResponsiveContainer><PieChart><Pie data={carrierPie} dataKey="value" nameKey="name">{carrierPie.map((_, index) => <Cell key={index} fill={["#3E7EE0", "#17A9C0", "#3EC775", "#F5A83C"][index % 4]} />)}</Pie></PieChart></ResponsiveContainer></div></section>
      </div>

      <section className="analytics-card"><div className="analytics-card-head"><div><span>ACTION TABLE</span><h3>เส้นทางที่ควรทบทวนก่อน Cut-off รอบถัดไป</h3></div></div><div className="table-wrap"><table><thead><tr><th>เส้นทาง</th><th>เที่ยว</th><th>Order</th><th>Cube รวม</th><th>ต้นทุนรวม</th><th>ต้นทุน/Order</th><th>ข้อสังเกต</th></tr></thead><tbody>{routeRows.map(([route, row]) => <tr key={route}><td>{route}</td><td>{row.trips}</td><td>{row.orders}</td><td>{row.cube.toFixed(1)}</td><td className="mono">฿{row.cost.toLocaleString()}</td><td className="mono">฿{Math.round(row.cost / Math.max(1, row.orders)).toLocaleString()}</td><td>{row.cube / Math.max(1, row.trips) < 5.2 ? <span className="analysis-tag warn">รวมเที่ยวเพิ่ม</span> : <span className="analysis-tag ok">โหลดเหมาะสม</span>}</td></tr>)}</tbody></table></div></section>
      <div className="analytics-footnote">ข้อมูลเชื่อมจาก {filtered.length} เที่ยว · {totalOrders.toLocaleString()} Order · อัปเดตตามการจัดรถและสถานะในระบบ</div>
    </div>
  );
}

function TmsDashboardLegacy({ trips, log, vehicles }) {
  const allMonths = [...new Set(trips.map((t) => t.date.slice(0, 7)))].sort();
  const [month, setMonth] = useState("all");
  const filtered = month === "all" ? trips : trips.filter((t) => t.date.slice(0, 7) === month);

  const totalCost = filtered.reduce((a, t) => a + t.cost, 0);
  const totalOrders = filtered.reduce((a, t) => a + t.orders, 0);
  const ftlCost = filtered.filter((t) => t.mode === "FTL").reduce((a, t) => a + t.cost, 0);
  const parcelCost = filtered.filter((t) => t.mode === "Parcel").reduce((a, t) => a + t.cost, 0);

  const byMonth = {};
  trips.forEach((t) => {
    const mo = t.date.slice(0, 7);
    if (!byMonth[mo]) byMonth[mo] = { trips: 0, cost: 0, ftl: 0, parcel: 0 };
    byMonth[mo].trips++; byMonth[mo].cost += t.cost;
    byMonth[mo][t.mode === "FTL" ? "ftl" : "parcel"] += t.cost;
  });
  const monthRows = Object.entries(byMonth).sort();

  const byDate = {};
  filtered.forEach((t) => { if (!byDate[t.date]) byDate[t.date] = { trips: 0, cost: 0 }; byDate[t.date].trips++; byDate[t.date].cost += t.cost; });
  const dailyRows = Object.entries(byDate).sort();
  const trendData = dailyRows.map(([date, v]) => ({ date: date.slice(-5), cost: v.cost }));

  const byRoute = {};
  filtered.forEach((t) => { if (!byRoute[t.route]) byRoute[t.route] = { trips: 0, cost: 0 }; byRoute[t.route].trips++; byRoute[t.route].cost += t.cost; });
  const routeRows = Object.entries(byRoute).sort((a, b) => b[1].cost - a[1].cost);
  const routeData = routeRows.map(([name, v]) => ({ name, cost: v.cost }));

  const byCarrier = {};
  filtered.forEach((t) => { if (!byCarrier[t.carrier]) byCarrier[t.carrier] = { trips: 0, cost: 0, ftl: 0, parcel: 0 }; byCarrier[t.carrier].trips++; byCarrier[t.carrier].cost += t.cost; byCarrier[t.carrier][t.mode === "FTL" ? "ftl" : "parcel"] += t.cost; });
  const carrierRows = Object.entries(byCarrier);
  const carrierPie = carrierRows.map(([c, v]) => ({ name: CARRIER_LABEL[c] || c, value: v.cost }));
  const fleetByType = vehicles ? VEHICLE_CATALOG_TYPES.map((t) => ({ type: t, count: vehicles.filter((v) => v.type === t).length, active: vehicles.filter((v) => v.type === t && v.status === "Active").length })) : [];

  return (
    <>
      {vehicles && (
        <>
          <div className="section-title" style={{ marginTop: 0 }}>องค์ประกอบยานพาหนะ (Fleet Mix)</div>
          <div className="grid g4" style={{ marginBottom: 20, gridTemplateColumns: "repeat(7,1fr)" }}>
            {fleetByType.map((b) => (
              <div className="card" key={b.type} style={{ textAlign: "center", padding: 10 }}>
                <TruckIconSVG type={b.type} size={28} color={b.count ? "var(--amber)" : "var(--muted)"} />
                <div className="kpi-sub" style={{ fontSize: 10, marginTop: 6 }}>{b.type}</div>
                <div className="kpi-val" style={{ fontSize: 17 }}>{b.count}</div>
                <div className="kpi-sub" style={{ fontSize: 9.5 }}>พร้อมใช้ {b.active}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="field" style={{ maxWidth: 260, marginBottom: 18 }}>
        <label>กรองตามเดือน</label>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="all">ทั้งหมด</option>
          {allMonths.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="grid g4" style={{ marginBottom: 20 }}>
        <div className="card"><h3>จำนวนเที่ยวรถทั้งหมด</h3><div className="kpi-val">{filtered.length}</div></div>
        <div className="card"><h3>ต้นทุนขนส่งรวม</h3><div className="kpi-val">฿{totalCost.toLocaleString()}</div></div>
        <div className="card"><h3>ต้นทุนเฉลี่ย/ออเดอร์</h3><div className="kpi-val">฿{totalOrders ? Math.round(totalCost / totalOrders).toLocaleString() : 0}</div></div>
        <div className="card"><h3>สัดส่วน FTL : Parcel</h3><div className="kpi-val">{totalCost ? Math.round((ftlCost / totalCost) * 100) : 0}% : {totalCost ? Math.round((parcelCost / totalCost) * 100) : 0}%</div></div>
      </div>

      <div className="section-title" style={{ marginTop: 0 }}>สรุปรายเดือน (ทุกเดือน)</div>
      <div className="table-wrap" style={{ marginBottom: 28 }}>
        <table>
          <thead><tr><th>เดือน</th><th>จำนวนเที่ยว</th><th>ต้นทุนรวม</th><th>เฉลี่ย/เที่ยว</th><th>FTL</th><th>Parcel</th></tr></thead>
          <tbody>
            {monthRows.map(([mo, v]) => (
              <tr key={mo}><td className="mono">{mo}</td><td>{v.trips}</td><td className="mono">฿{v.cost.toLocaleString()}</td>
                <td className="mono">฿{Math.round(v.cost / v.trips).toLocaleString()}</td>
                <td className="mono">฿{v.ftl.toLocaleString()}</td><td className="mono">฿{v.parcel.toLocaleString()}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-title">รายวัน — แนวโน้มต้นทุนขนส่ง</div>
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={trendData} margin={{ top: 6, right: 14, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="var(--muted)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--muted)" tick={{ fontSize: 11 }} />
              <Tooltip {...chartTip} />
              <Line type="monotone" dataKey="cost" stroke="var(--amber)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="table-wrap" style={{ marginBottom: 28, maxHeight: 260, overflowY: "auto" }}>
        <table>
          <thead><tr><th>วันที่</th><th>จำนวนเที่ยว</th><th>ต้นทุนรวม</th></tr></thead>
          <tbody>{dailyRows.map(([d, v]) => (<tr key={d}><td className="mono">{d}</td><td>{v.trips}</td><td className="mono">฿{v.cost.toLocaleString()}</td></tr>))}</tbody>
        </table>
      </div>

      <div className="section-title">รายเส้นทาง (Route)</div>
      <div className="grid g2" style={{ marginBottom: 28 }}>
        <div className="card">
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={routeData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis type="number" stroke="var(--muted)" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" stroke="var(--muted)" tick={{ fontSize: 10 }} width={110} />
                <Tooltip {...chartTip} />
                <Bar dataKey="cost" fill="var(--amber)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>เส้นทาง</th><th>จำนวนเที่ยว</th><th>ต้นทุนรวม</th></tr></thead>
            <tbody>{routeRows.map(([r, v]) => (<tr key={r}><td>{r}</td><td>{v.trips}</td><td className="mono">฿{v.cost.toLocaleString()}</td></tr>))}</tbody>
          </table>
        </div>
      </div>

      <div className="section-title">รายขนส่ง (Carrier)</div>
      <div className="grid g2" style={{ marginBottom: 28 }}>
        <div className="card">
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={carrierPie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={78} paddingAngle={3}>
                  <Cell fill="var(--amber)" /><Cell fill="var(--teal)" />
                </Pie>
                <Tooltip {...chartTip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ผู้ให้บริการ</th><th>เที่ยว</th><th>ต้นทุนรวม</th><th>FTL</th><th>Parcel</th></tr></thead>
            <tbody>
              {carrierRows.map(([c, v]) => (
                <tr key={c}><td>{CARRIER_LABEL[c] || c}</td><td>{v.trips}</td><td className="mono">฿{v.cost.toLocaleString()}</td>
                  <td className="mono">฿{v.ftl.toLocaleString()}</td><td className="mono">฿{v.parcel.toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-title">รายการเที่ยวรถ (ล่าสุด 60 เที่ยว จาก {filtered.length})</div>
      <div className="table-wrap" style={{ marginBottom: 28 }}>
        <table>
          <thead><tr><th>Trip</th><th>วันที่</th><th>สาย</th><th>โหมด</th><th>ผู้ให้บริการ</th><th>Order</th><th>Cube</th><th>ต้นทุน</th><th>สถานะ</th></tr></thead>
          <tbody>
            {[...filtered].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 60).map((t) => (
              <tr key={t.id}>
                <td className="mono">{t.id}</td><td className="mono">{t.date}</td><td>{t.route}</td>
                <td><span className={`sys-tag ${t.mode === "FTL" ? "ASRS" : "Manual"}`}>{t.mode}</span></td>
                <td>{vendorName(t.carrier)} {t.mode === "FTL" ? "(เหมาเที่ยว)" : "(DHL รายกล่อง)"}</td>
                <td>{t.orders}</td><td className="mono">{t.cube}</td><td className="mono">฿{t.cost.toLocaleString()}</td>
                <td><span className={`tag-status ${t.status === "Delivered" ? "Arrived" : t.status === "In Transit" ? "Receiving" : "Booked"}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-title">กิจกรรมล่าสุด</div>
      <div className="card">
        {log.map((l, i) => (
          <div className="log-item" key={i}>
            <div className="log-ic ai"><RefreshCw size={14} /></div>
            <div><div className="log-text">{l.text}</div><div className="log-time">{l.t.toLocaleTimeString("th-TH")}</div></div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ================================================================== */
/* WMS SYNC / ORDER INTAKE                                              */
/* ================================================================== */

function TmsSync({ orders, online, lastSync, syncNow, operatingDate: date, setOperatingDate: setDate }) {
  const days = [...new Set(orders.map((o) => o.date))].sort();
  const filtered = orders.filter((o) => o.date === date);
  const totalCube = filtered.reduce((a, o) => a + o.cube, 0);

  return (
    <>
      <div className="card" style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className={`icon-wrap ${online ? "on" : "off"}`}>{online ? <Wifi size={20} /> : <WifiOff size={20} />}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{online ? "เชื่อมต่อกับ WMS สำเร็จ" : "ขาดการเชื่อมต่อกับ WMS"}</div>
            <div className="kpi-sub">Endpoint: wms.synnex.internal/api/orders · Sync ล่าสุด {lastSync.toLocaleTimeString("th-TH")}</div>
          </div>
        </div>
        <button className="btn" onClick={syncNow}><RefreshCw size={13} /> Sync ข้อมูลตอนนี้</button>
      </div>

      <div className="kpi-sub" style={{ marginBottom: 14 }}>ระบบ TMS รับข้อมูล Order, เส้นทาง, ขนาดสินค้า (Cube), รายชื่อลูกค้า และสถานที่จัดส่งจาก WMS โดยตรงแบบเรียลไทม์ผ่าน API — ไม่ต้องกรอกซ้ำ</div>
      <div className="field" style={{ maxWidth: 260, marginBottom: 16 }}>
        <label>เลือกวันที่</label>
        <select value={date} onChange={(e) => setDate(e.target.value)}>{days.map((d) => <option key={d} value={d}>{d}</option>)}</select>
      </div>
      <div className="grid g4" style={{ marginBottom: 18 }}>
        <div className="card"><h3>จำนวน Order</h3><div className="kpi-val">{filtered.length}</div></div>
        <div className="card"><h3>Cube รวม</h3><div className="kpi-val">{totalCube.toFixed(2)} CBM</div></div>
        <div className="card"><h3>น้ำหนักประมาณ</h3><div className="kpi-val">{Math.round(totalCube * 150).toLocaleString()} kg</div></div>
        <div className="card"><h3>จำนวนสาย/พื้นที่</h3><div className="kpi-val">{new Set(filtered.map((o) => o.area)).size}</div></div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Order</th><th>ลูกค้า</th><th>พื้นที่จัดส่ง (สาย)</th><th>จำนวนรายการ</th><th>Cube (CBM)</th><th>รอบจัดส่ง</th><th>Platform</th></tr></thead>
          <tbody>
            {filtered.slice(0, 60).map((o) => (
              <tr key={o.id}><td className="mono">{o.id}</td><td>{o.customer}</td><td>{o.area}</td><td>{o.items}</td><td className="mono">{o.cube}</td><td>{o.slot}</td><td>{o.platform}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================== */
/* ROUTE SIMULATION & BOOKING                                          */
/* ================================================================== */

function TmsSimulation({ orders, setOrders, trips, setTrips, shipments, setShipments, addLog, vehicles, setView, operatingDate: date, setOperatingDate: setDate }) {
  const [route, setRoute] = useState(AREAS[0]);
  const [dispatchModal, setDispatchModal] = useState(null);
  const [justBooked, setJustBooked] = useState(null);

  const assignedOrderIds = new Set(trips.filter((trip) => trip.date === date).flatMap((trip) => trip.orderIds || []));
  const dayOrders = orders.filter((o) => o.date === date && o.area === route && !assignedOrderIds.has(o.id));
  const sim = dayOrders.length ? simulateRoute(dayOrders, route) : null;
  const openAutoDispatch = (initialMode) => {
    if (!sim) return;
    setDispatchModal({ ev: sim, route, isManual: false, initialMode });
  };
  const doBooking = (mode, vendor) => {
    if (!dispatchModal) return;
    const result = bookDispatch({ ev: dispatchModal.ev, mode, vendor, date, route: dispatchModal.route, isManual: dispatchModal.isManual, trips, setTrips, setOrders, setShipments, vehicles, addLog });
    setJustBooked(result);
    setDispatchModal(null);
  };
  const advanceTrip = (trip) => {
    const flow = ["Requested", "Confirmed", "In Transit", "Delivered"];
    const next = flow[flow.indexOf(trip.status) + 1];
    if (!next) return;
    setTrips((list) => list.map((t) => (t.id === trip.id ? { ...t, status: next } : t)));
    const shipmentStatus = next === "Confirmed" ? "Carrier Assigned" : next === "In Transit" ? "In-Transit" : next;
    const orderStatus = next === "Delivered" ? "สำเร็จ" : next === "In Transit" ? "กำลังจัดส่ง" : "จัดรถแล้ว";
    setShipments((list) => list.map((shipment) => shipment.tripId === trip.id ? { ...shipment, status: shipmentStatus } : shipment));
    setOrders((list) => list.map((order) => trip.orderIds?.includes(order.id) ? { ...order, status: orderStatus } : order));
  };
  const todayTrips = trips.filter((t) => t.date === date);

  return (
    <>
      <div className="kpi-sub" style={{ marginBottom: 14 }}>Simulation อัตโนมัติตามเส้นทาง — เลือกวันที่/สาย แล้วระบบวิเคราะห์ทั้งสายให้ทันที ถ้าต้องการเลือก Order เองเป็นกลุ่มย่อย ไปที่หน้า "จัดรถ (Manual Dispatch)" แยกต่างหาก</div>
      <div className="grid g2" style={{ marginBottom: 14 }}>
        <div className="field"><label>วันที่จัดส่ง</label><input value={date} onChange={(e) => setDate(e.target.value)} placeholder="2569-07-08" /></div>
        <div className="field"><label>สาย / พื้นที่จัดส่ง (หรือคลิกเลือกจากตารางด้านล่าง)</label><select value={route} onChange={(e) => setRoute(e.target.value)}>{AREAS.map((a) => <option key={a} value={a}>{a}</option>)}</select></div>
      </div>

      <div className="section-title" style={{ marginTop: 0 }}>Order วันนี้ แยกตามเส้นทาง (คลิกแถวเพื่อกรอง/เลือกสาย)</div>
      <div className="table-wrap" style={{ marginBottom: 22 }}>
        <table>
          <thead><tr><th>เส้นทาง</th><th>จำนวน Order</th><th>Cube รวม</th><th>Cube เฉลี่ย/Order</th><th>แนวโน้ม</th></tr></thead>
          <tbody>
            {AREAS.map((a) => {
              const os = orders.filter((o) => o.date === date && o.area === a && !assignedOrderIds.has(o.id));
              const totalCube = os.reduce((s, o) => s + o.cube, 0);
              const avgCube = os.length ? totalCube / os.length : 0;
              return (
                <tr key={a} className="clickable" onClick={() => setRoute(a)} style={route === a ? { background: "var(--panel-raised)" } : {}}>
                  <td>{route === a && <ChevronRight size={13} style={{ verticalAlign: "middle" }} />} {a}</td>
                  <td className="mono">{os.length}</td>
                  <td className="mono">{totalCube.toFixed(2)} CBM</td>
                  <td className="mono">{avgCube.toFixed(2)} CBM</td>
                  <td>{avgCube >= 0.3 ? <span className="tag-status Booked">มักคุ้ม FTL</span> : <span className="tag-status Arrived">มักคุ้ม Parcel</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!sim ? (
        <div className="card kpi-sub" style={{ textAlign: "center", padding: 30 }}>ไม่มี Order สำหรับสาย/วันที่นี้</div>
      ) : (
        <>
          <div className="grid g4" style={{ marginBottom: 12 }}>
            <div className="card"><h3>จำนวน Order</h3><div className="kpi-val">{sim.numOrders}</div></div>
            <div className="card"><h3>Cube รวม</h3><div className="kpi-val">{sim.totalCube} CBM</div></div>
            <div className="card"><h3>น้ำหนักประมาณ</h3><div className="kpi-val">{sim.totalWeightKg.toLocaleString()} kg</div></div>
            <div className="card"><h3>ต้นทางสินค้า</h3><div className="kpi-val" style={{ fontSize: 18 }}>{CARRIER_LABEL[sim.origin]}</div></div>
          </div>
          {sim.mixedOrigin && <div className="kpi-sub" style={{ marginBottom: 10, color: "var(--orange)" }}>⚠ Order ในสาย/วันนี้มีสินค้าอยู่คนละต้นทาง (ทั้ง HQ และ TKS) — ระบบใช้ต้นทางส่วนใหญ่ ({CARRIER_LABEL[sim.origin]}) ในการคำนวณ แนะนำให้ใช้หน้า Manual Dispatch เพื่อแยกกลุ่มตามต้นทางจริง</div>}
          {!sim.isBkkMetro && <div className="kpi-sub" style={{ marginBottom: 14, color: "var(--orange)" }}>⚠ Rate Card เหมาเที่ยว (อัตรา_Territory) ครอบคลุมเฉพาะ กทม+ปริมณฑล — ค่า FTL โซนนี้เป็นค่าประมาณการจากขนาดรถ+ระยะทาง ไม่ใช่อัตราต่อรองจริง</div>}

          <div className="section-title">ผลการ Simulation — สินค้าอยู่ที่ {CARRIER_LABEL[sim.origin]} จึงเทียบแค่ เหมาเที่ยว vs รายกล่อง (ไม่เทียบข้ามต้นทาง)</div>
          <div className="grid g2" style={{ marginBottom: 10 }}>
            {sim.all.map((opt) => (
              <div className="card" key={opt.mode} style={sim.best === opt ? { border: "2px solid var(--success)" } : {}}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {opt.mode === "FTL" && <TruckIconSVG type={opt.vehicleType} size={26} color="var(--amber)" />}
                    <h3 style={{ margin: 0 }}>{opt.mode === "FTL" ? `เหมาเที่ยว (${opt.vehicleType})` : "รายกล่อง (Parcel)"}</h3>
                  </div>
                  {sim.best === opt && <span className="tag-status Arrived">แนะนำ</span>}
                </div>
                <div className="kpi-val">฿{opt.cost.toLocaleString()}</div>
                <div className="kpi-sub">
                  {opt.mode === "FTL" ? `${opt.trucks > 1 ? `${opt.trucks} เที่ยว` : "1 เที่ยว"} · เฉลี่ย ฿${(opt.cost / opt.trucks).toFixed(0)}/เที่ยว` : `${sim.numOrders} กล่อง · เฉลี่ย ฿${(opt.cost / sim.numOrders).toFixed(0)}/กล่อง`}
                </div>
                <div className="kpi-sub" style={{ color: opt.real ? "var(--success)" : "var(--orange)", marginTop: 4 }}>{opt.real ? "✓ อ้างอิงจาก Rate Card จริง" : `⚠ ${opt.note}`}</div>
                <button className="btn" style={{ width: "100%", justifyContent: "center", marginTop: 10 }} onClick={() => openAutoDispatch(opt.mode)}>
                  {opt.mode === "FTL" ? <Truck size={13} /> : <PackageSearch size={13} />} เลือกแบบนี้ → เลือกผู้ประกอบการ
                </button>
              </div>
            ))}
          </div>
          <div className="kpi-sub" style={{ marginBottom: 24, textAlign: "center" }}>
            แนะนำ: <b style={{ color: "var(--success)" }}>{sim.best.mode === "FTL" ? "เหมาเที่ยว" : "Parcel"} — ฿{sim.best.cost.toLocaleString()}</b>
            {" · "}ประหยัดกว่าอีกทางเลือก <b style={{ color: "var(--success)" }}>฿{Math.abs(sim.all[0].cost - sim.all[1].cost).toLocaleString()}</b>
          </div>

          <div className="section-title">Mapping — ถ้าจัดแบบเหมาเที่ยว (FTL) คันไหนวิ่ง Order ไหนบ้าง</div>
          {sim.trucks.map((tr, i) => (
            <div className="table-wrap" style={{ marginBottom: 12 }} key={i}>
              <table>
                <thead><tr><th colSpan={5}>เที่ยวที่ {i + 1} — {route} · รวม {tr.cube.toFixed(2)} CBM ({tr.orders.length} Order)</th></tr>
                  <tr><th>Order</th><th>ลูกค้า</th><th>สินค้า</th><th>Cube</th><th>Platform</th></tr></thead>
                <tbody>
                  {tr.orders.map((o) => (
                    <tr key={o.id}><td className="mono">{o.id}</td><td>{o.customer}</td><td>{productFor(o.id).name}</td><td className="mono">{o.cube}</td><td>{o.platform}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <div className="section-title">Mapping — ถ้าจัดแบบรายกล่อง (Parcel) แต่ละกล่องมี Order/สินค้าอะไร</div>
          <div className="table-wrap" style={{ marginBottom: 20 }}>
            <table>
              <thead><tr><th>Order (1 กล่อง)</th><th>ลูกค้า</th><th>สินค้า</th><th>น้ำหนักประมาณ</th><th>{CARRIER_LABEL[sim.origin]} ฿/กล่อง</th></tr></thead>
              <tbody>
                {sim.orders.map((o) => {
                  const wG = o.cube * CUBE_TO_GRAM;
                  return (
                    <tr key={o.id}>
                      <td className="mono">{o.id}</td><td>{o.customer}</td><td>{productFor(o.id).name}</td>
                      <td className="mono">{Math.round(wG).toLocaleString()} g</td>
                      <td className="mono">฿{dhlRate(sim.origin, sim.zoneKey, wG)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {dispatchModal && (
        <DispatchDecisionModal ev={dispatchModal.ev} initialMode={dispatchModal.initialMode} onClose={() => setDispatchModal(null)} onConfirm={doBooking} />
      )}
      {justBooked && <BookedSuccessModal justBooked={justBooked} onClose={() => setJustBooked(null)} onGoToAllocation={() => { setJustBooked(null); setView("allocation"); }} />}

      <div className="section-title">การจัดส่งวันนี้ ({date})</div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Trip</th><th>สาย</th><th>โหมด</th><th>ต้นทาง</th><th>ผู้ให้บริการ</th><th>Order</th><th>ต้นทุน</th><th>สถานะ</th><th></th></tr></thead>
          <tbody>
            {todayTrips.map((t) => (
              <tr key={t.id}>
                <td className="mono">{t.id}</td><td>{t.route}</td><td>{t.mode}</td><td>{t.origin ? CARRIER_LABEL[t.origin] : "-"}</td><td>{vendorName(t.carrier)}</td><td>{t.orders}</td><td className="mono">฿{t.cost.toLocaleString()}</td>
                <td><span className={`tag-status ${t.status === "Delivered" ? "Arrived" : t.status === "In Transit" ? "Receiving" : "Booked"}`}>{t.status}</span></td>
                <td>{t.status !== "Delivered" && <button className="btn secondary" onClick={() => advanceTrip(t)}>ขั้นต่อไป</button>}</td>
              </tr>
            ))}
            {todayTrips.length === 0 && <tr><td colSpan={9} style={{ textAlign: "center", color: "var(--muted)" }}>ยังไม่มีการเรียกรถวันนี้</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================== */
/* MANUAL DISPATCH — standalone page: pick orders by hand, with full    */
/* route-divergence detection (e.g. North mixed into a South run)       */
/* ================================================================== */

function TmsManualDispatch({ orders, setOrders, trips, setTrips, setShipments, addLog, vehicles, setView, operatingDate: date, setOperatingDate: setDate }) {
  const [manualRoutes, setManualRoutes] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [dispatchModal, setDispatchModal] = useState(null);
  const [justBooked, setJustBooked] = useState(null);

  const groupedOrderIds = new Set(trips.flatMap((t) => t.orderIds || []));
  const manualPool = orders.filter((o) => o.date === date && (manualRoutes.length === 0 || manualRoutes.includes(o.area)));
  const toggleManualRoute = (a) => setManualRoutes((rs) => (rs.includes(a) ? rs.filter((x) => x !== a) : [...rs, a]));
  const toggleOrder = (id) => setSelectedIds((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectedOrders = manualPool.filter((o) => selectedIds.has(o.id));
  const selectAllVisible = () => setSelectedIds((s) => { const n = new Set(s); manualPool.forEach((o) => { if (!groupedOrderIds.has(o.id)) n.add(o.id); }); return n; });
  const clearSelection = () => setSelectedIds(new Set());

  const suggestedGroups = (() => {
    const buckets = {};
    manualPool.forEach((o) => {
      if (groupedOrderIds.has(o.id)) return;
      const key = `${o.area}__${o.district}`;
      if (!buckets[key]) buckets[key] = { area: o.area, district: o.district, orders: [] };
      buckets[key].orders.push(o);
    });
    return Object.values(buckets).filter((g) => g.orders.length >= 2).sort((a, b) => b.orders.length - a.orders.length);
  })();
  const selectGroup = (g) => setSelectedIds(new Set(g.orders.map((o) => o.id)));

  // Live route-compatibility check on the current selection — this is the "does this
  // selection go together or diverge?" indicator requested.
  const liveCompat = selectedOrders.length ? routeCompatibility([...new Set(selectedOrders.map((o) => o.area))]) : null;
  const liveOrigin = selectedOrders.length ? dominantOrigin(selectedOrders) : null;

  const openGroupModal = () => {
    if (!selectedOrders.length) return;
    const ev = evaluateGroup(selectedOrders);
    setDispatchModal({ ev, route: null, isManual: true, initialMode: ev.best.mode });
  };
  const doBooking = (mode, vendor) => {
    if (!dispatchModal) return;
    const result = bookDispatch({ ev: dispatchModal.ev, mode, vendor, date, route: dispatchModal.route, isManual: dispatchModal.isManual, trips, setTrips, setOrders, setShipments, vehicles, addLog });
    setJustBooked(result);
    setDispatchModal(null);
    setSelectedIds(new Set());
  };

  const COMPAT_LABEL = { same: { text: "เส้นทางเดียว", color: "var(--success)" }, adjacent: { text: "เส้นทางใกล้กัน — รวมได้", color: "var(--success)" }, mixed: { text: "เส้นทางค่อนข้างห่างกัน", color: "var(--orange)" }, diverging: { text: "เส้นทางฉีกออกไปคนละทิศ!", color: "var(--danger)" } };

  return (
    <>
      <div className="kpi-sub" style={{ marginBottom: 14 }}>เลือก Order เอง เพื่อจัดกลุ่มขึ้นรถ/เที่ยว — ระบบจะตรวจสอบให้ว่าเส้นทางที่เลือกไปด้วยกันได้จริงหรือไม่ ถ้าเลือกเส้นทางที่ฉีกกันคนละทิศ (เช่น เหนือ+ใต้) จะเตือนพร้อมตัวเลขต้นทุนที่เพิ่มขึ้นจริง</div>

      <div className="field" style={{ maxWidth: 260, marginBottom: 14 }}><label>วันที่</label><input value={date} onChange={(e) => setDate(e.target.value)} placeholder="2569-07-08" /></div>

      <div style={{ marginBottom: 12 }}>
        {AREAS.map((a) => (
          <span key={a} className={`chip ${manualRoutes.includes(a) ? "active" : ""}`} style={{ marginRight: 8, marginBottom: 8 }} onClick={() => toggleManualRoute(a)}>{a}</span>
        ))}
        {manualRoutes.length > 0 && <span className="chip" style={{ marginBottom: 8 }} onClick={() => setManualRoutes([])}><X size={12} /> ล้างตัวกรอง</span>}
      </div>

      {suggestedGroups.length > 0 && (
        <>
          <div className="kpi-sub" style={{ marginBottom: 8, fontWeight: 600 }}>ระบบแนะนำ — Order กลุ่มนี้อยู่ตำบล/เขตเดียวกัน ควรจัดไปด้วยกัน (คลิกเพื่อเลือกทั้งกลุ่ม)</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            {suggestedGroups.slice(0, 6).map((g, i) => (
              <div key={i} className="card" style={{ cursor: "pointer", padding: 10, minWidth: 180 }} onClick={() => selectGroup(g)}>
                <div style={{ fontWeight: 700, fontSize: 12.5 }}>{g.district}</div>
                <div className="kpi-sub">{g.area}</div>
                <div className="kpi-sub">{g.orders.length} Order · {g.orders.reduce((a, o) => a + o.cube, 0).toFixed(2)} CBM</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="card" style={{ marginBottom: 10, borderColor: liveCompat && liveCompat.level === "diverging" ? "var(--danger)" : liveCompat && liveCompat.level === "mixed" ? "var(--orange)" : undefined }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div><b>{selectedOrders.length}</b> Order ที่เลือก</div>
          <div className="kpi-sub">Cube รวม: <b>{selectedOrders.reduce((a, o) => a + o.cube, 0).toFixed(2)} CBM</b></div>
          <div className="kpi-sub">น้ำหนักประมาณ: <b>{Math.round(selectedOrders.reduce((a, o) => a + o.cube, 0) * 150).toLocaleString()} kg</b></div>
          {liveOrigin && liveOrigin.mixed && <span className="tag-status Hold">⚠ ต้นทางปนกัน (HQ+TKS)</span>}
          {liveCompat && liveCompat.level !== "same" && (
            <span className="tag-status" style={{ background: COMPAT_LABEL[liveCompat.level].color }}>
              {COMPAT_LABEL[liveCompat.level].text}{liveCompat.maxDistanceKm > 0 ? ` (${liveCompat.worstPair[0]}↔${liveCompat.worstPair[1]} ~${liveCompat.maxDistanceKm.toLocaleString()} กม.)` : ""}
            </span>
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button className="btn secondary" onClick={selectAllVisible}>เลือกทั้งหมดที่กรองไว้</button>
            <button className="btn secondary" onClick={clearSelection}>ล้างที่เลือก</button>
            <button className="btn" disabled={!selectedOrders.length} onClick={openGroupModal}><ClipboardList size={13} /> Group Order ({selectedOrders.length})</button>
          </div>
        </div>
        {liveCompat && liveCompat.level === "diverging" && (
          <div className="kpi-sub" style={{ color: "var(--danger)", marginTop: 10, fontWeight: 600 }}>
            ⚠ เส้นทางที่เลือกฉีกออกไปคนละทิศจริง ({liveCompat.worstPair[0]} ↔ {liveCompat.worstPair[1]} ห่างกันประมาณ {liveCompat.maxDistanceKm.toLocaleString()} กม.) — การรวมเที่ยวนี้จะทำให้รถต้องอ้อมไกลขึ้นมาก แนะนำให้แยกเป็นคนละเที่ยวแทน (ระบบจะคำนวณส่วนต่างต้นทุนให้ดูในหน้าต่างถัดไป)
          </div>
        )}
        {liveCompat && liveCompat.level === "mixed" && (
          <div className="kpi-sub" style={{ color: "var(--orange)", marginTop: 10 }}>
            ⚠ เส้นทางที่เลือกค่อนข้างห่างกัน ({liveCompat.worstPair[0]} ↔ {liveCompat.worstPair[1]} ~{liveCompat.maxDistanceKm.toLocaleString()} กม.) — อาจเพิ่มต้นทุนบ้าง ตรวจสอบตัวเลขก่อนยืนยัน
          </div>
        )}
      </div>

      <div className="table-wrap" style={{ marginBottom: 26, maxHeight: 360, overflowY: "auto" }}>
        <table>
          <thead><tr><th></th><th>Order</th><th>ลูกค้า</th><th>เส้นทาง</th><th>ต้นทาง</th><th>เขต/อำเภอ</th><th>ที่อยู่จัดส่ง</th><th>สินค้า</th><th>Cube</th></tr></thead>
          <tbody>
            {manualPool.map((o) => {
              const already = groupedOrderIds.has(o.id);
              return (
                <tr key={o.id} style={already ? { opacity: 0.4 } : {}}>
                  <td><input type="checkbox" disabled={already} checked={selectedIds.has(o.id)} onChange={() => toggleOrder(o.id)} /></td>
                  <td className="mono">{o.id}</td><td>{o.customer}</td><td>{o.area}{already && <span className="kpi-sub"> (จัดแล้ว)</span>}</td>
                  <td><span className="sys-tag ASRS">{CARRIER_LABEL[o.origin]}</span></td>
                  <td style={{ fontSize: 12 }}>{o.district}<br /><span className="kpi-sub">{o.province}</span></td>
                  <td style={{ fontSize: 11.5, color: "var(--muted)", maxWidth: 200 }}>{o.address}</td>
                  <td style={{ fontSize: 12 }}>{productFor(o.id).name}</td><td className="mono">{o.cube}</td>
                </tr>
              );
            })}
            {manualPool.length === 0 && <tr><td colSpan={9} style={{ textAlign: "center", color: "var(--muted)" }}>ไม่มี Order ตรงตัวกรอง</td></tr>}
          </tbody>
        </table>
      </div>

      {dispatchModal && (
        <DispatchDecisionModal ev={dispatchModal.ev} initialMode={dispatchModal.initialMode} onClose={() => setDispatchModal(null)} onConfirm={doBooking} />
      )}
      {justBooked && <BookedSuccessModal justBooked={justBooked} onClose={() => setJustBooked(null)} onGoToAllocation={() => { setJustBooked(null); setView("allocation"); }} />}
    </>
  );
}

function BookedSuccessModal({ justBooked, onClose, onGoToAllocation }) {
  return (
    <Modal onClose={onClose} width={440}>
      <div style={{ textAlign: "center", padding: "10px 0" }}>
        <CheckCircle2 size={44} color="var(--success)" style={{ marginBottom: 10 }} />
        <h2 style={{ marginBottom: 6 }}>ดำเนินการสำเร็จ!</h2>
        <div className="kpi-sub" style={{ marginBottom: 14 }}>เลขที่เที่ยว: <b style={{ color: "var(--text)" }}>{justBooked.tripIds.join(", ")}</b></div>
        <div className="card" style={{ textAlign: "left", marginBottom: 16 }}>
          <div className="kpi-sub">จำนวน Order: <b>{justBooked.count}</b></div>
          <div className="kpi-sub">รูปแบบ: <b>{justBooked.mode === "FTL" ? "เหมาเที่ยว" : "รายกล่อง"}</b></div>
          <div className="kpi-sub">ผู้ประกอบการ: <b>{vendorName(justBooked.vendor)}</b></div>
          <div className="kpi-sub">ต้นทุน: <b>฿{justBooked.cost.toLocaleString()}</b></div>
          <div className="kpi-sub">สถานะเริ่มต้น: <b>Requested</b></div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn secondary" style={{ flex: 1, justifyContent: "center" }} onClick={onClose}>ปิด</button>
          <button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={onGoToAllocation}><ClipboardList size={13} /> ไปที่ Allocation Board</button>
        </div>
      </div>
    </Modal>
  );
}

// Shared decision UI for both the auto-simulation and manual-dispatch booking flows:
// 1) pick mode (FTL/Parcel — system recommends, human decides) 2) pick the executing vendor
// (system recommends the vendor matching the stock's actual origin) 3) confirm / cancel popup.
function DispatchDecisionModal({ ev, initialMode, onClose, onConfirm }) {
  const [mode, setMode] = useState(initialMode || ev.best.mode);
  const [vendor, setVendor] = useState(ev.origin);
  const [confirming, setConfirming] = useState(false);
  const vendorList = mode === "FTL" ? FTL_VENDORS : PARCEL_VENDORS;
  const chosenOpt = ev.all.find((o) => o.mode === mode);
  const wastedCost = ev.mixedRoutes && ev.splitCostTotal != null ? ev.best.cost - ev.splitCostTotal : null;

  if (confirming) {
    return (
      <Modal onClose={onClose} width={440}>
        <h2>ยืนยันการจัดรถ?</h2>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="kpi-sub">ต้นทาง (สินค้าอยู่ที่): <b style={{ color: "var(--text)" }}>{CARRIER_LABEL[ev.origin]}</b></div>
          <div className="kpi-sub">รูปแบบ: <b style={{ color: "var(--text)" }}>{mode === "FTL" ? "เหมาเที่ยว" : "รายกล่อง"}</b></div>
          <div className="kpi-sub">ผู้ประกอบการดำเนินการ: <b style={{ color: "var(--text)" }}>{vendorName(vendor)}</b></div>
          <div className="kpi-sub">จำนวน Order: <b style={{ color: "var(--text)" }}>{ev.numOrders}</b> · Cube: <b style={{ color: "var(--text)" }}>{ev.totalCube} CBM</b></div>
          <div className="kpi-val" style={{ marginTop: 8 }}>฿{chosenOpt.cost.toLocaleString()}</div>
        </div>
        {wastedCost != null && wastedCost > 0 && (
          <div className="kpi-sub" style={{ color: "var(--danger)", marginBottom: 14 }}>⚠ การรวมเส้นทางนี้แพงกว่าแยกเที่ยวประมาณ ฿{wastedCost.toLocaleString()} — ยังต้องการดำเนินการต่อหรือไม่?</div>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn secondary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setConfirming(false)}>ย้อนกลับ</button>
          <button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => onConfirm(mode, vendor)}>ยืนยัน</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose} width={560}>
      <h2>จัดรถ — เลือกรูปแบบและผู้ประกอบการ</h2>
      <div className="kpi-sub" style={{ marginBottom: 4 }}>
        ต้นทางสินค้า (ข้อเท็จจริงจากคลัง — ไม่ใช่ตัวเลือก): <b style={{ color: "var(--amber)" }}>{CARRIER_LABEL[ev.origin]}</b>
      </div>
      {ev.mixedOrigin && <div className="kpi-sub" style={{ color: "var(--danger)", marginBottom: 6 }}>⚠ Order ที่เลือกมีต้นทางปนกัน (ทั้ง HQ และ TKS) — ต้นทุนคำนวณจากต้นทางส่วนใหญ่เท่านั้น แนะนำให้แยกจัดเป็นคนละกลุ่มตามต้นทางจริง</div>}
      {ev.mixedRoutes && ev.compat && ev.compat.level === "diverging" && (
        <div className="card" style={{ marginBottom: 10, borderColor: "var(--danger)", background: "rgba(241,91,113,0.06)" }}>
          <div style={{ fontWeight: 700, color: "var(--danger)", marginBottom: 4 }}>⚠ เส้นทางฉีกออกไปคนละทิศ!</div>
          <div className="kpi-sub">รวม {ev.routesInvolved.join(" + ")} เข้าด้วยกัน — จุดที่ห่างที่สุดคือ {ev.compat.worstPair[0]} ↔ {ev.compat.worstPair[1]} ห่างกันประมาณ <b>{ev.compat.maxDistanceKm.toLocaleString()} กม.</b></div>
          {ev.splitCostTotal != null && (
            <div className="kpi-sub" style={{ marginTop: 6 }}>
              ถ้ารวมเที่ยว: <b style={{ color: "var(--danger)" }}>฿{ev.best.cost.toLocaleString()}</b> · ถ้าแยกเที่ยวตามเส้นทาง: <b style={{ color: "var(--success)" }}>฿{ev.splitCostTotal.toLocaleString()}</b>
              {ev.best.cost > ev.splitCostTotal && <> — <b style={{ color: "var(--danger)" }}>แพงกว่า ฿{(ev.best.cost - ev.splitCostTotal).toLocaleString()}</b> ถ้าฝืนรวม</>}
            </div>
          )}
        </div>
      )}
      {ev.mixedRoutes && ev.compat && ev.compat.level === "mixed" && (
        <div className="kpi-sub" style={{ color: "var(--orange)", marginBottom: 10 }}>⚠ Order คาบเกี่ยวหลายเส้นทางที่ค่อนข้างห่างกัน ({ev.routesInvolved.join(", ")}) — ใช้ {ev.dominantArea} เป็นเส้นทางหลักในการคำนวณ ({ev.compat.maxDistanceKm.toLocaleString()} กม. ระหว่างจุดไกลสุด)</div>
      )}

      <div className="kpi-sub" style={{ margin: "10px 0 6px", fontWeight: 600 }}>1) รูปแบบการจัดส่ง — ระบบแนะนำ: {ev.best.mode === "FTL" ? "เหมาเที่ยว" : "รายกล่อง"}</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        {ev.all.map((opt) => (
          <div key={opt.mode} onClick={() => { setMode(opt.mode); setVendor(ev.origin); }}
            className="card" style={{ flex: 1, cursor: "pointer", border: mode === opt.mode ? "2px solid var(--amber)" : undefined }}>
            <div style={{ fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>{opt.mode === "FTL" && <TruckIconSVG type={opt.vehicleType} size={20} color="var(--amber)" />}{opt.mode === "FTL" ? "เหมาเที่ยว (FTL)" : "รายกล่อง (Parcel)"}</div>
            <div className="kpi-val" style={{ fontSize: 18 }}>฿{opt.cost.toLocaleString()}</div>
            {opt === ev.best && <span className="tag-status Arrived">แนะนำ</span>}
            <div className="kpi-sub" style={{ color: opt.real ? "var(--success)" : "var(--orange)" }}>{opt.real ? "อ้างอิง Rate Card จริง" : opt.note}</div>
          </div>
        ))}
      </div>

      <div className="kpi-sub" style={{ margin: "10px 0 6px", fontWeight: 600 }}>2) เลือกผู้ประกอบการที่จะดำเนินการ (แนะนำ: {CARRIER_LABEL[ev.origin]} — เจ้าของต้นทางเดิม)</div>
      <select value={vendor} onChange={(e) => setVendor(e.target.value)} style={{ width: "100%", marginBottom: 16, background: "var(--panel-raised)", border: "1px solid var(--border)", borderRadius: 7, padding: "8px 10px", color: "var(--text)" }}>
        {vendorList.map((v) => <option key={v.id} value={v.id}>{CARRIER_LABEL[v.id] || v.name}{v.id === ev.origin ? " (ต้นทางเดิม — แนะนำ)" : ""}</option>)}
      </select>

      <button className="btn" style={{ width: "100%", justifyContent: "center" }} onClick={() => setConfirming(true)}>ตรวจสอบ &amp; ยืนยัน</button>
    </Modal>
  );
}

/* ================================================================== */
/* ROUTE MAP — HQ → destination zones, plotted from real coordinates   */
/* ================================================================== */

function TmsRouteMap({ orders: liveOrders }) {
  const [source, setSource] = useState("BAT-0");
  const [selectedZone, setSelectedZone] = useState(null);

  const orders = source === "live" ? liveOrders.filter((o) => o.date === "2569-07-08") : ORDER_BATCHES[Number(source.split("-")[1])].orders;
  const batch = source === "live" ? null : ORDER_BATCHES[Number(source.split("-")[1])];

  const byZone = {};
  orders.forEach((o) => {
    const z = AREA_TO_ZONE[o.area] || "BKK";
    if (!byZone[z]) byZone[z] = { area: o.area, orders: [], cube: 0 };
    byZone[z].orders.push(o); byZone[z].cube += o.cube;
  });
  const zoneEntries = Object.entries(byZone);
  const maxCube = Math.max(...zoneEntries.map(([, v]) => v.cube), 0.1);
  const hqXY = projectLatLng(HQ_COORD.lat, HQ_COORD.lng);

  return (
    <>
      <div className="kpi-sub" style={{ marginBottom: 14 }}>ต้นทาง: <b>{HQ_COORD.name}</b> — {HQ_COORD.address} · จำลองปลายทางจาก Order จริงในระบบ</div>
      <div className="field" style={{ maxWidth: 460, marginBottom: 16 }}>
        <label>ชุดข้อมูลทดสอบ</label>
        <select value={source} onChange={(e) => { setSource(e.target.value); setSelectedZone(null); }}>
          {ORDER_BATCHES.map((b, i) => <option key={i} value={`BAT-${i}`}>{b.name} — {b.desc}</option>)}
          <option value="live">ข้อมูลจาก WMS Sync (วันนี้)</option>
        </select>
      </div>
      {batch && <div className="kpi-sub" style={{ marginBottom: 16 }}>{batch.desc}</div>}

      <div className="section-title" style={{ marginTop: 0 }}>แผนที่จริง (Google Maps) — เส้นทางจาก HQ ไปทุกปลายทาง</div>
      <div className="card" style={{ padding: 10, marginBottom: 20 }}>
        <GoogleLiveMap stops={zoneEntries.map(([zone]) => ZONE_COORDS[zone])} height={460} />
        <div className="kpi-sub" style={{ textAlign: "center", marginTop: 8 }}>เส้นทางขับจริงจาก SYNNEX HQ (ลาดพร้าว) ผ่านทุกปลายทางที่มี Order ในชุดข้อมูลนี้ — ดึงจาก Google Maps โดยตรง</div>
      </div>

      <div className="grid g4" style={{ marginBottom: 18 }}>
        <div className="card"><h3>จำนวน Order</h3><div className="kpi-val">{orders.length}</div></div>
        <div className="card"><h3>Cube รวม</h3><div className="kpi-val">{orders.reduce((a, o) => a + o.cube, 0).toFixed(2)} CBM</div></div>
        <div className="card"><h3>จำนวนปลายทาง</h3><div className="kpi-val">{zoneEntries.length}</div></div>
        <div className="card"><h3>ต้นทาง</h3><div className="kpi-val" style={{ fontSize: 16 }}>ลาดพร้าว, กทม.</div></div>
      </div>

      <div className="section-title">แผนผังโต้ตอบ (คลิกที่โซนเพื่อดูรายละเอียด Order)</div>
      <div className="grid" style={{ gridTemplateColumns: "420px 1fr", gap: 16, alignItems: "flex-start" }}>
        <div className="card" style={{ padding: 10 }}>
          <svg viewBox="0 0 400 600" width="100%" style={{ background: "var(--panel-raised)", borderRadius: 10 }}>
            {zoneEntries.map(([zone, v]) => {
              const c = ZONE_COORDS[zone]; const p = projectLatLng(c.lat, c.lng);
              const w = 1.5 + (v.cube / maxCube) * 7;
              return <line key={zone} x1={hqXY.x} y1={hqXY.y} x2={p.x} y2={p.y} stroke="var(--amber)" strokeWidth={w} opacity="0.55" strokeLinecap="round" />;
            })}
            {zoneEntries.map(([zone, v]) => {
              const c = ZONE_COORDS[zone]; const p = projectLatLng(c.lat, c.lng);
              const r = 6 + Math.sqrt(v.orders.length) * 3;
              return (
                <g key={zone} style={{ cursor: "pointer" }} onClick={() => setSelectedZone(zone)}>
                  <circle cx={p.x} cy={p.y} r={r} fill={selectedZone === zone ? "var(--success)" : "var(--teal)"} opacity="0.85" stroke="#fff" strokeWidth="1.5" />
                  <text x={p.x} y={p.y + r + 13} textAnchor="middle" fontSize="11" fill="var(--text)" fontWeight="600">{zone}</text>
                  <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">{v.orders.length}</text>
                </g>
              );
            })}
            <g>
              <circle cx={hqXY.x} cy={hqXY.y} r="9" fill="var(--danger)" stroke="#fff" strokeWidth="2" />
              <text x={hqXY.x} y={hqXY.y - 15} textAnchor="middle" fontSize="11" fill="var(--danger)" fontWeight="700">HQ</text>
            </g>
          </svg>
          <div className="kpi-sub" style={{ textAlign: "center", marginTop: 8 }}>🔴 HQ (ต้นทาง) · 🔵 ปลายทางแต่ละโซน (คลิกดูรายละเอียด) · เส้นหนา = Cube มาก · แผนที่แบบย่อเพื่อการอ้างอิง</div>
        </div>

        <div>
          <div className="section-title" style={{ marginTop: 0 }}>สรุปตามปลายทาง</div>
          <div className="table-wrap" style={{ marginBottom: 16 }}>
            <table>
              <thead><tr><th>โซนปลายทาง</th><th>ระยะทางประมาณ</th><th>จำนวน Order</th><th>Cube รวม</th></tr></thead>
              <tbody>
                {zoneEntries.map(([zone, v]) => (
                  <tr key={zone} className="clickable" onClick={() => setSelectedZone(zone)} style={selectedZone === zone ? { background: "var(--panel-raised)" } : {}}>
                    <td>{v.area} <span className="sys-tag ASRS">{zone}</span></td>
                    <td className="mono">{ROUTE_INFO[v.area]?.distanceKm || "-"} กม.</td>
                    <td>{v.orders.length}</td><td className="mono">{v.cube.toFixed(2)} CBM</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedZone && (
            <>
              <div className="section-title">Order ที่ไปโซน {selectedZone} ({byZone[selectedZone].area})</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Order</th><th>ลูกค้า</th><th>สินค้า</th><th>Cube</th><th>Platform</th></tr></thead>
                  <tbody>
                    {byZone[selectedZone].orders.map((o) => (
                      <tr key={o.id}><td className="mono">{o.id}</td><td>{o.customer}</td><td>{productFor(o.id).name}</td><td className="mono">{o.cube}</td><td>{o.platform}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function TmsCarrierMaster() {
  return (
    <>
      <div className="kpi-sub" style={{ marginBottom: 20 }}>ข้อมูลอัตราค่าขนส่งจริง จากไฟล์ MDC_TKS_Dashboard_Q1_2569.xlsx — ใช้เปรียบเทียบว่าจะส่งแบบ <b>เหมาเที่ยว (Sheet "อัตรา_Territory")</b> หรือ <b>รายกล่อง (Sheet "DHL_Rate_Card")</b> คุ้มกว่า</div>

      <div className="section-title" style={{ marginTop: 0 }}>1) เหมาเที่ยว (Charter) — บาท/เที่ยว · Sheet "อัตรา_Territory"</div>
      <div className="grid g2" style={{ marginBottom: 10 }}>
        {["MDC", "TKS"].map((carrier) => (
          <div className="card" key={carrier}>
            <h3>{CARRIER_LABEL[carrier]} — อัตราเฉลี่ย/เที่ยว (Q1/2569)</h3>
            <div className="kpi-val">฿{CHARTER_AVG_TRIP[carrier].toLocaleString()}</div>
            <div className="kpi-sub">กทม + ปริมณฑล (กระบะ + หกล้อ ราคาเดียวกัน)</div>
          </div>
        ))}
      </div>
      <div className="kpi-sub" style={{ marginBottom: 14 }}>⚠ ครอบคลุมเฉพาะ กทม+ปริมณฑล — โซนต่างจังหวัดใช้ค่าประมาณการจากขนาดรถ+ระยะทางแทน (ไม่มี Rate Card เจรจาไว้ในไฟล์นี้)</div>
      <div className="grid g2" style={{ marginBottom: 30 }}>
        {["MDC", "TKS"].map((carrier) => (
          <div className="table-wrap" key={carrier}>
            <table>
              <thead><tr><th colSpan={2}>{CARRIER_LABEL[carrier]} — Territory (เส้นทาง)</th></tr><tr><th>กลุ่มพื้นที่ (Territory)</th><th>ราคา/เที่ยว (฿)</th></tr></thead>
              <tbody>
                {TERRITORY_RATES[carrier].map((t, i) => (
                  <tr key={i}><td style={{ fontSize: 11.5 }}>{t.territory}</td><td className="mono">{t.price.toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="section-title">2) รายกล่อง (Parcel) — บาท/กล่อง · Sheet "DHL_Rate_Card"</div>
      {["MDC", "TKS"].map((carrier) => (
        <div key={carrier} style={{ marginBottom: 22 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{CARRIER_LABEL[carrier]} — อัตรา DHL (฿/กล่อง)</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>น้ำหนัก</th>{DHL_ZONES.map((z) => <th key={z}>{z}</th>)}</tr></thead>
              <tbody>
                {DHL_BRACKETS.map((b, i) => (
                  <tr key={i}><td className="mono">{b.label}</td>{b[carrier].map((v, j) => <td key={j} className="mono">{v}</td>)}</tr>
                ))}
                <tr><td colSpan={7} style={{ fontSize: 11.5, color: "var(--muted)" }}>เกิน 100 kg: +{OVER_100KG_SURCHARGE[carrier]} บาท/กก.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}

/* ================================================================== */
/* GLOBAL STYLE (same visual identity as PANDORA WMS)                  */
/* ================================================================== */

/* ================================================================== */
/* 3.1 SHIPMENT MANAGEMENT — lifecycle, consolidation, split            */
/* ================================================================== */

function TmsShipments({ shipments, setShipments, setOrders, setTrips }) {
  const [filter, setFilter] = useState("all");
  const advance = (s) => {
    const idx = SHIPMENT_STATUSES.indexOf(s.status);
    const next = SHIPMENT_STATUSES[idx + 1];
    if (!next || next === "Exception") return;
    if (next === "Carrier Assigned" && !s.tripId) return;
    setShipments((list) => list.map((x) => (x.id === s.id ? { ...x, status: next } : x)));
    const orderStatus = next === "Delivered" ? "สำเร็จ" : ["Dispatched", "In-Transit"].includes(next) ? "กำลังจัดส่ง" : next === "Carrier Assigned" ? "จัดรถแล้ว" : "รอจัดสรร";
    setOrders((list) => list.map((order) => order.id === s.orderId ? { ...order, status: orderStatus, tripId: s.tripId } : order));
    if (s.tripId) {
      const tripStatus = next === "Delivered" ? "Delivered" : next === "In-Transit" ? "In Transit" : next === "Dispatched" ? "Confirmed" : next === "Carrier Assigned" ? "Confirmed" : "Requested";
      setTrips((list) => list.map((trip) => trip.id === s.tripId ? { ...trip, status: tripStatus } : trip));
    }
  };
  const filtered = filter === "all" ? shipments : shipments.filter((s) => s.status === filter);
  const counts = SHIPMENT_STATUSES.map((st) => ({ st, n: shipments.filter((s) => s.status === st).length }));

  return (
    <>
      <div className="kpi-sub" style={{ marginBottom: 14 }}>Shipment Status Lifecycle: Draft → Planned → Carrier Assigned → Dispatched → In-Transit → Delivered / Exception</div>
      <div className="grid g4" style={{ marginBottom: 18, gridTemplateColumns: "repeat(7,1fr)" }}>
        {counts.map((c) => (
          <div className="card" key={c.st} onClick={() => setFilter(c.st)} style={{ cursor: "pointer", padding: 12, border: filter === c.st ? "2px solid var(--amber)" : undefined }}>
            <h3 style={{ fontSize: 10.5 }}>{c.st}</h3><div className="kpi-val" style={{ fontSize: 20 }}>{c.n}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 12 }}><span className="chip active" onClick={() => setFilter("all")}>แสดงทั้งหมด</span></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Shipment</th><th>Order</th><th>Trip / รถ</th><th>ลูกค้า</th><th>ปลายทาง</th><th>Service Type</th><th>Carrier</th><th>Priority</th><th>สถานะ</th><th></th></tr></thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td className="mono">{s.id}{s.consolidated && <span className="sys-tag ASRS" style={{ marginLeft: 6 }}>Consolidated</span>}{s.split && <span className="sys-tag Manual" style={{ marginLeft: 6 }}>Split</span>}</td>
                <td className="mono">{s.orderId}</td><td className="mono">{s.tripId || "ยังไม่จัดรถ"}{s.vehicleId && <small style={{ display: "block" }}>{s.vehicleId}</small>}</td><td>{s.customer}</td><td>{s.area}</td>
                <td>{SERVICE_TYPES.find((t) => t.id === s.serviceType)?.name.split(" — ")[0] || s.serviceType}</td>
                <td>{vendorName(s.carrier)}</td>
                <td>{s.priority === "VIP" ? <span className="tag-status Hold">VIP</span> : "Normal"}</td>
                <td><span className={`tag-status ${s.status === "Delivered" ? "Arrived" : s.status === "Exception" ? "Hold" : s.status === "In-Transit" || s.status === "Dispatched" ? "Receiving" : "Booked"}`}>{s.status}</span></td>
                <td>{s.status !== "Delivered" && s.status !== "Exception" && <button className="btn secondary" disabled={s.status === "Planned" && !s.tripId} onClick={() => advance(s)}>{s.status === "Planned" && !s.tripId ? "รอจัดรถ" : "ขั้นต่อไป"}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================== */
/* 3.6 SLOT BOOKING — Inbound / Outbound / Customer                     */
/* ================================================================== */

function SlotTable({ title, icon: Icon, rows, onAdd }) {
  const util = Math.round((rows.filter((r) => r.status === "Confirmed").length / rows.length) * 100) || 0;
  return (
    <div style={{ marginBottom: 26 }}>
      <div className="section-title" style={{ marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}><Icon size={14} /> {title} <span className="kpi-sub" style={{ marginLeft: "auto" }}>Utilization {util}%</span></div>
      <div className="progress-track" style={{ marginBottom: 10 }}><div className="progress-fill" style={{ width: `${util}%`, background: "var(--success)" }} /></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Slot</th><th>วันที่</th><th>เวลา</th><th>Dock</th><th>คู่ค้า</th><th>สถานะ</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="mono">{r.id}</td><td className="mono">{r.date}</td><td className="mono">{r.time}</td><td>{r.dock}</td><td>{r.party}</td>
                <td><span className={`tag-status ${r.status === "Confirmed" ? "Arrived" : r.status === "Late/No-Show" ? "Hold" : "Booked"}`}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn secondary" style={{ marginTop: 10 }} onClick={onAdd}><PlusCircle size={13} /> จอง Slot ใหม่</button>
    </div>
  );
}
function TmsSlots({ slots, setSlots }) {
  const addSlot = (kind) => {
    const id = `${kind.slice(0, 2).toUpperCase()}-SLOT-${rand(300, 999)}`;
    const row = { id, date: "2569-07-09", time: pick(["08:00", "10:00", "13:00", "15:00"]), dock: `Dock-${rand(1, 4)}`, party: "New Booking", status: "Pending" };
    setSlots((s) => ({ ...s, [kind]: [row, ...s[kind]] }));
  };
  return (
    <>
      <div className="kpi-sub" style={{ marginBottom: 16 }}>Auto-Reminder แจ้งเตือนคู่ค้า 24 ชม. และ 2 ชม. ก่อนเวลา Slot · Late/No-Show จะแจ้งเตือน Supervisor อัตโนมัติ</div>
      <SlotTable title="Inbound Slot — Supplier มาส่งสินค้า" icon={Boxes} rows={slots.inbound} onAdd={() => addSlot("inbound")} />
      <SlotTable title="Outbound Slot — Carrier มารับสินค้า" icon={Truck} rows={slots.outbound} onAdd={() => addSlot("outbound")} />
      <SlotTable title="Customer Delivery Slot — นัดส่งลูกค้า" icon={Users} rows={slots.customer} onAdd={() => addSlot("customer")} />
    </>
  );
}

/* ================================================================== */
/* 3.4 SERVICE TYPE SELECTION                                           */
/* ================================================================== */

/* ================================================================== */
/* ORDER → VEHICLE/TRIP ALLOCATION BOARD                                */
/* ================================================================== */

function TmsAllocationBoard({ trips, vehicles, orders, setView, operatingDate: date, setOperatingDate: setDate }) {
  const dayTrips = trips.filter((t) => t.date === date);
  const withDetail = dayTrips.filter((t) => t.orderDetails);
  const withoutDetail = dayTrips.filter((t) => !t.orderDetails);

  const dayOrders = orders.filter((o) => o.date === date);
  const allocatedIds = new Set(withDetail.flatMap((t) => t.orderIds || []));
  const unallocated = dayOrders.filter((o) => !allocatedIds.has(o.id));

  const vehicleOf = (id) => vehicles.find((v) => v.id === id);

  return (
    <>
      <div className="kpi-sub" style={{ marginBottom: 14 }}>ขอบเขตการจัดสรร Order เข้ารถ/เที่ยว — ดูว่า Order ไหนถูกจัดลงรถคันไหน/เที่ยวไหน และ Order ไหนยังไม่ถูกจัดสรร (สร้างข้อมูลนี้จากการ "เรียกรถ" ในหน้า Simulation)</div>
      <div className="field" style={{ maxWidth: 260, marginBottom: 18 }}>
        <label>วันที่</label><input value={date} onChange={(e) => setDate(e.target.value)} placeholder="2569-07-08" />
      </div>

      <div className="grid g4" style={{ marginBottom: 20 }}>
        <div className="card"><h3>Order ทั้งหมดวันนี้</h3><div className="kpi-val">{dayOrders.length}</div></div>
        <div className="card"><h3>จัดสรรแล้ว</h3><div className="kpi-val" style={{ color: "var(--success)" }}>{allocatedIds.size}</div></div>
        <div className="card"><h3>ยังไม่จัดสรร</h3><div className="kpi-val" style={{ color: unallocated.length ? "var(--danger)" : "var(--success)" }}>{unallocated.length}</div></div>
        <div className="card"><h3>จำนวนรถ/เที่ยวที่ใช้</h3><div className="kpi-val">{withDetail.length}</div></div>
      </div>

      <div className="section-title" style={{ marginTop: 0 }}>รถ/เที่ยว ที่จัดสรรแล้ว (มีรายละเอียด Order)</div>
      {withDetail.length === 0 && <div className="card kpi-sub" style={{ textAlign: "center", padding: 24, marginBottom: 20 }}>ยังไม่มีการเรียกรถที่มีรายละเอียด Order สำหรับวันนี้ — ลองไปที่หน้า Simulation จัดรถ &amp; เรียกรถ แล้วกดเรียกรถสำหรับวันที่นี้</div>}
      <div className="grid g2" style={{ marginBottom: 26, alignItems: "flex-start" }}>
        {withDetail.map((t) => {
          const veh = vehicleOf(t.vehicleId);
          const capCbm = veh ? Math.round(veh.capacityKg / 150) : 8;
          const util = Math.min(100, Math.round((t.cube / capCbm) * 100));
          return (
            <div className="card" key={t.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{t.id} — {t.mode === "FTL" ? (veh ? `${veh.plate} (${veh.type})` : "รถเหมาเที่ยว") : "Parcel Courier"}</div>
                  <div className="kpi-sub">{t.route} · {vendorName(t.carrier)} · {t.orderDetails.length} Order · {t.cube.toFixed ? t.cube.toFixed(2) : t.cube} CBM</div>
                </div>
                <span className={`tag-status ${t.status === "Delivered" ? "Arrived" : t.status === "In Transit" ? "Receiving" : "Booked"}`}>{t.status}</span>
              </div>
              {t.mode === "FTL" && (
                <>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${util}%`, background: util > 90 ? "var(--danger)" : "var(--success)" }} /></div>
                  <div className="kpi-sub" style={{ marginBottom: 8 }}>ใช้พื้นที่รถ {util}% (สมมติ Capacity ~{capCbm} CBM)</div>
                </>
              )}
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Order</th><th>ลูกค้า</th><th>สินค้า</th><th>Cube</th></tr></thead>
                  <tbody>
                    {t.orderDetails.map((o) => (<tr key={o.id}><td className="mono">{o.id}</td><td>{o.customer}</td><td style={{ fontSize: 12 }}>{o.product}</td><td className="mono">{o.cube}</td></tr>))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {withoutDetail.length > 0 && (
        <>
          <div className="section-title">เที่ยวรถอื่นในวันนี้ (ข้อมูลสรุป — ไม่มีรายละเอียดระดับ Order)</div>
          <div className="table-wrap" style={{ marginBottom: 26 }}>
            <table>
              <thead><tr><th>Trip</th><th>สาย</th><th>โหมด</th><th>ผู้ให้บริการ</th><th>Order</th><th>Cube</th><th>สถานะ</th></tr></thead>
              <tbody>
                {withoutDetail.map((t) => (
                  <tr key={t.id}><td className="mono">{t.id}</td><td>{t.route}</td><td>{t.mode}</td><td>{vendorName(t.carrier)}</td><td>{t.orders}</td><td className="mono">{t.cube}</td>
                    <td><span className={`tag-status ${t.status === "Delivered" ? "Arrived" : t.status === "In Transit" ? "Receiving" : "Booked"}`}>{t.status}</span></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="section-title action-title"><span>Order ที่ยังไม่ถูกจัดสรรเข้ารถ/เที่ยวใด</span>{unallocated.length > 0 && <button className="btn" onClick={() => setView("manualdispatch")}><Truck size={13} /> ไปจัดรถ {unallocated.length} Order</button>}</div>
      {unallocated.length === 0 ? (
        <div className="card kpi-sub" style={{ textAlign: "center", padding: 20, color: "var(--success)" }}>✓ Order ทั้งหมดถูกจัดสรรครบแล้ว</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order</th><th>ลูกค้า</th><th>สินค้า</th><th>พื้นที่จัดส่ง</th><th>Cube</th></tr></thead>
            <tbody>
              {unallocated.map((o) => (<tr key={o.id}><td className="mono">{o.id}</td><td>{o.customer}</td><td style={{ fontSize: 12 }}>{productFor(o.id).name}</td><td>{o.area}</td><td className="mono">{o.cube}</td></tr>))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function TmsServiceType() {
  const [form, setForm] = useState({ weightKg: 500, cubeCbm: 5, boxCount: 1, radiusKm: 30, orderHour: 10, hasAppointment: false, isReturn: false, isMilkRun: false });
  const rec = recommendServiceType(form);
  const recType = SERVICE_TYPES.find((t) => t.id === rec);
  return (
    <>
      <div className="kpi-sub" style={{ marginBottom: 16 }}>ระบบรองรับ 10 รูปแบบบริการ และสามารถผสมหลายรูปแบบในแผนเดียวกันได้ (เช่น FTL จุดแรก → LTL Drop จุดกลาง → Parcel Hand-off)</div>
      <div className="grid g2" style={{ marginBottom: 20, alignItems: "flex-start" }}>
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>คำนวณ Service Type ที่แนะนำ</h3>
          <div className="grid g2">
            <div className="field"><label>น้ำหนัก (kg)</label><input type="number" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })} /></div>
            <div className="field"><label>Cube (CBM)</label><input type="number" value={form.cubeCbm} onChange={(e) => setForm({ ...form, cubeCbm: Number(e.target.value) })} /></div>
            <div className="field"><label>จำนวนกล่อง</label><input type="number" value={form.boxCount} onChange={(e) => setForm({ ...form, boxCount: Number(e.target.value) })} /></div>
            <div className="field"><label>Radius จากคลัง (กม.)</label><input type="number" value={form.radiusKm} onChange={(e) => setForm({ ...form, radiusKm: Number(e.target.value) })} /></div>
            <div className="field"><label>เวลารับ Order (ชม.)</label><input type="number" value={form.orderHour} onChange={(e) => setForm({ ...form, orderHour: Number(e.target.value) })} /></div>
          </div>
          <label style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 6 }}><input type="checkbox" checked={form.hasAppointment} onChange={(e) => setForm({ ...form, hasAppointment: e.target.checked })} /> มีนัดหมายลูกค้า (Appointment)</label>
          <label style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 6 }}><input type="checkbox" checked={form.isMilkRun} onChange={(e) => setForm({ ...form, isMilkRun: e.target.checked })} /> ส่งหลายจุด (Multi-Drop)</label>
          <label style={{ display: "flex", gap: 8, fontSize: 13, marginBottom: 10 }}><input type="checkbox" checked={form.isReturn} onChange={(e) => setForm({ ...form, isReturn: e.target.checked })} /> เป็น Return Pickup</label>
        </div>
        <div className="card" style={{ border: "2px solid var(--success)" }}>
          <h3>ระบบแนะนำ</h3>
          <div className="kpi-val" style={{ fontSize: 20 }}>{recType.name}</div>
          <div className="kpi-sub" style={{ marginBottom: 8 }}>{recType.desc}</div>
          <div className="kpi-sub">เกณฑ์: {recType.rule}</div>
        </div>
      </div>
      <div className="section-title">รูปแบบบริการทั้งหมด (10 Service Type)</div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>รูปแบบบริการ</th><th>คำอธิบาย</th><th>เกณฑ์การเลือกอัตโนมัติ</th></tr></thead>
          <tbody>{SERVICE_TYPES.map((t, i) => (<tr key={t.id} style={t.id === rec ? { background: "var(--panel-raised)" } : {}}><td>{i + 1}</td><td>{t.name}</td><td style={{ fontSize: 12 }}>{t.desc}</td><td style={{ fontSize: 12 }}>{t.rule}</td></tr>))}</tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================== */
/* 3.5 ROUTE OPTIMIZATION — Multi-Drop nearest-neighbor sequencing      */
/* ================================================================== */

function TmsRouteOptimization({ orders }) {
  const [selected, setSelected] = useState(["BKK", "Central", "East"]);
  const toggle = (z) => setSelected((s) => (s.includes(z) ? s.filter((x) => x !== z) : [...s, z]));

  const stops = selected.map((z) => ({ zone: z, ...ZONE_COORDS[z] }));
  const sequence = [];
  let current = HQ_COORD;
  const remaining = [...stops];
  while (remaining.length) {
    remaining.sort((a, b) => {
      const da = Math.hypot(a.lat - current.lat, a.lng - current.lng);
      const db = Math.hypot(b.lat - current.lat, b.lng - current.lng);
      return da - db;
    });
    const next = remaining.shift();
    sequence.push(next);
    current = next;
  }
  const totalOrdersInSeq = sequence.reduce((a, s) => a + orders.filter((o) => AREA_TO_ZONE[o.area] === s.zone).length, 0);
  const hqXY = projectLatLng(HQ_COORD.lat, HQ_COORD.lng);

  return (
    <>
      <div className="kpi-sub" style={{ marginBottom: 14 }}>เลือกจุดส่ง (Multi-Drop) ระบบจะคำนวณลำดับ Stop Sequence ที่ใกล้ที่สุดจาก HQ ด้วย Nearest-Neighbor Heuristic</div>
      <div style={{ marginBottom: 16 }}>
        {Object.keys(ZONE_COORDS).map((z) => (
          <span key={z} className={`chip ${selected.includes(z) ? "active" : ""}`} style={{ marginRight: 8, marginBottom: 8 }} onClick={() => toggle(z)}>{z}</span>
        ))}
      </div>

      <div className="section-title" style={{ marginTop: 0 }}>แผนที่จริง (Google Maps) — เส้นทางตามลำดับที่ระบบแนะนำ</div>
      <div className="card" style={{ padding: 10, marginBottom: 20 }}>
        <GoogleMapEmbed stops={sequence} />
        <div className="kpi-sub" style={{ textAlign: "center", marginTop: 8 }}>เส้นทางขับจริงตามลำดับ Stop Sequence ที่ระบบคำนวณให้ (Nearest-Neighbor) — ดึงจาก Google Maps โดยตรง</div>
      </div>

      <div className="section-title">แผนผังโต้ตอบ</div>
      <div className="grid" style={{ gridTemplateColumns: "380px 1fr", gap: 16, alignItems: "flex-start" }}>
        <div className="card" style={{ padding: 10 }}>
          <svg viewBox="0 0 400 600" width="100%" style={{ background: "var(--panel-raised)", borderRadius: 10 }}>
            <polyline points={[hqXY, ...sequence.map((s) => projectLatLng(s.lat, s.lng))].map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="var(--amber)" strokeWidth="2.5" strokeDasharray="6 4" />
            <circle cx={hqXY.x} cy={hqXY.y} r="8" fill="var(--danger)" stroke="#fff" strokeWidth="2" />
            <text x={hqXY.x} y={hqXY.y - 14} textAnchor="middle" fontSize="11" fill="var(--danger)" fontWeight="700">HQ</text>
            {sequence.map((s, i) => {
              const p = projectLatLng(s.lat, s.lng);
              return (
                <g key={s.zone}>
                  <circle cx={p.x} cy={p.y} r="10" fill="var(--teal)" stroke="#fff" strokeWidth="1.5" />
                  <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">{i + 1}</text>
                  <text x={p.x} y={p.y + 22} textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="600">{s.zone}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div>
          <div className="grid g2" style={{ marginBottom: 14 }}>
            <div className="card"><h3>จำนวนจุดส่ง</h3><div className="kpi-val">{sequence.length}</div></div>
            <div className="card"><h3>จำนวน Order รวม</h3><div className="kpi-val">{totalOrdersInSeq}</div></div>
          </div>
          <div className="section-title" style={{ marginTop: 0 }}>Stop Sequence ที่แนะนำ</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ลำดับ</th><th>โซน</th><th>ที่อ้างอิง</th><th>จำนวน Order</th></tr></thead>
              <tbody>
                {sequence.map((s, i) => (
                  <tr key={s.zone}><td>{i + 1}</td><td>{s.zone}</td><td>{s.place}</td><td>{orders.filter((o) => AREA_TO_ZONE[o.area] === s.zone).length}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/* 3.8 REAL-TIME TRACK & TRACE                                          */
/* ================================================================== */

function TmsTrackTrace({ shipments }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 2000); return () => clearInterval(t); }, []);
  const active = shipments.filter((s) => s.status === "In-Transit" || s.status === "Dispatched").slice(0, 8);
  const milestones = ["Pickup", "Departed", "In-Transit", "At Hub", "At Destination", "Delivered"];
  const activeWithProgress = active.map((s, i) => ({ ...s, progress: ((tick * 5 + i * 17) % 100), vType: pick(VEHICLE_CATALOG_TYPES) }));

  const exceptions = active.filter((_, i) => i % 4 === 1).map((s) => ({ id: s.id, msg: pick(["ETA ล่าช้า > 30 นาที", "หยุดนาน > 1 ชม.", "ออกจาก Route ที่กำหนด"]) }));

  return (
    <>
      <div className="kpi-sub" style={{ marginBottom: 14 }}>GPS Refresh ≤30 วินาที · Multi-Shipment View — Planner ดูรถทุกคันในแผนที่เดียวพร้อมสถานะ Color-coded</div>

      <div className="section-title" style={{ marginTop: 0 }}>แผนที่จริง — ตำแหน่งรถที่กำลังวิ่งอยู่ตอนนี้ (Live)</div>
      <div className="card" style={{ padding: 10, marginBottom: 20 }}>
        <RealThailandMap height={520}>
          {(project) => {
            const hqXY = project(HQ_COORD.lat, HQ_COORD.lng);
            return (
              <>
                {activeWithProgress.map((s) => {
                  const z = AREA_TO_ZONE[s.area] || "BKK"; const c = ZONE_COORDS[z]; const p = project(c.lat, c.lng);
                  const t = s.progress / 100;
                  const cx = hqXY.x + (p.x - hqXY.x) * t, cy = hqXY.y + (p.y - hqXY.y) * t;
                  return <line key={s.id} x1={hqXY.x} y1={hqXY.y} x2={p.x} y2={p.y} stroke="var(--border)" strokeWidth="1.2" strokeDasharray="3 3" />;
                })}
                <circle cx={hqXY.x} cy={hqXY.y} r="7" fill="var(--danger)" stroke="#fff" strokeWidth="2" />
                <text x={hqXY.x} y={hqXY.y - 12} textAnchor="middle" fontSize="11" fill="var(--danger)" fontWeight="700">HQ</text>
                {activeWithProgress.map((s) => {
                  const z = AREA_TO_ZONE[s.area] || "BKK"; const c = ZONE_COORDS[z]; const p = project(c.lat, c.lng);
                  const t = s.progress / 100;
                  const cx = hqXY.x + (p.x - hqXY.x) * t, cy = hqXY.y + (p.y - hqXY.y) * t;
                  return (
                    <g key={s.id}>
                      <TruckIconSVG type={s.vType} size={20} color="var(--amber)" x={cx - 10} y={cy - 6} />
                      <text x={cx} y={cy - 13} textAnchor="middle" fontSize="9" fill="var(--text)" fontWeight="700">{s.id}</text>
                    </g>
                  );
                })}
              </>
            );
          }}
        </RealThailandMap>
        <div className="kpi-sub" style={{ textAlign: "center", marginTop: 8 }}>แผนที่จากขอบเขตประเทศไทยจริง — ไอคอนรถวิ่งจาก HQ ไปปลายทางตามเปอร์เซ็นต์ความคืบหน้าจริง</div>
      </div>

      <div className="grid g2" style={{ alignItems: "flex-start" }}>
        <div>
          <div className="section-title" style={{ marginTop: 0 }}>ความคืบหน้าการเดินทาง (Live)</div>
          {activeWithProgress.length === 0 && <div className="card kpi-sub" style={{ textAlign: "center", padding: 20 }}>ไม่มี Shipment ที่กำลังเดินทางอยู่ในขณะนี้</div>}
          {activeWithProgress.map((s) => {
            const mi = Math.min(milestones.length - 1, Math.floor((s.progress / 100) * milestones.length));
            return (
              <div className="card" key={s.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <TruckIconSVG type={s.vType} size={22} color="var(--amber)" />
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{s.id} — {s.area}</div>
                  </div>
                  <div className="mono kpi-sub">{s.progress}%</div>
                </div>
                <div className="kpi-sub" style={{ marginBottom: 6 }}>{s.customer} · {s.vType}</div>
                <div className="progress-track"><div className="progress-fill" style={{ width: `${s.progress}%`, background: "var(--amber)" }} /></div>
                <div className="kpi-sub" style={{ marginTop: 4 }}>สถานะล่าสุด: {milestones[mi]}</div>
              </div>
            );
          })}
        </div>
        <div>
          <div className="section-title" style={{ marginTop: 0 }}>Exception Alerts</div>
          {exceptions.length === 0 ? <div className="kpi-sub">ไม่มี Exception ในขณะนี้</div> : exceptions.map((e) => (
            <div className="card" key={e.id} style={{ marginBottom: 8, borderColor: "var(--danger)" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}><AlertTriangle size={14} color="var(--danger)" /><b style={{ fontSize: 12.5 }}>{e.id}</b></div>
              <div className="kpi-sub">{e.msg}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/* 3.7 VEHICLE & DRIVER MANAGEMENT                                      */
/* ================================================================== */

function TmsFleet({ vehicles, drivers }) {
  const activeCount = vehicles.filter((v) => v.status === "Active").length;
  const maintenanceCount = vehicles.filter((v) => v.status === "Maintenance").length;
  const avgFuel = (vehicles.reduce((a, v) => a + v.fuelCostPerKm, 0) / vehicles.length).toFixed(1);
  const byType = VEHICLE_CATALOG_TYPES.map((t) => ({ type: t, count: vehicles.filter((v) => v.type === t).length }));
  return (
    <>
      <div className="grid g4" style={{ marginBottom: 20 }}>
        <div className="card"><h3>รถทั้งหมด</h3><div className="kpi-val">{vehicles.length}</div></div>
        <div className="card"><h3>พร้อมใช้งาน</h3><div className="kpi-val" style={{ color: "var(--success)" }}>{activeCount}</div></div>
        <div className="card"><h3>อยู่ระหว่างซ่อมบำรุง</h3><div className="kpi-val" style={{ color: "var(--danger)" }}>{maintenanceCount}</div></div>
        <div className="card"><h3>ต้นทุนน้ำมันเฉลี่ย/กม.</h3><div className="kpi-val">฿{avgFuel}</div></div>
      </div>

      <div className="section-title" style={{ marginTop: 0 }}>องค์ประกอบยานพาหนะ (Fleet Mix)</div>
      <div className="grid g4" style={{ marginBottom: 20, gridTemplateColumns: "repeat(7,1fr)" }}>
        {byType.map((b) => (
          <div className="card" key={b.type} style={{ textAlign: "center", padding: 12 }}>
            <TruckIconSVG type={b.type} size={30} color="var(--amber)" />
            <div className="kpi-sub" style={{ fontSize: 10.5, marginTop: 6 }}>{b.type}</div>
            <div className="kpi-val" style={{ fontSize: 18 }}>{b.count}</div>
          </div>
        ))}
      </div>

      <div className="section-title">ทะเบียนรถ (Vehicle Master)</div>
      <div className="table-wrap" style={{ marginBottom: 26 }}>
        <table>
          <thead><tr><th></th><th>รหัส</th><th>ทะเบียน</th><th>ประเภท</th><th>เจ้าของ</th><th>น้ำหนักบรรทุก</th><th>สถานะ</th><th>PM ครั้งถัดไป</th><th>ค่าน้ำมัน/กม.</th></tr></thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id}>
                <td><TruckIconSVG type={v.type} size={26} color="var(--amber)" /></td>
                <td className="mono">{v.id}</td><td className="mono">{v.plate}</td><td>{v.type}</td><td>{v.owner}</td>
                <td className="mono">{v.capacityKg.toLocaleString()} kg</td>
                <td><span className={`tag-status ${v.status === "Active" ? "Arrived" : v.status === "Maintenance" ? "Hold" : "Booked"}`}>{v.status}</span></td>
                <td className="mono">{v.nextPM}</td><td className="mono">฿{v.fuelCostPerKm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="section-title">คนขับ (Driver Master &amp; Performance)</div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>รหัส</th><th>ชื่อ</th><th>ใบขับขี่</th><th>ประสบการณ์</th><th>On-Time Rate</th><th>POD Rate</th><th>Rating</th><th>Speeding</th><th>สถานะ</th></tr></thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id}>
                <td className="mono">{d.id}</td><td>{d.name}</td><td className="mono">{d.license}</td><td>{d.experienceYears} ปี</td>
                <td className="mono">{d.onTimeRate}%</td><td className="mono">{d.podRate}%</td>
                <td>★ {d.rating}</td><td>{d.speedingIncidents}</td>
                <td><span className={`tag-status ${d.status === "On Duty" ? "Arrived" : d.status === "On Trip" ? "Receiving" : "Booked"}`}>{d.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================== */
/* 3.9 PROOF OF DELIVERY (POD)                                          */
/* ================================================================== */

function TmsPOD({ pods }) {
  const [modal, setModal] = useState(false);
  const delivered = pods.filter((p) => p.delivered);
  const completionRate = ((delivered.length / pods.length) * 100).toFixed(1);
  const avgPodTime = (delivered.reduce((a, p) => a + p.podTimeMin, 0) / delivered.length).toFixed(0);
  const byReason = {};
  pods.filter((p) => !p.delivered).forEach((p) => { byReason[p.reason] = (byReason[p.reason] || 0) + 1; });
  const reasonData = Object.entries(byReason).map(([name, value]) => ({ name, value }));

  return (
    <>
      <div className="grid g4" style={{ marginBottom: 20 }}>
        <div className="card"><h3>POD Completion Rate</h3><div className="kpi-val" style={{ color: completionRate >= 97 ? "var(--success)" : "var(--danger)" }}>{completionRate}%</div><div className="kpi-sub">เป้าหมาย ≥97%</div></div>
        <div className="card"><h3>Average POD Time</h3><div className="kpi-val">{avgPodTime} นาที</div><div className="kpi-sub">Delivered - Departed</div></div>
        <div className="card"><h3>Non-Delivery</h3><div className="kpi-val" style={{ color: "var(--danger)" }}>{pods.length - delivered.length}</div></div>
        <div className="card"><h3>POD บันทึกทั้งหมด</h3><div className="kpi-val">{pods.length}</div></div>
      </div>
      <div style={{ marginBottom: 14 }}><button className="btn" onClick={() => setModal(true)}><Camera size={13} /> บันทึก POD ใหม่</button></div>
      <div className="grid g2" style={{ marginBottom: 20 }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>POD</th><th>Shipment</th><th>ผู้รับ / เหตุผล</th><th>เวลา POD</th><th>สถานะ</th></tr></thead>
            <tbody>
              {pods.map((p) => (
                <tr key={p.id}>
                  <td className="mono">{p.id}</td><td className="mono">{p.shipmentId}</td>
                  <td>{p.delivered ? p.receiver : <span style={{ color: "var(--danger)" }}>{p.reason}</span>}</td>
                  <td className="mono">{p.delivered ? `${p.podTimeMin} นาที` : "-"}</td>
                  <td><span className={`tag-status ${p.delivered ? "Arrived" : "Hold"}`}>{p.delivered ? "Delivered" : "Non-Delivery"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Non-Delivery Reason Analysis</h3>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={reasonData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={75} paddingAngle={3}>
                  {reasonData.map((_, i) => <Cell key={i} fill={["var(--danger)", "var(--orange)", "var(--amber)", "var(--teal)", "var(--muted)"][i % 5]} />)}
                </Pie>
                <Tooltip {...chartTip} /><Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {modal && (
        <Modal onClose={() => setModal(false)} width={420}>
          <h2>บันทึก POD ใหม่</h2>
          <div className="field"><label>Shipment ID</label><input placeholder="SHP-5000" /></div>
          <div className="field"><label>ผู้รับสินค้า</label><input placeholder="ชื่อผู้รับ" /></div>
          <div className="field"><label>รูปถ่ายสินค้า</label><input type="file" /></div>
          <div className="field"><label>ลายเซ็นลูกค้า</label><div style={{ height: 80, border: "1px dashed var(--border)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 12 }}>พื้นที่เซ็นชื่อ (Signature Pad)</div></div>
          <button className="btn" style={{ width: "100%", justifyContent: "center" }} onClick={() => setModal(false)}><Save size={13} /> บันทึก POD</button>
        </Modal>
      )}
    </>
  );
}

/* ================================================================== */
/* 4. CARRIER MASTER & SCORECARD                                        */
/* ================================================================== */

/* ================================================================== */
/* DRIVER MOBILE APP — accept job (QR scan), confirm delivery or        */
/* failed/return with photo + reason, bounces back to the main system   */
/* ================================================================== */

function TmsDriverApp({ trips, setTrips, setOrders, setShipments, setPods, setReturns, addLog }) {
  const [scanning, setScanning] = useState(false);
  const [acceptedIds, setAcceptedIds] = useState(new Set());
  const [activeJob, setActiveJob] = useState(null);
  const [showFailForm, setShowFailForm] = useState(false);
  const [reason, setReason] = useState(NON_DELIVERY_REASONS[0]);
  const [receiver, setReceiver] = useState("");
  const [photoAttached, setPhotoAttached] = useState(false);
  const [result, setResult] = useState(null); // { ok: bool, id }

  const jobPool = trips.filter((t) => t.status !== "Delivered" && t.status !== "Exception");
  const myJobs = jobPool.filter((t) => acceptedIds.has(t.id));
  const unclaimed = jobPool.filter((t) => !acceptedIds.has(t.id));

  const scanQR = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      const next = unclaimed[0];
      if (next) {
        setAcceptedIds((s) => new Set([...s, next.id]));
        setTrips((list) => list.map((trip) => trip.id === next.id ? { ...trip, status: "Confirmed" } : trip));
        setShipments((list) => list.map((shipment) => shipment.tripId === next.id ? { ...shipment, status: "Dispatched" } : shipment));
        addLog(`[Driver App] รับงาน ${next.id} ผ่าน QR Code`);
      }
    }, 1100);
  };

  const markDelivered = () => {
    if (!activeJob) return;
    setTrips((list) => list.map((t) => (t.id === activeJob.id ? { ...t, status: "Delivered" } : t)));
    setShipments((list) => list.map((shipment) => shipment.tripId === activeJob.id ? { ...shipment, status: "Delivered" } : shipment));
    setOrders((list) => list.map((order) => activeJob.orderIds?.includes(order.id) ? { ...order, status: "สำเร็จ" } : order));
    setPods((list) => [{ id: `POD-${rand(8000, 8999)}`, shipmentId: activeJob.id, delivered: true, receiver: receiver || "ลูกค้าปลายทาง", reason: "-", podTimeMin: rand(2, 25), timestamp: "เมื่อสักครู่" }, ...list]);
    addLog(`[Driver App] ${activeJob.id} ส่งถึงลูกค้าแล้ว — ยืนยันกลับระบบสำเร็จ`);
    setResult({ ok: true, id: activeJob.id });
    setActiveJob(null); setReceiver(""); setShowFailForm(false);
  };

  const markFailed = () => {
    if (!activeJob) return;
    setTrips((list) => list.map((t) => (t.id === activeJob.id ? { ...t, status: "Exception" } : t)));
    setShipments((list) => list.map((shipment) => shipment.tripId === activeJob.id ? { ...shipment, status: "Exception" } : shipment));
    setOrders((list) => list.map((order) => activeJob.orderIds?.includes(order.id) ? { ...order, status: "ส่งไม่สำเร็จ" } : order));
    setPods((list) => [{ id: `POD-${rand(8000, 8999)}`, shipmentId: activeJob.id, delivered: false, receiver: "-", reason, podTimeMin: null, timestamp: "เมื่อสักครู่" }, ...list]);
    setReturns((list) => [{ id: `RET-${rand(3900, 3999)}`, type: "REFUSED", typeName: "Refused Delivery", carrier: activeJob.carrier, area: activeJob.route, cost: rand(80, 320), resolutionHours: rand(6, 48), status: "รับเรื่อง", claimStatus: "-" }, ...list]);
    addLog(`[Driver App] ${activeJob.id} ส่งไม่สำเร็จ (${reason}) — สร้าง Return Job อัตโนมัติแล้ว`);
    setResult({ ok: false, id: activeJob.id });
    setActiveJob(null); setShowFailForm(false); setPhotoAttached(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div className="handheld" style={{ maxWidth: 340, width: "100%" }}>
        <div className="handheld-screen" style={{ minHeight: 520 }}>

          {result && (
            <div style={{ textAlign: "center", padding: "30px 6px" }}>
              {result.ok ? <CheckCircle2 size={54} color="var(--success)" /> : <XCircle size={54} color="var(--danger)" />}
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: 12 }}>{result.ok ? "ส่งข้อมูลกลับระบบสำเร็จ!" : "บันทึกการตีคืนสำเร็จ!"}</div>
              <div className="kpi-sub" style={{ marginBottom: 18 }}>{result.id} — {result.ok ? "อัปเดตสถานะ Delivered ในระบบหลักแล้ว" : "สร้าง Return Job ในระบบหลักแล้ว"}</div>
              <button className="btn" style={{ width: "100%", justifyContent: "center" }} onClick={() => setResult(null)}>กลับไปหน้างาน</button>
            </div>
          )}

          {!result && !activeJob && (
            <>
              <div className="kpi-sub" style={{ marginBottom: 10 }}>สวัสดี คนขับ 👋</div>
              <button className="btn" style={{ width: "100%", justifyContent: "center", marginBottom: 14, padding: "12px 0" }} onClick={scanQR} disabled={scanning}>
                <QrCode size={16} /> {scanning ? "กำลังสแกน QR..." : "สแกน QR เพื่อรับงาน"}
              </button>

              {myJobs.length > 0 && <div className="kpi-sub" style={{ fontWeight: 600, marginBottom: 6 }}>งานที่รับแล้ว ({myJobs.length})</div>}
              {myJobs.map((t) => (
                <div key={t.id} className="card" style={{ marginBottom: 8, cursor: "pointer" }} onClick={() => setActiveJob(t)}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t.id}</div>
                  <div className="kpi-sub">{t.route} · {t.orders} Order · {t.mode}</div>
                  <span className="tag-status Booked">แตะเพื่อดูรายละเอียด</span>
                </div>
              ))}

              {unclaimed.length > 0 && <div className="kpi-sub" style={{ fontWeight: 600, margin: "12px 0 6px" }}>งานรอรับ ({unclaimed.length}) — สแกน QR เพื่อรับ</div>}
              {unclaimed.slice(0, 3).map((t) => (
                <div key={t.id} className="card" style={{ marginBottom: 8, opacity: 0.6 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{t.id}</div>
                  <div className="kpi-sub">{t.route} · {t.orders} Order</div>
                </div>
              ))}
              {jobPool.length === 0 && <div className="kpi-sub" style={{ textAlign: "center", padding: 20 }}>ไม่มีงานในขณะนี้</div>}
            </>
          )}

          {!result && activeJob && !showFailForm && (
            <>
              <div className="kpi-sub" style={{ marginBottom: 4, cursor: "pointer" }} onClick={() => setActiveJob(null)}>← กลับ</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{activeJob.id}</div>
              <div className="kpi-sub" style={{ marginBottom: 10 }}>สถานะ: {activeJob.status}</div>
              <div className="card" style={{ marginBottom: 14 }}>
                <div className="kpi-sub">ต้นทาง (จุดรับสินค้า)</div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{CARRIER_LABEL[activeJob.origin] || "-"} — {HQ_COORD.address}</div>
                <div className="kpi-sub">ปลายทาง</div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>{activeJob.route}</div>
                <div className="kpi-sub">รูปแบบ / จำนวน</div>
                <div style={{ fontWeight: 600 }}>{activeJob.mode} · {activeJob.orders} Order · {activeJob.cube} CBM</div>
              </div>
              {activeJob.orderDetails && (
                <div className="table-wrap" style={{ marginBottom: 14 }}>
                  <table>
                    <thead><tr><th>Order</th><th>ลูกค้า</th></tr></thead>
                    <tbody>{activeJob.orderDetails.slice(0, 5).map((o) => (<tr key={o.id}><td className="mono" style={{ fontSize: 11 }}>{o.id}</td><td style={{ fontSize: 11 }}>{o.customer}</td></tr>))}</tbody>
                  </table>
                </div>
              )}
              <div className="field"><label>ชื่อผู้รับสินค้า</label><input value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder="กรอกชื่อผู้รับ" /></div>
              <button className="btn" style={{ width: "100%", justifyContent: "center", marginBottom: 8 }} onClick={markDelivered}><CheckCircle2 size={14} /> ส่งถึงลูกค้าแล้ว</button>
              <button className="btn secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setShowFailForm(true)}><XCircle size={14} /> ส่งไม่สำเร็จ / ตีคืน</button>
            </>
          )}

          {!result && activeJob && showFailForm && (
            <>
              <div className="kpi-sub" style={{ marginBottom: 8, cursor: "pointer" }} onClick={() => setShowFailForm(false)}>← กลับ</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>แจ้งส่งไม่สำเร็จ — {activeJob.id}</div>
              <div className="field"><label>เหตุผล</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)}>{NON_DELIVERY_REASONS.map((r) => <option key={r}>{r}</option>)}</select>
              </div>
              <div className="field"><label>ถ่ายภาพหลักฐาน</label>
                {!photoAttached ? (
                  <button className="btn secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setPhotoAttached(true)}><Camera size={14} /> แตะเพื่อถ่ายภาพ</button>
                ) : (
                  <div style={{ height: 90, border: "1px dashed var(--success)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--success)", fontSize: 12 }}>✓ แนบภาพแล้ว</div>
                )}
              </div>
              <button className="btn" style={{ width: "100%", justifyContent: "center", marginTop: 10 }} onClick={markFailed}><XCircle size={14} /> ยืนยันการตีคืน</button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function TmsScorecard() {
  const [selected, setSelected] = useState(null);
  const scatterData = CARRIER_SCORECARDS.map((c) => ({ x: c.avgCost, y: c.score, name: c.name }));
  return (
    <>
      <div className="section-title" style={{ marginTop: 0 }}>Carrier Master (ทะเบียนผู้ขนส่ง)</div>
      <div className="table-wrap" style={{ marginBottom: 26 }}>
        <table>
          <thead><tr><th>รหัส</th><th>ชื่อผู้ขนส่ง</th><th>ประเภท</th><th>พื้นที่บริการ</th><th>Fleet Size</th><th>API Priority</th></tr></thead>
          <tbody>
            {CARRIER_DIRECTORY.map((c) => (
              <tr key={c.id}><td className="mono">{c.id}</td><td>{CARRIER_LABEL[c.id] || c.name}</td><td>{c.type}</td><td style={{ fontSize: 12 }}>{c.serviceArea}</td><td>{c.fleet}</td><td>{c.apiPriority}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section-title">น้ำหนักตัวชี้วัด (Carrier KPI Weight)</div>
      <div className="table-wrap" style={{ marginBottom: 26 }}>
        <table>
          <thead><tr><th>ตัวชี้วัด</th><th>น้ำหนัก</th></tr></thead>
          <tbody>{CARRIER_KPI_WEIGHTS.map((k) => (<tr key={k.key}><td>{k.label}</td><td className="mono">{k.weight}%</td></tr>))}</tbody>
        </table>
      </div>

      <div className="section-title">Carrier Scorecard (คำนวณอัตโนมัติทุกสัปดาห์)</div>
      <div className="table-wrap" style={{ marginBottom: 20 }}>
        <table>
          <thead><tr><th>ผู้ขนส่ง</th><th>On-Time Pickup</th><th>On-Time Arrival</th><th>On-Time Delivery</th><th>In-Full</th><th>OTIF</th><th>Damage%</th><th>Score</th><th>Grade</th></tr></thead>
          <tbody>
            {[...CARRIER_SCORECARDS].sort((a, b) => b.score - a.score).map((c) => (
              <tr key={c.id} className="clickable" onClick={() => setSelected(c)}>
                <td>{CARRIER_LABEL[c.id] || c.name}</td>
                <td className="mono">{c.onTimePickup}%</td><td className="mono">{c.onTimeArrival}%</td><td className="mono">{c.onTimeDelivery}%</td>
                <td className="mono">{c.inFull}%</td><td className="mono">{c.otif}%</td><td className="mono">{c.damageRate}%</td>
                <td className="mono" style={{ fontWeight: 700 }}>{c.score}</td>
                <td><span className="grade-badge" style={{ background: GRADE_ACTION[c.grade].color }}>{c.grade}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="card" style={{ marginBottom: 20, borderColor: GRADE_ACTION[selected.grade].color }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 15 }}>{CARRIER_LABEL[selected.id] || selected.name} — Grade {selected.grade} ({GRADE_ACTION[selected.grade].label})</h3>
            <span className="grade-badge" style={{ background: GRADE_ACTION[selected.grade].color }}>{selected.grade}</span>
          </div>
          <div className="kpi-sub" style={{ marginTop: 6 }}>การดำเนินการ: {GRADE_ACTION[selected.grade].action}</div>
        </div>
      )}

      <div className="section-title">Cost vs Performance Matrix</div>
      <div className="card">
        <div className="kpi-sub" style={{ marginBottom: 8 }}>แกน X = ต้นทุนเฉลี่ย (฿) · แกน Y = OTIF Score — Carrier มุมขวาบน (ถูก+คะแนนสูง) คือคุ้มค่าที่สุด</div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis type="number" dataKey="x" name="ต้นทุนเฉลี่ย" stroke="var(--muted)" tick={{ fontSize: 10 }} />
              <YAxis type="number" dataKey="y" name="OTIF Score" domain={[60, 100]} stroke="var(--muted)" tick={{ fontSize: 10 }} />
              <ZAxis range={[80, 80]} />
              <Tooltip {...chartTip} formatter={(v, n, p) => (n === "x" ? [`฿${v}`, "ต้นทุนเฉลี่ย"] : [`${v}`, "OTIF Score"])} labelFormatter={() => ""} />
              <ReferenceLine y={90} stroke="var(--success)" strokeDasharray="4 4" />
              <Scatter data={scatterData} fill="var(--amber)" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/* 6. OTIF & KPI DASHBOARD                                              */
/* ================================================================== */

function OtifTrendCard({ title, value, color, dataKey, data, target }) {
  const current = data.at(-1)?.[dataKey] || 0;
  return <section className="otif-trend-card"><div className="otif-card-head"><div><span>{title}</span><small>เป้าหมาย {target}%</small></div><strong style={{ color }}>{value}</strong></div><div className="mini-chart"><ResponsiveContainer><LineChart data={data}><XAxis dataKey="date" /><YAxis domain={[Math.max(70, Math.floor(Math.min(...data.map((row) => row[dataKey])) - 3)), 100]} /><ReferenceLine y={target} stroke="#94A3B8" label={{ value: `เป้า ${target}%` }} /><Line dataKey={dataKey} name={title} stroke={color} strokeWidth={3} /></LineChart></ResponsiveContainer></div><div className={`otif-result ${current >= target ? "pass" : "fail"}`}>{current >= target ? "ผ่านเป้าหมาย" : `ต่ำกว่าเป้าหมาย ${(target - current).toFixed(2)} จุด`}</div></section>;
}

function TmsOtifDashboard({ trips, shipments, pods, returns }) {
  const trend = [
    { date: "07-02", whOn: 99.8, whFull: 94.1, logOn: 96.2, logFull: 95.0 },
    { date: "07-03", whOn: 100, whFull: 97.8, logOn: 93.4, logFull: 87.8 },
    { date: "07-04", whOn: 99.9, whFull: 89.6, logOn: 90.8, logFull: 99.2 },
    { date: "07-05", whOn: 100, whFull: 95.8, logOn: 97.3, logFull: 99.0 },
    { date: "07-06", whOn: 99.8, whFull: 93.7, logOn: 99.1, logFull: 89.4 },
    { date: "07-07", whOn: 100, whFull: 90.2, logOn: 95.4, logFull: 95.7 },
    { date: "07-08", whOn: 100, whFull: 93.18, logOn: 90.14, logFull: 90.98 },
  ];
  const current = trend.at(-1);
  const prior = trend.at(-2);
  const otif = Math.min(current.logOn, current.logFull);
  const priorOtif = Math.min(prior.logOn, prior.logFull);
  const activeExceptions = shipments.filter((shipment) => shipment.status === "Exception").length + returns.filter((item) => item.status !== "ปิดเคส").length;
  const delivered = shipments.filter((shipment) => shipment.status === "Delivered").length;
  const linkedPods = pods.filter((pod) => pod.delivered).length;
  const podRate = delivered ? Math.min(100, linkedPods / delivered * 100) : 97.2;
  const issueData = [
    { name: "ส่งล่าช้า", value: 12 },
    { name: "สินค้าไม่ครบ", value: 8 },
    { name: "รถมารับช้า", value: 7 },
    { name: "สินค้าเสียหาย", value: 5 },
    { name: "ที่อยู่/เวลานัด", value: 4 },
  ];
  const serviceMix = [
    { name: "On-time WH", value: current.whOn },
    { name: "In-full WH", value: current.whFull },
    { name: "On-time Carrier", value: current.logOn },
    { name: "In-full Carrier", value: current.logFull },
  ];
  const explanations = [
    { title: "On-time Carrier ลดลง 5.26 จุด", detail: "เที่ยวเสริมและการแยกเส้นทางมากขึ้นทำให้ Carrier เข้ารับและส่งปลายทางไม่ทัน SLA", level: "bad" },
    { title: "In-full Carrier ลดลง 4.72 จุด", detail: "พบปัญหาสินค้าไม่ครบและโหลดแยกเที่ยว ควรตรวจ Consolidation ก่อนปล่อยรถ", level: "bad" },
    { title: "Warehouse On-time คงที่ 100%", detail: "คลังเตรียมสินค้าและส่งมอบให้จุดโหลดได้ตาม Cut-off ปัญหาหลักจึงอยู่หลังออกจากคลัง", level: "good" },
  ];
  return (
    <div className="analytics-page otif-page">
      <div className="analytics-toolbar"><div><span>OTIF &amp; KPI DASHBOARD</span><h2>Warehouse &amp; Logistics Service Level</h2><p>แยกให้เห็นว่าปัญหาเกิดในคลังหรือระหว่างขนส่ง และต้องแก้ที่จุดใด</p></div><div className={`overall-otif ${otif >= 97 ? "pass" : "fail"}`}><span>OTIF วันนี้</span><b>{otif.toFixed(2)}%</b><small>{otif - priorOtif >= 0 ? "+" : ""}{(otif - priorOtif).toFixed(2)} จุดจากเมื่อวาน</small></div></div>

      <div className="otif-trend-grid">
        <OtifTrendCard title="On-time Warehouse" value={`${current.whOn.toFixed(2)}%`} color="#356DFF" dataKey="whOn" data={trend} target={99} />
        <OtifTrendCard title="In-full Warehouse" value={`${current.whFull.toFixed(2)}%`} color="#19B969" dataKey="whFull" data={trend} target={95} />
        <OtifTrendCard title="On-time Logistics" value={`${current.logOn.toFixed(2)}%`} color="#11AFC1" dataKey="logOn" data={trend} target={97} />
        <OtifTrendCard title="In-full Logistics" value={`${current.logFull.toFixed(2)}%`} color="#FF9D0A" dataKey="logFull" data={trend} target={97} />
      </div>

      <section className="service-summary"><div className="analytics-card-head"><div><span>CUSTOMER SERVICE DASHBOARD</span><h3>ผลลัพธ์รวมจากคลังถึงลูกค้า</h3></div></div><div className="service-kpis">{serviceMix.map((item, index) => <article key={item.name} style={{ background: ["#356DFF", "#19B969", "#11AFC1", "#FF9D0A"][index] }}><span>{item.name}</span><b>{item.value.toFixed(2)}%</b><small>เป้าหมาย {index === 0 ? "99" : index === 1 ? "95" : "97"}%</small></article>)}</div><div className="combined-chart"><ResponsiveContainer><LineChart data={trend}><XAxis dataKey="date" /><YAxis domain={[80, 100]} /><ReferenceLine y={97} stroke="#64748B" label={{ value: "SLA 97%" }} /><Line dataKey="whOn" name="On-time WH" stroke="#356DFF" /><Line dataKey="whFull" name="In-full WH" stroke="#19B969" /><Line dataKey="logOn" name="On-time Carrier" stroke="#11AFC1" /><Line dataKey="logFull" name="In-full Carrier" stroke="#FF9D0A" /></LineChart></ResponsiveContainer></div></section>

      <div className="analytics-grid">
        <section className="analytics-card"><div className="analytics-card-head"><div><span>ROOT CAUSE</span><h3>ทำไม OTIF วันนี้ต่ำกว่าเป้าหมาย</h3></div></div><div className="cause-list">{explanations.map((item) => <article className={item.level} key={item.title}><i>{item.level === "bad" ? "!" : "✓"}</i><div><b>{item.title}</b><p>{item.detail}</p></div></article>)}</div></section>
        <section className="analytics-card chart-card"><div className="analytics-card-head"><div><span>EXCEPTION PARETO</span><h3>จำนวนเคสแยกตามสาเหตุ</h3></div><b>{issueData.reduce((sum, item) => sum + item.value, 0)} เคส</b></div><div className="chart-frame"><ResponsiveContainer><BarChart data={issueData} layout="vertical"><YAxis dataKey="name" /><XAxis /><Bar dataKey="value" fill="#356DFF" /></BarChart></ResponsiveContainer></div></section>
      </div>

      <div className="otif-ops-grid">
        <article><span>เที่ยวขนส่งในระบบ</span><b>{trips.length}</b><small>ข้อมูลเดียวกับ Dispatch</small></article>
        <article><span>Open Exception</span><b className={activeExceptions ? "metric-bad" : "metric-good"}>{activeExceptions}</b><small>Shipment + Return</small></article>
        <article><span>POD Completion</span><b>{podRate.toFixed(1)}%</b><small>เป้าหมาย ≥97%</small></article>
        <article><span>Carrier SLA</span><b className="metric-bad">{current.logOn.toFixed(1)}%</b><small>ต่ำกว่าเป้า 97%</small></article>
      </div>

      <section className="analytics-card"><div className="analytics-card-head"><div><span>DAILY ACTION</span><h3>สิ่งที่ต้องทำก่อนรอบส่งถัดไป</h3></div></div><div className="action-list"><div><b>1</b><span><strong>รวม Order ก่อนเรียกรถเสริม</strong><small>ลดเที่ยวที่โหลดไม่เต็มและลดความเสี่ยงส่งล่าช้า</small></span></div><div><b>2</b><span><strong>ล็อก Route และ Cut-off ก่อนปล่อยคลัง</strong><small>ไม่เพิ่มจุดส่งหลัง Carrier รับงานแล้ว</small></span></div><div><b>3</b><span><strong>ตรวจจำนวนกล่องกับ Shipment ก่อนขึ้นรถ</strong><small>ลด In-full failure และเคสสินค้าไม่ครบ</small></span></div></div></section>
    </div>
  );
}

function TmsOtifDashboardLegacy({ trips }) {
  const execKpi = [
    { label: "OTIF Rate — Overall", value: "96.8%", target: "≥97%", ok: false },
    { label: "Transportation Cost / Unit", value: "฿148", target: "ลด ≥15% จาก Baseline", ok: true },
    { label: "Transportation Cost / Revenue", value: "3.2%", target: "<3.5%", ok: true },
    { label: "Return Rate", value: "1.6%", target: "≤2%", ok: true },
    { label: "Perfect Order Rate", value: "94.1%", target: "≥95%", ok: false },
    { label: "Carrier SLA Compliance", value: "82%", target: "≥90% Grade A/B", ok: false },
    { label: "CO₂ Emission / Shipment", value: "-8%", target: "ลด ≥10%", ok: false },
  ];
  const opsKpi = [
    { label: "On-Time Delivery Rate", value: "97.4%", target: "≥98%", ok: false },
    { label: "In-Full Delivery Rate", value: "99.6%", target: "≥99.5%", ok: true },
    { label: "At-Risk Shipments (ETA ล่าช้า)", value: "3", target: "0", ok: false },
    { label: "Open Exceptions", value: "4 / 1,000", target: "<5 / 1,000", ok: true },
    { label: "Slot Utilization — Inbound", value: "83%", target: "≥85%", ok: false },
    { label: "Slot Utilization — Outbound", value: "91%", target: "≥90%", ok: true },
    { label: "Average Dock-to-Depart", value: "48 นาที", target: "≤45 นาที", ok: false },
    { label: "POD Completion Rate", value: "97.2%", target: "≥97%", ok: true },
    { label: "Return Resolution Time", value: "41 ชม.", target: "≤48 ชม.", ok: true },
    { label: "Driver on Schedule", value: "96.1%", target: "≥95%", ok: true },
  ];
  const trend = [...new Set(trips.map((t) => t.date))].sort().slice(-14).map((d) => ({
    date: d.slice(-5),
    otif: +(94 + random() * 5).toFixed(1),
  }));

  return (
    <>
      <div className="section-title" style={{ marginTop: 0 }}>Executive — Strategic KPI Dashboard</div>
      <div className="grid g4" style={{ marginBottom: 26 }}>
        {execKpi.map((k) => (
          <div className="card" key={k.label}>
            <h3>{k.label}</h3><div className="kpi-val" style={{ color: k.ok ? "var(--success)" : "var(--danger)" }}>{k.value}</div>
            <div className="kpi-sub">เป้าหมาย: {k.target}</div>
          </div>
        ))}
      </div>

      <div className="section-title">แนวโน้ม OTIF Rate รายวัน (14 วันล่าสุด)</div>
      <div className="card" style={{ marginBottom: 26 }}>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={trend} margin={{ top: 6, right: 14, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="var(--muted)" tick={{ fontSize: 10 }} />
              <YAxis domain={[90, 100]} stroke="var(--muted)" tick={{ fontSize: 11 }} />
              <Tooltip {...chartTip} />
              <ReferenceLine y={97} stroke="var(--danger)" strokeDasharray="5 4" label={{ value: "เป้าหมาย 97%", fontSize: 10, fill: "var(--danger)" }} />
              <Line type="monotone" dataKey="otif" stroke="var(--amber)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section-title">Operations — Daily KPI Dashboard</div>
      <div className="grid g4">
        {opsKpi.map((k) => (
          <div className="card" key={k.label}>
            <h3>{k.label}</h3><div className="kpi-val" style={{ fontSize: 20, color: k.ok ? "var(--success)" : "var(--danger)" }}>{k.value}</div>
            <div className="kpi-sub">เป้าหมาย: {k.target}</div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ================================================================== */
/* 5. RETURNS MANAGEMENT                                                */
/* ================================================================== */

function TmsReturns({ returns: rets, setReturns }) {
  const advance = (r) => {
    const flow = ["รับเรื่อง", "กำลังรับคืน", "ถึงคลังแล้ว", "ปิดเคส"];
    const next = flow[flow.indexOf(r.status) + 1];
    if (!next) return;
    setReturns((list) => list.map((x) => (x.id === r.id ? { ...x, status: next } : x)));
  };
  const totalCost = rets.reduce((a, r) => a + r.cost, 0);
  const avgResolution = (rets.reduce((a, r) => a + r.resolutionHours, 0) / rets.length).toFixed(0);
  const byCarrier = {};
  rets.forEach((r) => { byCarrier[r.carrier] = (byCarrier[r.carrier] || 0) + 1; });
  const carrierData = Object.entries(byCarrier).map(([name, value]) => ({ name: CARRIER_LABEL[name] || name, value }));

  return (
    <>
      <div className="section-title" style={{ marginTop: 0 }}>ประเภทสินค้าคืน</div>
      <div className="grid g4" style={{ marginBottom: 20 }}>
        {RETURN_TYPES.map((t) => (
          <div className="card" key={t.id}><h3>{t.name}</h3><div className="kpi-sub">{t.cause}</div><div className="kpi-val" style={{ fontSize: 20, marginTop: 8 }}>{rets.filter((r) => r.type === t.id).length}</div></div>
        ))}
      </div>
      <div className="grid g4" style={{ marginBottom: 20 }}>
        <div className="card"><h3>ใบงานรับคืนทั้งหมด</h3><div className="kpi-val">{rets.length}</div></div>
        <div className="card"><h3>Return Cost รวม</h3><div className="kpi-val">฿{totalCost.toLocaleString()}</div></div>
        <div className="card"><h3>Resolution Time เฉลี่ย</h3><div className="kpi-val" style={{ color: avgResolution <= 48 ? "var(--success)" : "var(--danger)" }}>{avgResolution} ชม.</div><div className="kpi-sub">เป้าหมาย ≤48 ชม.</div></div>
        <div className="card"><h3>Return Rate</h3><div className="kpi-val" style={{ color: "var(--success)" }}>1.6%</div><div className="kpi-sub">เป้าหมาย ≤2%</div></div>
      </div>

      <div className="section-title">รายการ Return Job</div>
      <div className="table-wrap" style={{ marginBottom: 26 }}>
        <table>
          <thead><tr><th>Return</th><th>ประเภท</th><th>ผู้ขนส่ง</th><th>พื้นที่</th><th>ต้นทุน</th><th>Claim</th><th>สถานะ</th><th></th></tr></thead>
          <tbody>
            {rets.map((r) => (
              <tr key={r.id}>
                <td className="mono">{r.id}</td><td>{r.typeName}</td><td>{vendorName(r.carrier)}</td><td>{r.area}</td>
                <td className="mono">฿{r.cost}</td><td>{r.claimStatus}</td>
                <td><span className={`tag-status ${r.status === "ปิดเคส" ? "Arrived" : r.status === "รับเรื่อง" ? "Booked" : "Receiving"}`}>{r.status}</span></td>
                <td>{r.status !== "ปิดเคส" && <button className="btn secondary" onClick={() => advance(r)}>ขั้นต่อไป</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>Return Rate ต่อผู้ขนส่ง</h3>
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <BarChart data={carrierData}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="var(--muted)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--muted)" tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip {...chartTip} />
              <Bar dataKey="value" fill="var(--amber)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/* 7. COST MANAGEMENT & INVOICE RECONCILIATION                         */
/* ================================================================== */

function TmsCostRecon({ trips, invoices, setInvoices }) {
  const totalCost = trips.reduce((a, t) => a + t.cost, 0);
  const breakdown = COST_TYPES.map((c) => ({ id: c.id, label: c.label, amount: 0 }));
  trips.forEach((t) => { splitCost(t.cost).forEach((s, i) => { breakdown[i].amount += s.amount; }); });

  const disputeInvoice = (inv) => setInvoices((list) => list.map((x) => (x.id === inv.id ? { ...x, status: "Dispute" } : x)));
  const approveInvoice = (inv) => setInvoices((list) => list.map((x) => (x.id === inv.id ? { ...x, status: "Approved" } : x)));
  const matched = invoices.filter((i) => i.status === "ตรงกัน" || i.status === "Approved").length;
  const reconRate = ((matched / invoices.length) * 100).toFixed(1);

  return (
    <>
      <div className="section-title" style={{ marginTop: 0 }}>ต้นทุนแยกตามประเภท (7.1)</div>
      <div className="grid g2" style={{ marginBottom: 26, alignItems: "flex-start" }}>
        <div className="card">
          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={breakdown} dataKey="amount" nameKey="label" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {breakdown.map((_, i) => <Cell key={i} fill={["var(--amber)", "var(--teal)", "var(--success)", "var(--orange)", "var(--purple)", "var(--danger)", "var(--muted)", "#8FC1E8", "#C9CFD6"][i]} />)}
                </Pie>
                <Tooltip {...chartTip} formatter={(v) => `฿${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ประเภทต้นทุน</th><th>มูลค่ารวม</th><th>สัดส่วน</th></tr></thead>
            <tbody>
              {breakdown.map((b) => (
                <tr key={b.id}><td>{b.label}</td><td className="mono">฿{Math.round(b.amount).toLocaleString()}</td><td className="mono">{((b.amount / totalCost) * 100).toFixed(1)}%</td></tr>
              ))}
              <tr style={{ fontWeight: 700 }}><td>รวมทั้งหมด</td><td className="mono">฿{totalCost.toLocaleString()}</td><td>100%</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-title">Invoice Reconciliation</div>
      <div className="grid g4" style={{ marginBottom: 14 }}>
        <div className="card"><h3>Reconciliation Rate</h3><div className="kpi-val" style={{ color: reconRate >= 99 ? "var(--success)" : "var(--danger)" }}>{reconRate}%</div><div className="kpi-sub">เป้าหมาย ≥99%</div></div>
        <div className="card"><h3>Invoice ทั้งหมด</h3><div className="kpi-val">{invoices.length}</div></div>
        <div className="card"><h3>รอตรวจสอบ</h3><div className="kpi-val">{invoices.filter((i) => i.status === "รอตรวจสอบ").length}</div></div>
        <div className="card"><h3>Dispute</h3><div className="kpi-val" style={{ color: "var(--danger)" }}>{invoices.filter((i) => i.status === "Dispute").length}</div></div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Invoice</th><th>Trip</th><th>ผู้ขนส่ง</th><th>วันที่</th><th>Expected</th><th>Actual</th><th>ผลต่าง</th><th>สถานะ</th><th></th></tr></thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="mono">{inv.id}</td><td className="mono">{inv.tripId}</td><td>{vendorName(inv.carrier)}</td><td className="mono">{inv.date}</td>
                <td className="mono">฿{inv.expected.toLocaleString()}</td><td className="mono">฿{inv.actual.toLocaleString()}</td>
                <td className="mono" style={{ color: inv.variance === 0 ? "var(--success)" : "var(--danger)" }}>{inv.variance >= 0 ? "+" : ""}{inv.variance}</td>
                <td><span className={`tag-status ${inv.status === "ตรงกัน" || inv.status === "Approved" ? "Arrived" : inv.status === "Dispute" ? "Hold" : "Booked"}`}>{inv.status}</span></td>
                <td>{inv.status === "รอตรวจสอบ" && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn secondary" onClick={() => approveInvoice(inv)}>Approve</button>
                    <button className="btn secondary" onClick={() => disputeInvoice(inv)}>Dispute</button>
                  </div>
                )}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ================================================================== */
/* 8. SYSTEM INTEGRATION                                                */
/* ================================================================== */

function TmsIntegration() {
  const [list, setList] = useState(INTEGRATIONS_INIT);
  const toggle = (id) => setList((l) => l.map((x) => (x.id === id ? { ...x, status: x.status === "Online" ? "Offline" : "Online" } : x)));
  const onlineCount = list.filter((x) => x.status === "Online").length;
  return (
    <>
      <div className="grid g4" style={{ marginBottom: 20 }}>
        <div className="card"><h3>Integration ทั้งหมด</h3><div className="kpi-val">{list.length}</div></div>
        <div className="card"><h3>Online</h3><div className="kpi-val" style={{ color: "var(--success)" }}>{onlineCount}</div></div>
        <div className="card"><h3>Offline</h3><div className="kpi-val" style={{ color: "var(--danger)" }}>{list.length - onlineCount}</div></div>
        <div className="card"><h3>System Uptime</h3><div className="kpi-val" style={{ color: "var(--success)" }}>99.7%</div><div className="kpi-sub">เป้าหมาย ≥99.5%</div></div>
      </div>
      <div className="kpi-sub" style={{ marginBottom: 14 }}>คลิกที่การ์ดเพื่อจำลองสถานะ Online/Offline · Protocol: REST API (JSON) + Webhook · Message Queue: Kafka/RabbitMQ รองรับ ≥5,000 Event/นาที</div>
      <div className="grid g2">
        {list.map((x) => (
          <div className="card" key={x.id} onClick={() => toggle(x.id)} style={{ cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div className={`icon-wrap ${x.status === "Online" ? "on" : "off"}`}>{x.status === "Online" ? <Wifi size={18} /> : <WifiOff size={18} />}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>{x.name}</div>
              <div className="kpi-sub" style={{ marginBottom: 4 }}>{x.desc}</div>
              <div className="kpi-sub">Protocol: {x.protocol}</div>
            </div>
            <span className={`tag-status ${x.status === "Online" ? "Arrived" : "Hold"}`}>{x.status}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Sarabun:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
      .wms-app { --bg:#EDF1F6; --panel:#FFFFFF; --panel-raised:#F3F6FA; --border:#D6DEE8; --text:#1F2937; --muted:#6B7688; --amber:#3E7EE0; --teal:#17A9C0; --danger:#F15B71; --success:#3EC775; --navy:#16233D; --orange:#F5A83C; --purple:#9B6FD1;
        font-family:'Sarabun',sans-serif; background:var(--bg); color:var(--text); border-radius:14px; overflow:hidden; display:flex; min-height:800px; border:1px solid var(--border); }
      .wms-app * { box-sizing:border-box; }
      .disp{font-family:'Space Grotesk',sans-serif;} .mono{font-family:'JetBrains Mono',monospace;}
      .sidebar{width:260px;flex-shrink:0;background:var(--navy);border-right:1px solid rgba(255,255,255,0.08);display:flex;flex-direction:column;padding:20px 14px;overflow-y:auto;}
      .brand{display:flex;align-items:center;gap:10px;padding:4px 10px 20px;}
      .brand-text .t1{font-family:'Space Grotesk';font-weight:700;font-size:14.5px;color:#FFFFFF;} .brand-text .t2{font-size:10.5px;color:rgba(255,255,255,0.55);margin-top:2px;}
      .navlist{display:flex;flex-direction:column;gap:2px;}
      .nav-group-header{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:rgba(255,255,255,0.4);opacity:.9;margin:14px 10px 5px;}
      .navlist>.nav-group-header:first-child{margin-top:2px;}
      .navitem{display:flex;align-items:center;gap:10px;padding:10px 11px;border-radius:8px;cursor:pointer;color:rgba(255,255,255,0.75);font-size:13px;border:1px solid transparent;}
      .navitem:hover{background:rgba(255,255,255,0.08);color:#FFFFFF;}
      .navitem.active{background:rgba(255,255,255,0.16);color:#FFFFFF;border-color:rgba(255,255,255,0.22);}
      .sidebar-foot{margin-top:auto;padding:14px 10px;border-top:1px solid rgba(255,255,255,0.12);}
      .sidebar-foot .lbl{font-size:10.5px;color:rgba(255,255,255,0.45);} .sidebar-foot .val{font-size:12.5px;color:#7FB0F0;margin-top:4px;}
      .main{flex:1;display:flex;flex-direction:column;min-width:0;}
      .topbar{height:64px;flex-shrink:0;display:flex;align-items:center;gap:16px;padding:0 24px;border-bottom:1px solid var(--border);background:var(--panel);}
      .topbar h1{font-family:'Space Grotesk';font-size:16px;font-weight:600;margin:0;color:var(--navy);}
      .topbar-kicker{font-family:'Space Grotesk';font-size:9px;font-weight:700;letter-spacing:.16em;color:#9AA4B3;margin-bottom:4px;}
      .topbar-right{margin-left:auto;display:flex;align-items:center;gap:14px;}
      .clock{font-family:'JetBrains Mono';font-size:13px;color:var(--muted);}
      .ai-pill{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--success);background:rgba(62,199,117,0.1);border:1px solid rgba(62,199,117,0.3);padding:6px 12px;border-radius:20px;}
      .ai-pill .dot{width:6px;height:6px;border-radius:50%;background:var(--success);animation:pulse 1.8s infinite;}
      @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(62,199,117,.5);}70%{box-shadow:0 0 0 6px rgba(62,199,117,0);}100%{box-shadow:0 0 0 0 rgba(62,199,117,0);}}
      .content{flex:1;overflow-y:auto;padding:26px;}
      .content::-webkit-scrollbar{width:8px;} .content::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}
      .control-tower{max-width:1440px;margin:0 auto;}
      .ct-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:18px;}
      .ct-kpi{position:relative;min-height:184px;text-align:left;background:#fff;border:1px solid var(--border);border-radius:14px;padding:22px 22px 18px;color:var(--text);font-family:inherit;cursor:pointer;overflow:hidden;box-shadow:0 1px 2px rgba(22,35,61,.03);}
      .ct-kpi:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(22,35,61,.08);}
      .ct-kpi-primary{background:linear-gradient(140deg,#4A80DB,#346CCB);border-color:#4A80DB;color:#fff;}
      .ct-kpi-head{display:flex;align-items:center;justify-content:space-between;font-family:'Space Grotesk';font-size:11px;font-weight:700;letter-spacing:.04em;color:#919AAA;}
      .ct-kpi-primary .ct-kpi-head{color:rgba(255,255,255,.75);}
      .ct-kpi-head em{font-style:normal;font-size:8px;letter-spacing:.08em;border:1px solid #E2E7EE;padding:5px 8px;border-radius:12px;color:#98A1AF;}
      .ct-kpi-primary .ct-kpi-head em{border-color:rgba(255,255,255,.18);color:rgba(255,255,255,.86);background:rgba(255,255,255,.08);}
      .ct-kpi-value{font-family:'Space Grotesk';font-size:36px;font-weight:700;letter-spacing:-.04em;margin-top:17px;color:#1D2738;}
      .ct-kpi-primary .ct-kpi-value{color:#fff;}
      .ct-kpi-value small{font-size:18px;margin-left:1px;}
      .ct-kpi-foot{display:flex;gap:9px;margin-top:10px;font-size:10px;color:#A1A9B5;}
      .ct-kpi-foot strong{color:rgba(255,255,255,.9);}.ct-kpi-foot.good strong{color:#35B979}.ct-kpi-foot.warn strong{color:#D99B25}
      .ct-ring{position:absolute;width:92px;height:92px;border:2px solid rgba(255,255,255,.10);border-radius:50%;right:-3px;bottom:-14px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:inset 0 0 0 10px rgba(255,255,255,.025);}
      .ct-ring:after{content:"";position:absolute;inset:10px;border:1px solid rgba(255,255,255,.12);border-radius:50%;}
      .ct-ring b{font-family:'Space Grotesk';font-size:19px;z-index:1}.ct-ring small{font-size:8px;z-index:1;color:rgba(255,255,255,.72)}
      .ct-bars{position:absolute;right:20px;bottom:19px;height:47px;width:112px;display:flex;align-items:flex-end;gap:5px;}
      .ct-bars i{flex:1;background:#DCE5F5;border-radius:2px 2px 0 0;}.ct-bars i:nth-last-child(-n+2){background:#5E85D8;}
      .ct-donut{position:absolute;right:26px;bottom:18px;width:67px;height:67px;border-radius:50%;background:conic-gradient(#42A26F 0 87%,#E9EDF2 87%);display:grid;place-items:center;}
      .ct-donut:before{content:"";position:absolute;inset:8px;background:#fff;border-radius:50%}.ct-donut b{position:relative;font-family:'Space Grotesk';font-size:12px;color:#4A5565;}
      .ct-main-grid{display:grid;grid-template-columns:minmax(0,1.9fr) minmax(330px,1fr);gap:18px;}
      .ct-panel{background:#fff;border:1px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:0 1px 2px rgba(22,35,61,.03);}
      .ct-panel-head{min-height:76px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);}
      .ct-panel-head span,.ct-dispatch-strip>div>span{font-family:'Space Grotesk';font-size:9px;letter-spacing:.14em;font-weight:700;color:#9AA4B2;}
      .ct-panel-head h2,.ct-dispatch-strip h2{font-family:'Space Grotesk';font-size:16px;font-weight:500;color:#2C3747;margin:5px 0 0;}
      .ct-panel-head button{border:0;background:transparent;color:#4A7ED1;font:600 11px 'Sarabun';cursor:pointer;}
      .ct-panel-head>strong{display:grid;place-items:center;width:30px;height:30px;border-radius:10px;background:#FFF1F3;color:#E06B78;font:700 12px 'Space Grotesk';}
      .google-live-map{position:relative;background:#EEF2F6;overflow:hidden;}
      .google-live-map iframe{display:block;background:#E9EEF4;}
      .google-map-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 14px;background:#fff;border-top:1px solid var(--border);}
      .google-map-stops{display:flex;align-items:center;gap:7px;overflow-x:auto;padding-bottom:1px;}
      .google-map-stops button{display:inline-flex;align-items:center;gap:5px;border:1px solid #DDE4EC;background:#fff;color:#667286;border-radius:18px;padding:7px 10px;font:600 10px 'Sarabun';white-space:nowrap;cursor:pointer;}
      .google-map-stops button:hover{border-color:#6D91D6;color:#376EC8;}
      .google-map-stops button.active{background:#376FCB;border-color:#376FCB;color:#fff;box-shadow:0 4px 10px rgba(55,111,203,.22);}
      .google-map-toolbar>a{color:#3E75CA;text-decoration:none;font:700 10px 'Sarabun';white-space:nowrap;}
      .ct-network{height:380px;position:relative;overflow:hidden;background-color:#F8FAFC;background-image:linear-gradient(#E7EBF0 1px,transparent 1px),linear-gradient(90deg,#E7EBF0 1px,transparent 1px);background-size:40px 40px;}
      .ct-road{position:absolute;height:10px;background:#E7ECF2;border-radius:20px;opacity:.9;transform-origin:left center}.road-a{width:120%;left:-8%;top:60%;transform:rotate(-24deg)}.road-b{width:120%;left:-6%;top:36%;transform:rotate(29deg)}.road-c{width:90%;left:12%;top:72%;transform:rotate(-7deg)}
      .ct-route{position:absolute;height:2px;background:#7796C6;transform-origin:left center;opacity:.8}.route-a{width:33%;left:38%;top:55%;transform:rotate(-22deg)}.route-b{width:28%;left:39%;top:56%;transform:rotate(24deg)}.route-c{width:20%;left:32%;top:56%;transform:rotate(-105deg)}
      .ct-node{position:absolute;display:flex;align-items:center;gap:8px}.ct-node i{width:15px;height:15px;border:4px solid #5F82D0;background:white;border-radius:50%;box-shadow:0 0 0 4px rgba(95,130,208,.12)}
      .ct-node div{display:flex;flex-direction:column;background:white;padding:8px 10px;border-radius:6px;border:1px solid #E6EAF0;box-shadow:0 4px 10px rgba(32,45,65,.08)}.ct-node b{font-size:9px;color:#687386}.ct-node small{font-size:7px;color:#ADB4BF;margin-top:2px}
      .ct-node.hub{left:37%;top:51%}.ct-node.ayutthaya{left:55%;top:20%}.ct-node.chonburi{left:68%;top:70%}
      .ct-truck,.ct-alert-map{position:absolute;width:27px;height:27px;border-radius:7px;background:#3E70C7;color:white;display:grid;place-items:center;font-size:12px;box-shadow:0 3px 8px rgba(62,112,199,.25)}.truck-one{left:29%;top:31%}.truck-two{left:56%;top:42%}.truck-three{left:50%;top:69%}.ct-alert-map{left:73%;top:36%;background:#E35F68}
      .ct-map-legend{position:absolute;left:16px;bottom:14px;display:flex;gap:14px;padding:8px 10px;background:rgba(255,255,255,.92);border:1px solid #E6EAF0;border-radius:6px;font-size:8px;color:#8E98A6}.ct-map-legend .ok{color:#4CB582}.ct-map-legend .attention{color:#D7A236}.ct-map-legend .critical{color:#DD6672}
      .ct-exception-list{padding:14px;display:flex;flex-direction:column;gap:11px}.ct-exception{display:grid;grid-template-columns:34px 1fr auto;align-items:start;gap:10px;padding:15px 13px;border:1px solid #E5E9EF;border-radius:10px}.ct-exception.danger{background:#FFF9FA;border-color:#F2DADF}
      .ct-exception-icon{width:32px;height:32px;border-radius:8px;display:grid;place-items:center;font-weight:700;background:#F4F7FB;color:#5080D0}.ct-exception.danger .ct-exception-icon{background:#FDEDEF;color:#D65E6D}.ct-exception.warning .ct-exception-icon{background:#FFF7E5;color:#D7A22A}
      .ct-exception-copy{display:flex;flex-direction:column;min-width:0}.ct-exception-copy b{font-size:12px;color:#313A49}.ct-exception-copy span{font-size:10px;color:#788394;margin-top:4px}.ct-exception-copy small{font-size:9px;color:#AFB6C0;margin-top:5px}
      .ct-exception>button{border:1px solid #DDE3EA;background:white;border-radius:6px;padding:7px 10px;color:#6E7887;font:600 9px 'Sarabun';cursor:pointer}.ct-view-all{width:100%;display:flex;justify-content:space-between;border:0;border-top:1px solid var(--border);background:white;padding:15px 16px;color:#4B78C5;font:600 10px 'Sarabun';cursor:pointer}
      .ct-dispatch-strip{margin-top:18px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between}.ct-dispatch-strip .btn{margin-left:18px}
      @media(max-width:1200px){.ct-kpis{grid-template-columns:repeat(2,1fr)}.ct-main-grid{grid-template-columns:1fr}.ct-network{height:340px}}
      @media(max-width:760px){.sidebar{width:82px;padding-inline:8px}.brand-text,.navitem span,.nav-group-header,.sidebar-foot{display:none}.navitem{justify-content:center}.ct-kpis{grid-template-columns:1fr}.content{padding:16px}.ct-dispatch-strip{align-items:flex-start;flex-direction:column;gap:14px}.ct-dispatch-strip .btn{margin-left:0}.google-map-toolbar{align-items:flex-start;flex-direction:column}.google-map-stops{width:100%}}
      .grid{display:grid;gap:14px;} .g4{grid-template-columns:repeat(4,1fr);} .g2{grid-template-columns:repeat(2,1fr);}
      @media (max-width:1000px){.g4,.g2{grid-template-columns:1fr 1fr;}}
      .card{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:16px;}
      .card h3{margin:0 0 4px;font-size:12.5px;color:var(--muted);font-weight:500;}
      .kpi-val{font-family:'Space Grotesk';font-size:26px;font-weight:700;margin:6px 0 2px;color:var(--navy);}
      .kpi-sub{font-size:11.5px;color:var(--muted);}
      .section-title{font-family:'Space Grotesk';font-size:13.5px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:28px 0 12px;}
      .section-title:first-child{margin-top:0;}
      table{width:100%;border-collapse:collapse;font-size:13px;}
      th{text-align:left;font-size:11px;color:#FFFFFF;background:var(--navy);text-transform:uppercase;letter-spacing:.04em;padding:9px 10px;border-bottom:1px solid var(--border);font-weight:600;}
      td{padding:10px 10px;border-bottom:1px solid var(--border);} tr:last-child td{border-bottom:none;}
      tr.clickable{cursor:pointer;} tr.clickable:hover{background:var(--panel-raised);}
      .table-wrap{background:var(--panel);border:1px solid var(--border);border-radius:12px;overflow:hidden;overflow-x:auto;}
      .field{display:flex;flex-direction:column;gap:4px;margin-bottom:12px;}
      .field label{font-size:11.5px;color:var(--muted);}
      .field input,.field select,.field textarea{background:var(--panel-raised);border:1px solid var(--border);border-radius:7px;padding:8px 10px;color:var(--text);font-family:'Sarabun';font-size:13px;outline:none;}
      .btn{border:none;cursor:pointer;font-family:'Sarabun';font-weight:600;font-size:12.5px;padding:9px 15px;border-radius:7px;background:var(--amber);color:#FFFFFF;display:flex;align-items:center;gap:6px;white-space:nowrap;}
      .btn.secondary{background:var(--panel-raised);color:var(--text);border:1px solid var(--border);}
      .btn:disabled{opacity:0.5;cursor:default;}
      .tag-status{font-size:11px;padding:3px 9px;border-radius:10px;font-weight:600;color:#FFFFFF;}
      .tag-status.Booked{background:var(--amber);} .tag-status.Receiving{background:var(--amber);}
      .tag-status.Arrived{background:var(--success);} .tag-status.Completed{background:var(--success);}
      .tag-status.Hold{background:var(--danger);}
      .sys-tag{font-size:10.5px;padding:2px 8px;border-radius:8px;font-weight:600;}
      .sys-tag.ASRS{background:rgba(62,126,224,.2);color:var(--amber);}
      .sys-tag.Manual{background:rgba(139,150,165,.2);color:var(--muted);}
      .icon-wrap{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
      .icon-wrap.on{background:rgba(62,199,117,.15);color:var(--success);}
      .icon-wrap.off{background:rgba(241,91,113,.15);color:var(--danger);}
      .log-item{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);} .log-item:last-child{border-bottom:none;}
      .stat-dot{width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px;}
      .grade-badge{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:7px;font-weight:800;font-size:13px;color:#FFFFFF;}
      .progress-track{height:6px;background:var(--panel-raised);border-radius:4px;overflow:hidden;margin-top:6px;}
      .progress-fill{height:100%;border-radius:4px;}
      .chip{font-size:11.5px;padding:5px 11px;border-radius:14px;border:1px solid var(--border);background:var(--panel);cursor:pointer;display:inline-flex;align-items:center;gap:5px;}
      .chip.active{background:var(--amber);color:#fff;border-color:var(--amber);}
      .log-ic{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;}
      .log-ic.ai{background:rgba(62,126,224,.15);color:var(--amber);}
      .log-text{font-size:13px;line-height:1.5;} .log-time{font-size:10.5px;color:var(--muted);font-family:'JetBrains Mono';margin-top:3px;}
      .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:50;}
      .modal{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:26px;width:90%;max-height:85vh;overflow-y:auto;}
      .modal .close{float:right;cursor:pointer;color:var(--muted);} .modal h2{font-family:'Space Grotesk';margin:6px 0 16px;font-size:19px;color:var(--navy);}
      .handheld{background:#000;border:3px solid #333;border-radius:22px;padding:14px;box-shadow:0 0 0 6px var(--panel-raised), 0 4px 14px rgba(22,35,61,0.15);}
      .handheld-screen{background:var(--panel);border-radius:12px;padding:16px;min-height:400px;}
      html,body,#root{height:100%;overflow:hidden;}
      .wms-app{height:100dvh;min-height:0;overflow:hidden;border-radius:0;}
      .wms-app .sidebar{height:100%;min-height:0;overscroll-behavior:contain;}
      .wms-app .main{height:100%;min-height:0;overflow:hidden;}
      .wms-app .content{min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;padding-bottom:96px;scrollbar-gutter:stable;}
      .data-chart{display:block;width:100%;height:100%;overflow:visible;}
      .workflow-rail{background:#fff;border:1px solid var(--border);border-radius:14px;padding:15px 18px;margin-bottom:20px;box-shadow:0 3px 12px rgba(22,35,61,.04);}
      .workflow-head{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:12px;}
      .workflow-head>div{display:flex;align-items:baseline;gap:10px}.workflow-head b{font:700 13px 'Space Grotesk';color:var(--navy)}.workflow-head span{font-size:12px;color:var(--muted)}
      .workflow-head label{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted)}.workflow-head input{width:112px;border:1px solid var(--border);border-radius:7px;padding:6px 8px;font:12px 'JetBrains Mono';color:var(--text);background:#F8FAFC}
      .workflow-steps{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr auto 1fr;align-items:center;gap:8px}.workflow-steps>i{font-style:normal;color:#A7B2C2}.workflow-steps button{display:grid;grid-template-columns:1fr auto;gap:3px 8px;text-align:left;border:1px solid #E1E7EF;background:#F8FAFC;border-radius:10px;padding:10px 11px;color:var(--text);cursor:pointer}.workflow-steps button:hover{border-color:#7398D8;background:#F2F7FF}.workflow-steps span{font-size:12px;font-weight:600}.workflow-steps b{font:700 17px 'Space Grotesk';color:#356FCB;grid-row:1/3;grid-column:2}.workflow-steps small{font-size:10px;color:var(--muted)}
      .action-title{display:flex;align-items:center;justify-content:space-between;gap:16px}.action-title .btn{font-family:'Sarabun';text-transform:none;letter-spacing:0}
      .analytics-page{max-width:1500px;margin:0 auto;display:flex;flex-direction:column;gap:18px}.analytics-toolbar{display:flex;align-items:flex-end;justify-content:space-between;gap:18px}.analytics-toolbar>div>span,.analytics-card-head span{font:700 10px 'Space Grotesk';letter-spacing:.13em;color:#8794A7}.analytics-toolbar h2{font:700 25px 'Space Grotesk';color:var(--navy);margin:5px 0 0}.analytics-toolbar p{font-size:13px;color:var(--muted);margin:6px 0 0}.analytics-toolbar label{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted)}.analytics-toolbar select{border:1px solid var(--border);background:#fff;border-radius:8px;padding:8px 10px;color:var(--text)}
      .cost-story{display:grid;grid-template-columns:minmax(230px,.75fr) 2fr;gap:24px;align-items:center;padding:22px 24px;border-radius:15px;color:#fff;box-shadow:0 10px 26px rgba(22,35,61,.12)}.cost-story.negative{background:linear-gradient(120deg,#273651,#9F4052)}.cost-story.positive{background:linear-gradient(120deg,#173D54,#187D68)}.cost-story>div:first-child{border-right:1px solid rgba(255,255,255,.22)}.cost-story span{display:block;font-size:12px;color:rgba(255,255,255,.72)}.cost-story strong{display:block;font:700 34px 'Space Grotesk';margin:5px 0}.cost-story small{font-size:12px;font-weight:700}.story-copy b{font-size:18px}.story-copy p{font-size:13px;line-height:1.65;color:rgba(255,255,255,.78);margin:7px 0 0}.up{color:#F15B71!important}.down{color:#20B67A!important}.cost-story .up{color:#FFD6DC!important}.cost-story .down{color:#B8F5D8!important}
      .insight-kpis,.otif-ops-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:13px}.insight-kpis article,.otif-ops-grid article{background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px}.insight-kpis span,.otif-ops-grid span{display:block;font-size:12px;color:var(--muted)}.insight-kpis b,.otif-ops-grid b{font:700 23px 'Space Grotesk';color:var(--navy);display:block;margin:6px 0 3px}.insight-kpis small,.otif-ops-grid small{font-size:11px;color:var(--muted)}
      .analytics-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(340px,.75fr);gap:18px}.analytics-card,.service-summary{background:#fff;border:1px solid var(--border);border-radius:14px;overflow:hidden}.analytics-card-head{display:flex;justify-content:space-between;align-items:center;padding:17px 18px;border-bottom:1px solid #E7ECF2}.analytics-card-head h3{font-size:15px;color:var(--navy);margin:4px 0 0}.analytics-card-head>b{font:700 13px 'Space Grotesk';color:#356FCB}.chart-frame{height:290px;padding:10px 14px 14px}.cause-list{padding:12px 16px}.cause-list article{display:grid;grid-template-columns:32px 1fr;gap:11px;padding:12px 0;border-bottom:1px solid #EBEFF4}.cause-list article:last-child{border:0}.cause-list i{width:29px;height:29px;border-radius:9px;display:grid;place-items:center;font-style:normal;font-weight:800}.cause-list article.bad i{background:#FFF0F2;color:#D84F62}.cause-list article.good i{background:#EAF9F1;color:#249965}.cause-list b{font-size:13px}.cause-list p{font-size:12px;line-height:1.55;color:var(--muted);margin:3px 0 0}.metric-bad{color:#D84F62!important;font-weight:700}.metric-good{color:#249965!important;font-weight:700}.analysis-tag{display:inline-flex;border-radius:12px;padding:4px 8px;font-size:11px;font-weight:700}.analysis-tag.warn{background:#FFF2DF;color:#B96D14}.analysis-tag.ok{background:#EAF9F1;color:#24885B}.analytics-footnote{font-size:12px;color:var(--muted);text-align:right}
      .overall-otif{min-width:190px;border-radius:13px;padding:14px 18px;color:#fff}.overall-otif.pass{background:#20A66B}.overall-otif.fail{background:#E15268}.overall-otif span,.overall-otif small{display:block;font-size:11px;color:rgba(255,255,255,.8)}.overall-otif b{display:block;font:700 28px 'Space Grotesk';margin:3px 0}.otif-trend-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.otif-trend-card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:16px;overflow:hidden}.otif-card-head{display:flex;justify-content:space-between;align-items:flex-start}.otif-card-head span{display:block;font-size:13px;font-weight:700;color:var(--navy)}.otif-card-head small{display:block;font-size:10px;color:var(--muted);margin-top:3px}.otif-card-head strong{font:700 21px 'Space Grotesk'}.mini-chart{height:165px;margin-top:4px}.otif-result{font-size:11px;font-weight:700;text-align:right}.otif-result.pass{color:#20965F}.otif-result.fail{color:#D84F62}.service-summary{padding-bottom:16px}.service-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:14px 16px}.service-kpis article{border-radius:11px;padding:14px;color:#fff}.service-kpis span,.service-kpis small{display:block;font-size:11px;color:rgba(255,255,255,.82)}.service-kpis b{display:block;font:700 21px 'Space Grotesk';margin:4px 0}.combined-chart{height:310px;margin:0 16px;border:1px solid #E1E8F0;border-radius:12px;padding:10px;background:#FAFCFF}.action-list{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:16px}.action-list>div{display:flex;gap:11px;padding:13px;border:1px solid #E3E9F0;background:#F8FAFC;border-radius:10px}.action-list>div>b{width:25px;height:25px;display:grid;place-items:center;border-radius:8px;background:#356FCB;color:#fff}.action-list strong,.action-list small{display:block}.action-list strong{font-size:12px}.action-list small{font-size:11px;color:var(--muted);line-height:1.45;margin-top:3px}
      @media(max-width:1100px){.workflow-steps{grid-template-columns:repeat(5,1fr)}.workflow-steps>i{display:none}.analytics-grid{grid-template-columns:1fr}.insight-kpis,.otif-ops-grid{grid-template-columns:repeat(2,1fr)}.service-kpis{grid-template-columns:repeat(2,1fr)}}
      @media(max-width:760px){.wms-app .content{padding-bottom:72px}.workflow-head,.analytics-toolbar{align-items:flex-start;flex-direction:column}.workflow-steps{display:flex;overflow-x:auto}.workflow-steps button{min-width:150px}.cost-story{grid-template-columns:1fr}.cost-story>div:first-child{border-right:0;border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:14px}.insight-kpis,.otif-ops-grid,.otif-trend-grid,.service-kpis,.action-list{grid-template-columns:1fr}.analytics-toolbar h2{font-size:21px}.table-wrap{max-width:calc(100vw - 120px)}.chart-frame{height:250px}}
    `}</style>
  );
}
