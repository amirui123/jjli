/**
 * All user-facing copy for the entrance film and the hero headline.
 *
 * Kept in one place on purpose: the hero sentence is the same sentence the
 * intro builds word by word, so the film and the page can never drift apart.
 * Edit the text here and both surfaces follow.
 */

export interface HeadlineWord {
  /** The word exactly as it should be typeset. */
  text: string;
  /** Gold words carry the accent gradient; the rest stay ivory. */
  gold?: boolean;
}

export interface HeadlineLine {
  words: HeadlineWord[];
}

/**
 * The hero sentence, split into hemistichs so that every breakpoint renders the
 * same two balanced lines — the intro animates these exact words into place.
 */
export const HERO_LINES: HeadlineLine[] = [
  {
    words: [{ text: "هر" }, { text: "واژه،" }, { text: "یک" }, { text: "حرکت" }],
  },
  {
    words: [
      { text: "هر" },
      { text: "حرکت،", gold: true },
      { text: "یک", gold: true },
      { text: "نفس" },
    ],
  },
];

/** Flat word list, reading order (right to left, line by line). */
export const HERO_WORDS: HeadlineWord[] = HERO_LINES.flatMap((line) => line.words);

/** One-line rendering for places that cannot show two lines (marquee, footer). */
export const HERO_SENTENCE = HERO_LINES.map((line) => line.words.map((w) => w.text).join(" ")).join(
  " — "
);

/** The couplet as it appears in the footer brand block. */
export const FOOTER_COUPLET = HERO_SENTENCE;

export const INTRO_COPY = {
  /** Accessible name of the film's dialog wrapper. */
  dialogLabel: "تیتراژ ورود به آزمایشگاه موشن فارسی",

  /** How the film opens. */
  greeting: {
    words: ["سلام،", "چطوری؟"],
    /** Describes the bespoke medallion face next to the greeting. */
    emojiLabel: "خورشیدِ خندانِ نستعلیق",
  },

  /** The invitation the user has to answer with a tap. */
  invite: {
    lead: "بزن روی",
    focus: "این نقطه",
    /** Accessible name of the tappable point (also used by the e2e gate check). */
    gateLabel: "شروع انیمیشن ورود با صدا",
    hint: "با یک ضربه، نوشته‌ها جان می‌گیرند",
  },

  /** Always-available escape hatch. */
  skip: "رد کردن",
  skipLabel: "رد کردن موشن ورود",

  /** Played after the film is dismissed. */
  enterHint: "برای ورود بزن",

  /** Replay affordance that stays on the page afterwards. */
  replay: "پخش مجدد موشن ورود",
  replayLabel: "پخش دوباره انیمیشن ورود",
};

/** Accessible name for the whole film, used by screen readers mid-animation. */
export const INTRO_PROGRESS_LABEL = {
  greeting: "سلام، چطوری؟",
  invite: "روی نقطه بزن تا نوشته‌ها ساخته شوند",
  bloom: "نوشته‌ها در حال ساخته شدن‌اند",
  sentence: HERO_SENTENCE,
};
