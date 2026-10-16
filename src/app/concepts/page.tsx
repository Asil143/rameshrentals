import type { Metadata } from "next";
import Link from "next/link";
import { DEFAULT_TOWN_SLUG, SITE_NAME } from "@/lib/constants";
import { getLocale } from "@/lib/i18n/get-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { UiText } from "@/lib/i18n/ui";

export const metadata: Metadata = {
  title: `Our New Rental Hub | ${SITE_NAME}`,
  description:
    "A covered pickup forecourt, 360° handover checks, a wash bay and secure parking — a first look at the upcoming Ramesh Rentals hub.",
};

// Simple line icons (24×24) for the four features: roof, camera, water drop, lock.
const FEATURE_ICONS = [
  "M3 11 12 4l9 7M5 10v9h14v-9",
  "M4 8h3l2-3h6l2 3h3v11H4zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7",
  "M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11",
  "M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3",
];

// Plots 4 + 5: 345.66 m², perimeter 77.54 m → 13.90 m on Road 1 × 24.87 m deep.
// Keep these zone sizes in sync with tools/render_hub_walkthrough.py.
const PLOT_W = 13.9;
const PLOT_D = 24.87;
const FRONT = 6.0; // office + forecourt depth
const REAR = 5.6; // wash / service / store depth
const LANE_L = 4.6; // office and bike strip width
const LANE_R = 8.4; // 3.8 m drive lane
const ROOM_1 = 5.56;
const ROOM_2 = 9.73;
const CAR_BAY = 2.55;
const FREE_BAY = 2; // the empty middle bay carries the "Car parking" label

const PX_PER_M = 26;
const OX = 46; // left margin (room for the depth label)
const OY = 34; // top margin (room for the width label)
const px = (m: number) => m * PX_PER_M;
const FRONT_Y = PLOT_D - FRONT; // plan y is metres from the rear wall

type ZoneKey = keyof UiText["hubZones"];
// x/y/w/h: the zone; lx/ly/lw: centre and width (metres) of where its name is written.
type Zone = { key: ZoneKey; x: number; y: number; w: number; h: number; tone: string; lx: number; ly: number; lw: number };

// Customers stay at the front; parking in the middle; wash/service/store at the back.
const ZONES: Zone[] = [
  { key: "forecourt", x: LANE_L, y: FRONT_Y, w: PLOT_W - LANE_L, h: FRONT, tone: "fill-[var(--color-brand-500)]/12", lx: (LANE_L + PLOT_W) / 2, ly: FRONT_Y + 0.6, lw: 9 },
  { key: "handover", x: LANE_L + 1, y: FRONT_Y + 1, w: PLOT_W - LANE_L - 2, h: FRONT - 1.9, tone: "fill-none", lx: (LANE_L + PLOT_W) / 2, ly: FRONT_Y + 3.05, lw: 6.8 },
  { key: "office", x: 0, y: FRONT_Y, w: LANE_L, h: FRONT, tone: "fill-[var(--color-brand-500)]/20", lx: LANE_L / 2, ly: FRONT_Y + 3.9, lw: 4.3 },
  { key: "bikes", x: 0, y: REAR, w: LANE_L, h: FRONT_Y - REAR, tone: "fill-[var(--color-accent-400)]/15", lx: LANE_L / 2, ly: REAR + 0.95, lw: 4.3 },
  { key: "cars", x: LANE_R, y: REAR, w: PLOT_W - LANE_R, h: FRONT_Y - REAR, tone: "fill-[var(--color-brand-500)]/10", lx: (LANE_R + PLOT_W) / 2, ly: FRONT_Y - 0.3 - CAR_BAY * (FREE_BAY + 0.5), lw: 4.8 },
  { key: "wash", x: 0, y: 0, w: ROOM_1, h: REAR, tone: "fill-sky-500/12", lx: ROOM_1 / 2, ly: REAR / 2, lw: 5.2 },
  { key: "service", x: ROOM_1, y: 0, w: ROOM_2 - ROOM_1, h: REAR, tone: "fill-[var(--color-border)]", lx: (ROOM_1 + ROOM_2) / 2, ly: REAR / 2, lw: 3.9 },
  { key: "store", x: ROOM_2, y: 0, w: PLOT_W - ROOM_2, h: REAR, tone: "fill-[var(--color-accent-400)]/10", lx: (ROOM_2 + PLOT_W) / 2, ly: REAR / 2, lw: 3.9 },
];

const LABEL_SIZE = 13;
const LABEL_LINE = 15;

/** Greedy word wrap to fit `widthPx`; Telugu glyphs run wider than Latin ones. */
function wrapLabel(text: string, widthPx: number) {
  const charWidth = LABEL_SIZE * (/[\u0C00-\u0C7F]/.test(text) ? 0.72 : 0.6);
  const maxChars = Math.max(4, Math.floor(widthPx / charWidth));
  const lines: string[] = [];
  for (const word of text.split(" ")) {
    const last = lines[lines.length - 1];
    if (last && `${last} ${word}`.length <= maxChars) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

function FloorPlan({ u }: { u: UiText }) {
  const line = "stroke-[var(--color-brand-900)] dark:stroke-[var(--color-ink)]";
  const W = px(PLOT_W);
  const D = px(PLOT_D);
  const gateX = OX + px(LANE_L);
  const laneX = OX + px((LANE_L + LANE_R) / 2);
  const label = "fill-[var(--color-ink-soft)]";
  return (
    <svg viewBox={`0 0 ${W + OX + 24} ${D + OY + 70}`} role="img" aria-label={u.hubPlanTitle} className="h-auto w-full">
      {ZONES.map((zone) => {
        const x = OX + px(zone.x);
        const y = OY + px(zone.y);
        const isBay = zone.key === "handover";
        const lines = wrapLabel(u.hubZones[zone.key], px(zone.lw));
        const firstLineY = OY + px(zone.ly) - ((lines.length - 1) * LABEL_LINE) / 2 + LABEL_SIZE / 3;
        return (
          <g key={zone.key}>
            <rect
              x={x}
              y={y}
              width={px(zone.w)}
              height={px(zone.h)}
              rx={isBay ? 12 : 0}
              className={isBay ? "fill-none stroke-[var(--color-accent-400)]" : `${zone.tone} ${line}`}
              strokeWidth={isBay ? 4 : 1.5}
              strokeDasharray={isBay ? "12 8" : undefined}
            />
            <text textAnchor="middle" fontSize={LABEL_SIZE} fontWeight="700" className="fill-[var(--color-ink)]">
              {lines.map((line, i) => (
                <tspan key={i} x={OX + px(zone.lx)} y={firstLineY + i * LABEL_LINE}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}

      {/* Bike stands */}
      {Array.from({ length: 10 }, (_, i) => {
        const y = OY + px(REAR + 2.0 + i * 1.15);
        return <rect key={i} x={OX + px(0.6)} y={y} width={px(3.4)} height="5" rx="2.5" transform={`rotate(-10 ${OX + px(2.3)} ${y})`} className="fill-[var(--color-accent-400)]" />;
      })}

      {/* Car bays across the strip, nose-in from the drive lane; parked cars shown from above */}
      {Array.from({ length: 5 }, (_, k) => {
        const y = OY + px(FRONT_Y - 0.3 - CAR_BAY * (k + 1));
        return (
          <g key={k}>
            <rect x={OX + px(LANE_R + 0.2)} y={y + 3} width={px(PLOT_W - LANE_R - 0.4)} height={px(CAR_BAY) - 6} rx="8" className="fill-none stroke-[var(--color-brand-600)]" strokeWidth="2.5" />
            {k !== FREE_BAY && <rect x={OX + px(LANE_R + 0.7)} y={y + px(0.42)} width={px(3.8)} height={px(1.7)} rx="12" className="fill-[var(--color-brand-500)]/35" />}
          </g>
        );
      })}

      {/* Drive lane from the gate to the wash bay */}
      <line x1={laneX} y1={OY + px(REAR + 0.3)} x2={laneX} y2={OY + px(FRONT_Y - 0.2)} className="stroke-[var(--color-accent-400)]" strokeWidth="3" strokeDasharray="10 10" />
      <path d={`M${laneX - 8} ${OY + px(REAR + 1) + 6} L${laneX} ${OY + px(REAR + 1) - 4} L${laneX + 8} ${OY + px(REAR + 1) + 6}`} className="fill-none stroke-[var(--color-accent-400)]" strokeWidth="3" strokeLinejoin="round" />

      {/* Toilet inside the office block */}
      <rect x={OX + px(2.4)} y={OY + px(FRONT_Y)} width={px(LANE_L - 2.4)} height={px(1.8)} className={`fill-[var(--color-surface-raised)] ${line}`} strokeWidth="1.5" />
      <text x={OX + px((2.4 + LANE_L) / 2)} y={OY + px(FRONT_Y + 0.9) + 4} textAnchor="middle" fontSize="11" fontWeight="600" className={label}>
        {u.hubWc}
      </text>

      {/* Boundary wall with the gate opening onto Road 1 */}
      <path
        d={`M${gateX} ${OY + D} H${OX} V${OY} H${OX + W} V${OY + D} H${OX + W - 2}`}
        className={`fill-none ${line}`}
        strokeWidth="5"
      />
      <text x={(gateX + OX + W) / 2} y={OY + D - 8} textAnchor="middle" fontSize="13" fontWeight="700" className="fill-[var(--color-accent-600)]">
        ▼ {u.hubGate} ▼
      </text>

      {/* Road 1 */}
      <rect x="0" y={OY + D + 10} width={W + OX + 24} height="40" className="fill-[var(--color-brand-900)] dark:fill-[var(--color-brand-800)]" />
      <text x={OX + W / 2} y={OY + D + 35} textAnchor="middle" fontSize="15" fontWeight="700" letterSpacing="1" className="fill-white">
        {u.hubRoad(1)}
      </text>

      {/* Dimensions */}
      <text x={OX + W / 2} y={OY - 12} textAnchor="middle" fontSize="15" className={label}>
        ← {u.hubMetres(PLOT_W)} →
      </text>
      <text x={OX - 18} y={OY + D / 2} textAnchor="middle" fontSize="15" className={label} transform={`rotate(-90 ${OX - 18} ${OY + D / 2})`}>
        ← {u.hubMetres(PLOT_D)} →
      </text>
    </svg>
  );
}

// The block from the owner's sketch: Road 1 in front, Road 2 right, Road 3 left;
// plots 1–5 are strips, 6/7/8 stack on the right. The hub is plots 4 + 5.
function SiteMap({ u }: { u: UiText }) {
  const road = "fill-[var(--color-brand-900)] dark:fill-[var(--color-brand-800)]";
  const plot = "fill-[var(--color-border)] stroke-[var(--color-surface-raised)]";
  const strips = [
    [62, 104],
    [104, 140],
    [140, 172],
  ];
  return (
    <svg viewBox="0 0 400 300" role="img" aria-label={u.hubSiteAlt} className="h-auto w-full">
      {/* Roads */}
      <rect x="18" y="20" width="36" height="236" className={road} />
      <rect x="346" y="20" width="36" height="236" className={road} />
      <rect x="18" y="232" width="364" height="44" className={road} />
      <text x="200" y="259" textAnchor="middle" fontSize="13" fontWeight="700" className="fill-white">{u.hubRoad(1)}</text>
      <text x="364" y="130" textAnchor="middle" fontSize="12" fontWeight="700" className="fill-white" transform="rotate(90 364 130)">{u.hubRoad(2)}</text>
      <text x="36" y="130" textAnchor="middle" fontSize="12" fontWeight="700" className="fill-white" transform="rotate(-90 36 130)">{u.hubRoad(3)}</text>

      {/* Junctions */}
      {[
        [36, 254, "J2"],
        [364, 254, "J1"],
      ].map(([x, y, name]) => (
        <g key={name}>
          <circle cx={x} cy={y} r="15" className="fill-[var(--color-accent-400)]" />
          <text x={x} y={Number(y) + 4.5} textAnchor="middle" fontSize="12" fontWeight="800" className="fill-[var(--color-brand-900)]">{name}</text>
        </g>
      ))}

      {/* Neighbouring plots */}
      {strips.map(([x1, x2]) => (
        <rect key={x1} x={x1} y="24" width={x2 - x1} height="204" className={plot} strokeWidth="3" />
      ))}
      {[24, 92, 160].map((y) => (
        <rect key={y} x="252" y={y} width="90" height="68" className={plot} strokeWidth="3" />
      ))}

      {/* The hub: plots 4 + 5 */}
      <rect x="172" y="24" width="80" height="204" className="fill-[var(--color-accent-400)] stroke-[var(--color-brand-700)]" strokeWidth="3" />
      <text x="212" y="122" textAnchor="middle" fontSize="15" fontWeight="800" className="fill-[var(--color-brand-900)]">
        {u.hubHere}
      </text>
      <text x="212" y="142" textAnchor="middle" fontSize="11" fontWeight="600" className="fill-[var(--color-brand-900)]/70">
        4 + 5
      </text>
      <path d="M204 216 L212 232 L220 216 Z" className="fill-[var(--color-brand-700)]" />
    </svg>
  );
}

export default async function HubPage() {
  const locale = await getLocale();
  const u = getDictionary(locale).ui;

  return (
    <div>
      <section className="mesh-hero px-4 pb-0 pt-14 text-white sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
            {u.hubBadge}
          </span>
          <h1 className="font-display text-3xl font-bold sm:text-5xl">{u.hubTitle}</h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-white/75 sm:text-lg">{u.hubIntro}</p>
        </div>
        <div className="mx-auto mt-10 max-w-4xl translate-y-10 overflow-hidden rounded-3xl border border-hairline bg-surface-raised p-2 shadow-lift sm:p-3">
          <video
            className="aspect-video w-full rounded-2xl bg-black object-cover"
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
            poster="/concepts/hub-walkthrough-poster.jpg"
            aria-label={u.hubVideoLabel}
          >
            <source src="/concepts/hub-walkthrough.mp4" type="video/mp4" />
          </video>
          <p className="px-2 pb-1 pt-2.5 text-center text-xs text-ink-faint">{u.hubVideoCaption}</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 pb-14 pt-24 sm:px-6">
        <h2 className="font-display mb-6 text-2xl font-bold sm:text-3xl">{u.hubFeaturesTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {u.hubFeatures.map((feature, index) => (
            <div key={feature.title} className="flex gap-4 rounded-2xl border border-hairline bg-surface-raised p-5 shadow-soft">
              <span aria-hidden className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-500)]/12 text-[var(--color-brand-600)] dark:text-[var(--color-brand-400)]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={FEATURE_ICONS[index]} />
                </svg>
              </span>
              <div>
                <h3 className="font-display font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{feature.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-8 px-4 pb-14 sm:px-6 md:grid-cols-2 md:items-center">
        <div className="rounded-2xl border border-hairline bg-surface-raised p-4 shadow-soft">
          <SiteMap u={u} />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{u.hubSiteTitle}</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">{u.hubSiteBody}</p>
        </div>
      </section>

      <section className="border-y border-hairline bg-surface-raised">
        <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,22rem)_1fr] md:items-center md:gap-14">
          <div className="mx-auto w-full max-w-sm">
            <FloorPlan u={u} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{u.hubPlanTitle}</h2>
            <p className="mt-4 leading-relaxed text-ink-soft">{u.hubPlanBody}</p>
            <p className="mt-5 text-xs text-ink-faint">{u.hubPlanNote}</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 text-center">
        <Link
          href={`/${DEFAULT_TOWN_SLUG}/vehicles`}
          className="inline-flex rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] px-6 py-3 font-display font-semibold text-white shadow-soft transition-all hover:shadow-brand"
        >
          {u.hubCta}
        </Link>
      </section>
    </div>
  );
}
