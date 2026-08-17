"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getDictionary, type Locale } from "@/lib/i18n/dictionary";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDateStr(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function AvailabilityCalendar({
  vehicleId,
  startDate,
  endDate,
  onChange,
  locale = "en",
}: {
  vehicleId: string;
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  locale?: Locale;
}) {
  const t = getDictionary(locale).calendar;
  const localeTag = locale === "te" ? "te-IN" : "en-IN";

  const [bookedDays, setBookedDays] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = startDate ? parseDateStr(startDate) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function load() {
      const { data } = await supabase.rpc("vehicle_booked_ranges", { p_vehicle_id: vehicleId });
      if (cancelled) return;
      if (data) {
        const days = new Set<string>();
        for (const range of data) {
          const cursor = parseDateStr(range.start_date);
          const end = parseDateStr(range.end_date);
          while (cursor <= end) {
            days.add(toDateStr(cursor));
            cursor.setDate(cursor.getDate() + 1);
          }
        }
        setBookedDays(days);
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  const today = startOfDay(new Date());

  function isDisabled(d: Date) {
    return d < today || bookedDays.has(toDateStr(d));
  }

  function hasBookedBetween(a: Date, b: Date) {
    const cursor = new Date(a);
    while (cursor <= b) {
      if (bookedDays.has(toDateStr(cursor))) return true;
      cursor.setDate(cursor.getDate() + 1);
    }
    return false;
  }

  function handleClick(d: Date) {
    if (isDisabled(d)) return;
    const clickedStr = toDateStr(d);

    const noSelection = !startDate || (startDate && endDate);
    if (noSelection) {
      onChange(clickedStr, "");
      return;
    }

    const start = parseDateStr(startDate);
    if (d < start) {
      onChange(clickedStr, "");
      return;
    }
    if (hasBookedBetween(start, d)) {
      onChange(clickedStr, "");
      return;
    }
    onChange(startDate, clickedStr);
  }

  const weeks = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
    while (cells.length % 7 !== 0) cells.push(null);

    const rows: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
    return rows;
  }, [viewMonth]);

  const weekdayLabels = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(localeTag, { weekday: "short" });
    // Jan 4, 2026 is a Sunday — a stable local reference week.
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2026, 0, 4 + i)));
  }, [localeTag]);

  const monthLabel = new Intl.DateTimeFormat(localeTag, {
    month: "long",
    year: "numeric",
  }).format(viewMonth);

  const start = startDate ? parseDateStr(startDate) : null;
  const end = endDate ? parseDateStr(endDate) : null;

  return (
    <div className="rounded-xl border border-hairline bg-[var(--color-surface)] p-3.5">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label={t.prevMonth}
          onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-[var(--color-border)]"
        >
          ‹
        </button>
        <span className="font-display text-sm font-semibold capitalize">{monthLabel}</span>
        <button
          type="button"
          aria-label={t.nextMonth}
          onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-[var(--color-border)]"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-ink-faint">
        {weekdayLabels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {weeks.flat().map((d, i) => {
          if (!d) return <span key={i} />;
          const dStr = toDateStr(d);
          const disabled = isDisabled(d);
          const isStart = start && dStr === toDateStr(start);
          const isEnd = end && dStr === toDateStr(end);
          const inRange = start && end && d > start && d < end;
          const selected = isStart || isEnd;

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(d)}
              className={`aspect-square rounded-lg text-xs font-medium transition-colors ${
                disabled
                  ? "cursor-not-allowed text-ink-faint/40 line-through"
                  : selected
                    ? "bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white"
                    : inRange
                      ? "bg-[var(--color-brand-500)]/15 text-[var(--color-brand-700)] dark:text-[var(--color-brand-300)]"
                      : "hover:bg-[var(--color-border)]"
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-hairline pt-2.5 text-[11px] text-ink-faint">
        <span>{t.helperText}</span>
        {!loading && (
          <span className="flex items-center gap-1 whitespace-nowrap">
            <span className="inline-block h-2 w-2 rounded-full bg-ink-faint/40" />
            {t.legendBooked}
          </span>
        )}
      </div>
    </div>
  );
}
