/** Dates affichées à la québécoise, toujours dans le fuseau de l'application (TIMEZONE côté backend). */
const TIMEZONE = "America/Toronto";

/** Espace insécable : « 17 h 45 » et « 27 octobre » ne se coupent jamais en fin de ligne. */
const NBSP = "\u00a0";

const capitalize = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

const partsOf = (date: Date, options: Intl.DateTimeFormatOptions): Record<string, string> =>
  Object.fromEntries(
    new Intl.DateTimeFormat("fr-CA", { timeZone: TIMEZONE, ...options })
      .formatToParts(date)
      .map((part) => [part.type, part.value])
  );

/** « 1er » pour le premier du mois, sinon le chiffre. */
const dayNumber = (day: string): string => (Number(day) === 1 ? "1er" : String(Number(day)));

/** « Mardi 27 octobre » */
export const formatSessionDay = (iso: string | null | undefined): string => {
  if (!iso) return "Date inconnue";
  const parts = partsOf(new Date(iso), { weekday: "long", day: "numeric", month: "long" });
  return `${capitalize(parts["weekday"])} ${dayNumber(parts["day"])}${NBSP}${parts["month"]}`;
};

/** « 17 h 45 » */
export const formatSessionTime = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const parts = partsOf(new Date(iso), { hour: "numeric", minute: "2-digit", hourCycle: "h23" });
  return `${Number(parts["hour"])}${NBSP}h${NBSP}${parts["minute"]}`;
};

/** « Mardi 27 octobre · 17 h 45 » : le point médian reste collé à l'heure. */
export const formatSession = (iso: string | null | undefined): string => {
  if (!iso) return "Date inconnue";
  return `${formatSessionDay(iso)} ·${NBSP}${formatSessionTime(iso)}`;
};

/**
 * Semaine du lundi au dimanche : « 2 au 8 novembre 2026 », ou « 26 octobre au
 * 1er novembre 2026 » quand elle chevauche deux mois. `weekStart` = AAAA-MM-JJ.
 */
export const formatWeek = (weekStart: string): string => {
  // Midi UTC : la date reste la même dans le fuseau de l'application, été comme hiver.
  const start = new Date(`${weekStart}T12:00:00Z`);
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  const from = partsOf(start, { day: "numeric", month: "long" });
  const to = partsOf(end, { day: "numeric", month: "long", year: "numeric" });
  const toLabel = `au${NBSP}${dayNumber(to["day"])}${NBSP}${to["month"]}${NBSP}${to["year"]}`;
  // Même mois : libellé court, jamais coupé. Deux mois : la seule coupure possible est avant « au ».
  return from["month"] === to["month"]
    ? `${dayNumber(from["day"])}${NBSP}${toLabel}`
    : `${dayNumber(from["day"])}${NBSP}${from["month"]} ${toLabel}`;
};

/** « 2 oct. 2026, 07 h 44 » : horodatage court pour les journaux. */
export const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) return "—";
  const parts = partsOf(new Date(iso), {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });
  return `${dayNumber(parts["day"])}${NBSP}${parts["month"]}${NBSP}${parts["year"]}, ${parts["hour"]}${NBSP}h${NBSP}${parts["minute"]}`;
};

/* --- Dates sans heure (AAAA-MM-JJ) : calculs à midi UTC, à l'abri des changements d'heure --- */

const DAY_MS = 24 * 60 * 60 * 1000;
const atNoonUtc = (isoDate: string): Date => new Date(`${isoDate}T12:00:00Z`);
const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

/** Aujourd'hui dans le fuseau de l'application, AAAA-MM-JJ. */
export const todayIso = (now: Date = new Date()): string => {
  const parts = partsOf(now, { year: "numeric", month: "2-digit", day: "2-digit" });
  return `${parts["year"]}-${parts["month"]}-${parts["day"]}`;
};

export const addDays = (isoDate: string, days: number): string =>
  toIsoDate(new Date(atNoonUtc(isoDate).getTime() + days * DAY_MS));

/** Lundi de la semaine qui contient `isoDate`. */
export const weekStartOf = (isoDate: string): string => {
  const weekday = atNoonUtc(isoDate).getUTCDay();
  return addDays(isoDate, weekday === 0 ? -6 : 1 - weekday);
};

/** « Mardi 27 octobre » à partir d'une date sans heure. */
export const formatDay = (isoDate: string): string => formatSessionDay(`${isoDate}T12:00:00Z`);

/** « 17 h 45 à 18 h 45 », ou seulement le début quand la fin est inconnue. */
export const formatTimeRange = (start: string, end: string | null | undefined): string =>
  end ? `${formatSessionTime(start)} à${NBSP}${formatSessionTime(end)}` : formatSessionTime(start);
