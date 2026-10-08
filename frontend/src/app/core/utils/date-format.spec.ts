import {
  addDays,
  formatDateTime,
  formatDay,
  formatSession,
  formatSessionDay,
  formatSessionTime,
  formatTimeRange,
  formatWeek,
  todayIso,
  weekStartOf
} from "./date-format";

/** Les formats utilisent des espaces insécables : on les ramène à des espaces simples pour comparer. */
const plain = (value: string): string => value.replaceAll("\u00a0", " ");

describe("date-format", () => {
  it("formate une séance à la québécoise, dans le fuseau de l'application", () => {
    expect(plain(formatSessionDay("2026-10-27T17:45:00-04:00"))).toBe("Mardi 27 octobre");
    expect(plain(formatSessionTime("2026-10-27T17:45:00-04:00"))).toBe("17 h 45");
    // Même instant exprimé en UTC : l'affichage ne dépend pas du fuseau du navigateur.
    expect(plain(formatSessionTime("2026-10-27T21:45:00Z"))).toBe("17 h 45");
    expect(plain(formatSessionTime("2026-11-05T09:05:00-05:00"))).toBe("9 h 05");
  });

  it("ne coupe jamais une heure en fin de ligne", () => {
    expect(formatSessionTime("2026-10-27T17:45:00-04:00")).toBe("17\u00a0h\u00a045");
    expect(formatSession("2026-10-27T17:45:00-04:00")).toBe("Mardi 27\u00a0octobre ·\u00a017\u00a0h\u00a045");
    expect(formatSession(null)).toBe("Date inconnue");
  });

  it("écrit « 1er » pour le premier du mois", () => {
    expect(plain(formatSessionDay("2026-11-01T09:00:00-05:00"))).toBe("Dimanche 1er novembre");
    expect(plain(formatWeek("2026-10-26"))).toBe("26 octobre au 1er novembre 2026");
  });

  it("formate une semaine du lundi au dimanche, été comme hiver", () => {
    expect(plain(formatWeek("2026-11-02"))).toBe("2 au 8 novembre 2026");
    expect(plain(formatWeek("2026-12-28"))).toBe("28 décembre au 3 janvier 2027");
    expect(plain(formatWeek("2027-03-08"))).toBe("8 au 14 mars 2027");
  });

  it("tolère une date absente", () => {
    expect(formatSessionDay(null)).toBe("Date inconnue");
    expect(formatSessionTime(undefined)).toBe("");
    expect(formatDateTime(null)).toBe("—");
  });

  it("formate un horodatage court", () => {
    expect(plain(formatDateTime("2026-10-02T11:44:14Z"))).toBe("2 oct. 2026, 07 h 44");
  });
});

describe("dates sans heure", () => {
  it("todayIso : le jour de l'application, même quand UTC est déjà au lendemain", () => {
    expect(todayIso(new Date("2026-11-01T02:30:00Z"))).toBe("2026-10-31");
  });

  it("weekStartOf : lundi de la semaine, dimanche compris", () => {
    expect(weekStartOf("2026-10-27")).toBe("2026-10-26");
    expect(weekStartOf("2026-10-26")).toBe("2026-10-26");
    expect(weekStartOf("2026-11-01")).toBe("2026-10-26");
  });

  it("addDays : traverse le changement d'heure et le changement de mois", () => {
    expect(addDays("2026-10-26", 6)).toBe("2026-11-01");
    expect(addDays("2026-11-02", -7)).toBe("2026-10-26");
  });

  it("formatDay et formatTimeRange", () => {
    expect(formatDay("2026-10-27").replaceAll("\u00a0", " ")).toBe("Mardi 27 octobre");
    expect(formatTimeRange("2026-10-27T17:45:00-04:00", "2026-10-27T18:45:00-04:00").replaceAll("\u00a0", " ")).toBe(
      "17 h 45 à 18 h 45"
    );
    expect(formatTimeRange("2026-10-27T17:45:00-04:00", null).replaceAll("\u00a0", " ")).toBe("17 h 45");
  });
});
