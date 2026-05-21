import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, BarChart3, LineChart, IndianRupee, ShoppingBasket } from 'lucide-react';

/**
 * RevenueChart
 * Pure SVG animated revenue chart for the Farmer Dashboard.
 * Supports Bar and Line chart modes, tooltips, dark mode, loading skeleton.
 *
 * Props:
 *  - data: [{ month, revenue, orders }]
 *  - loading: boolean
 *  - totalRevenue: number (for the summary badge)
 */
const RevenueChart = ({ data = [], loading = false, totalRevenue = 0 }) => {
    const [chartType, setChartType] = useState('bar'); // 'bar' | 'line'
    const [tooltip, setTooltip] = useState(null); // { x, y, month, revenue, orders }
    const [animated, setAnimated] = useState(false);
    const svgRef = useRef(null);

    // Trigger bar grow animation after mount
    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 100);
        return () => clearTimeout(t);
    }, [data]);

    // Re-trigger when data changes
    useEffect(() => {
        setAnimated(false);
        const t = setTimeout(() => setAnimated(true), 150);
        return () => clearTimeout(t);
    }, [data]);

    // ── Chart Layout Constants ──────────────────────────────────────
    const W = 760;      // SVG viewBox width
    const H = 260;      // SVG viewBox height
    const PAD_L = 56;   // Left padding (Y labels)
    const PAD_R = 16;
    const PAD_T = 20;
    const PAD_B = 48;   // Bottom padding (X labels)
    const CHART_W = W - PAD_L - PAD_R;
    const CHART_H = H - PAD_T - PAD_B;

    const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

    // ── Y-axis gridlines ───────────────────────────────────────────
    const yTicks = 4;
    const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
        const pct = i / yTicks;
        const y = PAD_T + CHART_H * (1 - pct);
        const val = Math.round(maxRevenue * pct);
        return { y, val };
    });

    // ── Bar geometry ───────────────────────────────────────────────
    const barGap = 0.35;
    const slotW = CHART_W / Math.max(data.length, 1);
    const barW = slotW * (1 - barGap);
    const bars = data.map((d, i) => {
        const cx = PAD_L + slotW * i + slotW / 2;
        const barH = (d.revenue / maxRevenue) * CHART_H;
        const x = cx - barW / 2;
        const y = PAD_T + CHART_H - barH;
        return { ...d, cx, x, y, barH, barW, i };
    });

    // ── Line/area geometry ─────────────────────────────────────────
    const points = bars.map(b => ({ x: b.cx, y: PAD_T + CHART_H - (b.revenue / maxRevenue) * CHART_H }));
    const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
    const areaPath = points.length > 0
        ? `M${points[0].x},${PAD_T + CHART_H} L${polyline.replace(/(\d+\.?\d*),(\d+\.?\d*)/g, '$1,$2')} L${points[points.length - 1].x},${PAD_T + CHART_H} Z`
        : '';
    const linePath = points.length > 0
        ? `M${points.map(p => `${p.x},${p.y}`).join(' L')}`
        : '';

    // ── Tooltip ─────────────────────────────────────────────────────
    const handleBarEnter = (e, bar) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        setTooltip({ bar, clientX: e.clientX, clientY: e.clientY });
    };
    const handleBarLeave = () => setTooltip(null);

    // ── Loading skeleton ───────────────────────────────────────────
    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-stone-100 dark:border-slate-700 shadow-sm animate-pulse">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 w-44 bg-stone-200 dark:bg-slate-700 rounded-lg" />
                    <div className="flex gap-2">
                        <div className="h-8 w-20 bg-stone-200 dark:bg-slate-700 rounded-lg" />
                        <div className="h-8 w-20 bg-stone-200 dark:bg-slate-700 rounded-lg" />
                    </div>
                </div>
                <div className="flex items-end gap-3 h-[200px]">
                    {[60, 80, 45, 90, 70, 55].map((h, i) => (
                        <div key={i} className="flex-1 bg-stone-200 dark:bg-slate-700 rounded-t-lg" style={{ height: `${h}%` }} />
                    ))}
                </div>
                <div className="flex gap-3 mt-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex-1 h-3 bg-stone-200 dark:bg-slate-700 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    // ── Empty state ────────────────────────────────────────────────
    const isEmpty = data.every(d => d.revenue === 0);

    // ── Max revenue formatted ──────────────────────────────────────
    const formatRupee = (n) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-100 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* ── Header ── */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
                        <TrendingUp size={22} />
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-black dark:text-white leading-tight">Monthly Revenue</h3>
                        <p className="text-xs text-stone-400 font-medium">Last 6 months · from orders</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Total badge */}
                    <div className="hidden sm:flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl border border-green-200 dark:border-green-900/40">
                        <IndianRupee size={14} className="text-green-600 dark:text-green-400" />
                        <span className="font-black text-green-700 dark:text-green-400 text-sm">{totalRevenue.toLocaleString('en-IN')}</span>
                        <span className="text-xs text-stone-400 font-medium">total</span>
                    </div>

                    {/* Chart type toggle */}
                    <div className="flex rounded-xl overflow-hidden border border-stone-200 dark:border-slate-600">
                        <button
                            onClick={() => setChartType('bar')}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-colors ${chartType === 'bar'
                                ? 'bg-green-600 text-white'
                                : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-slate-700 dark:text-slate-400'}`}
                        >
                            <BarChart3 size={14} /> Bar
                        </button>
                        <button
                            onClick={() => setChartType('line')}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-colors ${chartType === 'line'
                                ? 'bg-green-600 text-white'
                                : 'text-stone-500 hover:bg-stone-50 dark:hover:bg-slate-700 dark:text-slate-400'}`}
                        >
                            <LineChart size={14} /> Line
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Chart Area ── */}
            <div className="p-5 relative">
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <ShoppingBasket size={44} className="text-stone-200 dark:text-slate-700 mb-3" />
                        <p className="text-stone-400 font-bold text-base">No revenue data yet</p>
                        <p className="text-stone-400 text-sm mt-1">Revenue will appear here once customers place orders.</p>
                    </div>
                ) : (
                    <div className="relative" onMouseLeave={handleBarLeave}>
                        <svg
                            ref={svgRef}
                            viewBox={`0 0 ${W} ${H}`}
                            className="w-full h-auto"
                            style={{ overflow: 'visible' }}
                        >
                            <defs>
                                {/* Bar gradient */}
                                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#16a34a" stopOpacity="1" />
                                    <stop offset="100%" stopColor="#4ade80" stopOpacity="0.7" />
                                </linearGradient>
                                <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#15803d" stopOpacity="1" />
                                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.9" />
                                </linearGradient>
                                {/* Area gradient */}
                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#16a34a" stopOpacity="0.02" />
                                </linearGradient>
                            </defs>

                            {/* ── Grid lines ── */}
                            {gridLines.map((g, i) => (
                                <g key={i}>
                                    <line
                                        x1={PAD_L} y1={g.y} x2={W - PAD_R} y2={g.y}
                                        stroke="currentColor"
                                        strokeOpacity="0.08"
                                        strokeWidth="1"
                                        strokeDasharray="4 4"
                                        className="text-stone-900 dark:text-white"
                                    />
                                    <text
                                        x={PAD_L - 6}
                                        y={g.y + 4}
                                        textAnchor="end"
                                        fontSize="11"
                                        fill="currentColor"
                                        fillOpacity="0.45"
                                        className="text-stone-900 dark:text-white"
                                    >
                                        {formatRupee(g.val)}
                                    </text>
                                </g>
                            ))}

                            {/* ── Bottom axis line ── */}
                            <line
                                x1={PAD_L} y1={PAD_T + CHART_H}
                                x2={W - PAD_R} y2={PAD_T + CHART_H}
                                stroke="currentColor" strokeOpacity="0.15" strokeWidth="1"
                                className="text-stone-900 dark:text-white"
                            />

                            {/* ── BAR CHART ── */}
                            {chartType === 'bar' && bars.map((b) => {
                                const animH = animated ? b.barH : 0;
                                const animY = animated ? b.y : PAD_T + CHART_H;
                                return (
                                    <g key={b.i}>
                                        {/* Bar shadow */}
                                        <rect
                                            x={b.x + 2} y={animY + 2}
                                            width={b.barW} height={animH}
                                            rx="5" fill="#16a34a" fillOpacity="0.12"
                                            style={{ transition: 'height 0.7s cubic-bezier(0.34,1.56,0.64,1), y 0.7s cubic-bezier(0.34,1.56,0.64,1)' }}
                                        />
                                        {/* Bar */}
                                        <rect
                                            x={b.x} y={animY}
                                            width={b.barW} height={animH}
                                            rx="5"
                                            fill="url(#barGrad)"
                                            style={{ transition: 'height 0.65s cubic-bezier(0.34,1.56,0.64,1), y 0.65s cubic-bezier(0.34,1.56,0.64,1)', cursor: 'pointer' }}
                                            onMouseEnter={(e) => handleBarEnter(e, b)}
                                        />
                                        {/* Value label on top */}
                                        {animated && b.revenue > 0 && (
                                            <text
                                                x={b.cx} y={b.y - 6}
                                                textAnchor="middle"
                                                fontSize="10"
                                                fontWeight="bold"
                                                fill="#16a34a"
                                                fillOpacity="0.9"
                                            >
                                                {formatRupee(b.revenue)}
                                            </text>
                                        )}
                                        {/* X-axis label */}
                                        <text
                                            x={b.cx}
                                            y={PAD_T + CHART_H + 20}
                                            textAnchor="middle"
                                            fontSize="11"
                                            fill="currentColor"
                                            fillOpacity="0.5"
                                            className="text-stone-900 dark:text-white"
                                        >
                                            {b.month.split(' ')[0]}
                                        </text>
                                        <text
                                            x={b.cx}
                                            y={PAD_T + CHART_H + 34}
                                            textAnchor="middle"
                                            fontSize="9"
                                            fill="currentColor"
                                            fillOpacity="0.35"
                                            className="text-stone-900 dark:text-white"
                                        >
                                            {b.month.split(' ')[1]}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* ── LINE CHART ── */}
                            {chartType === 'line' && (
                                <g>
                                    {/* Area fill */}
                                    <path d={areaPath} fill="url(#areaGrad)" />
                                    {/* Line */}
                                    <polyline
                                        points={polyline}
                                        fill="none"
                                        stroke="#16a34a"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    {/* Dots */}
                                    {points.map((p, i) => (
                                        <g key={i}>
                                            <circle cx={p.x} cy={p.y} r="6" fill="#16a34a" fillOpacity="0.15" />
                                            <circle
                                                cx={p.x} cy={p.y} r="4"
                                                fill="#16a34a" stroke="#fff" strokeWidth="1.5"
                                                style={{ cursor: 'pointer' }}
                                                onMouseEnter={(e) => handleBarEnter(e, bars[i])}
                                            />
                                            {/* Value label */}
                                            {data[i]?.revenue > 0 && (
                                                <text
                                                    x={p.x} y={p.y - 10}
                                                    textAnchor="middle"
                                                    fontSize="10"
                                                    fontWeight="bold"
                                                    fill="#16a34a"
                                                >
                                                    {formatRupee(data[i].revenue)}
                                                </text>
                                            )}
                                        </g>
                                    ))}
                                    {/* X-axis labels */}
                                    {bars.map((b) => (
                                        <g key={b.i}>
                                            <text
                                                x={b.cx} y={PAD_T + CHART_H + 20}
                                                textAnchor="middle" fontSize="11"
                                                fill="currentColor" fillOpacity="0.5"
                                                className="text-stone-900 dark:text-white"
                                            >
                                                {b.month.split(' ')[0]}
                                            </text>
                                            <text
                                                x={b.cx} y={PAD_T + CHART_H + 34}
                                                textAnchor="middle" fontSize="9"
                                                fill="currentColor" fillOpacity="0.35"
                                                className="text-stone-900 dark:text-white"
                                            >
                                                {b.month.split(' ')[1]}
                                            </text>
                                        </g>
                                    ))}
                                </g>
                            )}
                        </svg>

                        {/* ── Tooltip ── */}
                        {tooltip && (
                            <div
                                className="pointer-events-none fixed z-50 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-green-200 dark:border-green-800 shadow-xl text-xs"
                                style={{ left: tooltip.clientX + 14, top: tooltip.clientY - 60 }}
                            >
                                <p className="font-black text-black dark:text-white mb-1">{tooltip.bar.month}</p>
                                <p className="text-green-700 dark:text-green-400 font-bold">
                                    ₹{tooltip.bar.revenue.toLocaleString('en-IN')}
                                </p>
                                <p className="text-stone-400">{tooltip.bar.orders} order{tooltip.bar.orders !== 1 ? 's' : ''}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Footer Summary Chips ── */}
            {!isEmpty && (
                <div className="px-5 pb-5 flex flex-wrap gap-2">
                    {data.map((d, i) => (
                        <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${d.revenue > 0
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-400'
                            : 'bg-stone-50 dark:bg-slate-700/50 border-stone-200 dark:border-slate-600 text-stone-400'
                        }`}>
                            <span>{d.month.split(' ')[0]}</span>
                            <span className="opacity-60">·</span>
                            <span>₹{d.revenue.toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RevenueChart;
