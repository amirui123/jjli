/**
 * The hero sentence, kept in one place because four surfaces read it: the hero
 * headline, the scrolling ribbon, the footer couplet and the engines demo.
 * Per-line splitting is what lets the hero typeset two balanced hemistichs at
 * every breakpoint instead of re-wrapping a single string.
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
 * same two balanced lines.
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
