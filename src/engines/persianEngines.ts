/**
 * RTL Motion Lab — Core Persian RTL, Fintech 3D, Kinetic Typography, National ID, Sheba,
 * Number-to-Words & Persian ZWNJ Cleanup Engines
 * Sourced from toolkit/03-persian-rtl-engine/, toolkit/05-qa-and-bug-hunters/ & toolkit/07-core-engines/
 */

export interface IranianBankTheme {
  id: string;
  nameFa: string;
  nameEn: string;
  bins: string[];
  gradient: string;
  accentHex: string;
  badgeText: string;
  shebaCode: string;
}

export const IRANIAN_BANKS: IranianBankTheme[] = [
  {
    id: "blubank",
    nameFa: "بلوبانک (سامان)",
    nameEn: "BluBank Saman",
    bins: ["62198619", "62198618"],
    gradient: "from-sky-500/35 via-indigo-600/30 to-slate-950",
    accentHex: "#38BDF8",
    badgeText: "نئوبانک هوشمند",
    shebaCode: "056",
  },
  {
    id: "saman",
    nameFa: "بانک سامان",
    nameEn: "Saman Bank",
    bins: ["621986"],
    gradient: "from-cyan-500/30 via-blue-700/25 to-zinc-950",
    accentHex: "#06B6D4",
    badgeText: "شبکه شتاب سامان",
    shebaCode: "056",
  },
  {
    id: "mellat",
    nameFa: "بانک ملت",
    nameEn: "Bank Mellat",
    bins: ["610433", "991975"],
    gradient: "from-rose-500/35 via-amber-600/20 to-zinc-950",
    accentHex: "#F43F5E",
    badgeText: "بانک ملت ایران",
    shebaCode: "012",
  },
  {
    id: "pasargad",
    nameFa: "بانک پاسارگاد",
    nameEn: "Bank Pasargad",
    bins: ["502229", "639347"],
    gradient: "from-amber-500/35 via-yellow-600/20 to-zinc-950",
    accentHex: "#F59E0B",
    badgeText: "بانکدار هزاره سوم",
    shebaCode: "057",
  },
  {
    id: "melli",
    nameFa: "بانک ملی ایران",
    nameEn: "Bank Melli Iran",
    bins: ["603799"],
    gradient: "from-emerald-500/30 via-teal-700/25 to-zinc-950",
    accentHex: "#10B981",
    badgeText: "بانک ملی ایران",
    shebaCode: "017",
  },
  {
    id: "parsian",
    nameFa: "بانک پارسیان",
    nameEn: "Parsian Bank",
    bins: ["622106", "639194"],
    gradient: "from-purple-500/30 via-fuchsia-700/20 to-zinc-950",
    accentHex: "#A855F7",
    badgeText: "بانک پارسیان",
    shebaCode: "054",
  },
  {
    id: "tejarat",
    nameFa: "بانک تجارت",
    nameEn: "Bank Tejarat",
    bins: ["585983", "627353"],
    gradient: "from-indigo-500/35 via-blue-800/25 to-zinc-950",
    accentHex: "#6366F1",
    badgeText: "بانک تجارت",
    shebaCode: "018",
  },
  {
    id: "saderat",
    nameFa: "بانک صادرات ایران",
    nameEn: "Bank Saderat",
    bins: ["603769"],
    gradient: "from-blue-600/35 via-indigo-900/25 to-zinc-950",
    accentHex: "#3B82F6",
    badgeText: "بانک صادرات",
    shebaCode: "019",
  },
  {
    id: "keshavarzi",
    nameFa: "بانک کشاورزی",
    nameEn: "Bank Keshavarzi",
    bins: ["603770", "639217"],
    gradient: "from-emerald-600/35 via-amber-700/20 to-zinc-950",
    accentHex: "#34D399",
    badgeText: "بانک کشاورزی",
    shebaCode: "016",
  },
  {
    id: "sepah",
    nameFa: "بانک سپه",
    nameEn: "Bank Sepah",
    bins: ["589210"],
    gradient: "from-orange-500/35 via-amber-800/25 to-zinc-950",
    accentHex: "#FB923C",
    badgeText: "نخستین بانک ایرانی",
    shebaCode: "015",
  },
  {
    id: "maskan",
    nameFa: "بانک مسکن",
    nameEn: "Bank Maskan",
    bins: ["628023"],
    gradient: "from-amber-600/35 via-orange-900/25 to-zinc-950",
    accentHex: "#F97316",
    badgeText: "بانک مسکن",
    shebaCode: "014",
  },
  {
    id: "refah",
    nameFa: "بانک رفاه کارگران",
    nameEn: "Refah Bank",
    bins: ["589463"],
    gradient: "from-cyan-600/35 via-indigo-900/25 to-zinc-950",
    accentHex: "#22D3EE",
    badgeText: "بانک رفاه",
    shebaCode: "013",
  },
  {
    id: "ayandeh",
    nameFa: "بانک آینده",
    nameEn: "Ayandeh Bank",
    bins: ["636214"],
    gradient: "from-amber-500/30 via-teal-800/25 to-zinc-950",
    accentHex: "#FBBF24",
    badgeText: "بانک آینده",
    shebaCode: "062",
  },
  {
    id: "karafarin",
    nameFa: "بانک کارآفرین",
    nameEn: "Karafarin Bank",
    bins: ["627488", "502910"],
    gradient: "from-teal-500/35 via-emerald-900/25 to-zinc-950",
    accentHex: "#14B8A6",
    badgeText: "بانک کارآفرین",
    shebaCode: "053",
  },
  {
    id: "sina",
    nameFa: "بانک سینا",
    nameEn: "Sina Bank",
    bins: ["639346"],
    gradient: "from-sky-600/35 via-amber-700/20 to-zinc-950",
    accentHex: "#38BDF8",
    badgeText: "بانک سینا",
    shebaCode: "059",
  },
  {
    id: "gardeshgari",
    nameFa: "بانک گردشگری",
    nameEn: "Tourism Bank",
    bins: ["505416"],
    gradient: "from-rose-600/35 via-slate-900 to-zinc-950",
    accentHex: "#FB7185",
    badgeText: "بانک گردشگری",
    shebaCode: "064",
  },
  {
    id: "shahr",
    nameFa: "بانک شهر",
    nameEn: "Shahr Bank",
    bins: ["502806", "504706"],
    gradient: "from-rose-500/35 via-indigo-900/25 to-zinc-950",
    accentHex: "#F43F5E",
    badgeText: "بانک شهر",
    shebaCode: "061",
  },
  {
    id: "resalat",
    nameFa: "بانک قرض‌الحسنه رسالت",
    nameEn: "Resalat Bank",
    bins: ["504172"],
    gradient: "from-cyan-500/35 via-teal-900/25 to-zinc-950",
    accentHex: "#06B6D4",
    badgeText: "بانکداری اجتماعی",
    shebaCode: "070",
  },
];

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)] ?? d);
}

export function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

export function detectIranianBank(cardInput: string): IranianBankTheme {
  const digits = toEnglishDigits(cardInput).replace(/\D/g, "");
  for (const bank of IRANIAN_BANKS) {
    for (const bin of bank.bins) {
      if (digits.startsWith(bin)) {
        return bank;
      }
    }
  }
  return IRANIAN_BANKS[0];
}

export function formatCardNumberFa(cardInput: string): string {
  const clean = toEnglishDigits(cardInput).replace(/\D/g, "").slice(0, 16);
  const padded = clean.padEnd(16, "•");
  const groups = padded.match(/.{1,4}/g) || [];
  return toPersianDigits(groups.join("  "));
}

export function validateShetabLuhn(cardInput: string): boolean {
  const digits = toEnglishDigits(cardInput).replace(/\D/g, "");
  if (digits.length !== 16) return false;
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    let d = Number(digits[i]);
    if (i % 2 === 0) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

/**
 * Iranian National Code (کد ملی) Modulo-11 Validator
 */
export function validateIranianNationalCode(input: string): {
  valid: boolean;
  cityFa: string;
} {
  const code = toEnglishDigits(input).replace(/\D/g, "");
  if (code.length !== 10 || /^(\d)\1{9}$/.test(code)) {
    return { valid: false, cityFa: "نامعتبر" };
  }
  const check = Number(code[9]);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(code[i]) * (10 - i);
  }
  const rem = sum % 11;
  const valid = (rem < 2 && check === rem) || (rem >= 2 && check === 11 - rem);

  const prefix = code.slice(0, 3);
  const cityMap: Record<string, string> = {
    "001": "تهران مرکزی",
    "002": "تهران",
    "003": "تهران",
    "004": "تهران",
    "005": "تهران",
    "006": "تهران",
    "007": "تهران",
    "008": "تهران",
    "127": "اصفهان",
    "128": "اصفهان",
    "228": "شیراز",
    "229": "شیراز",
    "136": "تبریز",
    "137": "تبریز",
    "092": "مشهد",
    "093": "مشهد",
    "094": "مشهد",
  };
  return {
    valid,
    cityFa: cityMap[prefix] || "حوزه ثبت احوال ایران",
  };
}

/**
 * Iranian Sheba (IBAN) ISO-7064 Modulo-97 Validator & Generator
 */
export function generateShebaFromCard(cardInput: string): string {
  const bank = detectIranianBank(cardInput);
  const digits = toEnglishDigits(cardInput)
    .replace(/\D/g, "")
    .padEnd(16, "0")
    .slice(0, 16);
  const bban = `${bank.shebaCode}01000${digits}`; // 22 digits
  // Compute ISO 7064 Mod-97 for IR (I=18, R=27 -> 182700)
  const numericStr = `${bban}182700`;
  let remainder = 0;
  for (let i = 0; i < numericStr.length; i++) {
    remainder = (remainder * 10 + Number(numericStr[i])) % 97;
  }
  const checkDigits = String(98 - remainder).padStart(2, "0");
  return `IR${checkDigits}${bban}`;
}

/**
 * Convert Number to Fluent Persian Words (تبدیل عدد به حروف فارسی)
 */
const ONES = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
const TEENS = [
  "ده",
  "یازده",
  "دوازده",
  "سیزده",
  "چهارده",
  "پانزده",
  "شانزده",
  "هفده",
  "هجده",
  "نوزده",
];
const TENS = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const HUNDREDS = [
  "",
  "صد",
  "دویست",
  "سیصد",
  "چهارصد",
  "پانصد",
  "ششصد",
  "هفتصد",
  "هشتصد",
  "نهصد",
];
const SCALES = ["", "هزار", "میلیون", "میلیارد", "همت (هزار میلیارد)"];

function threeDigitsToFa(n: number): string {
  if (n === 0) return "";
  const h = Math.floor(n / 100);
  const rem = n % 100;
  const parts: string[] = [];
  if (h > 0) parts.push(HUNDREDS[h]);
  if (rem >= 10 && rem < 20) {
    parts.push(TEENS[rem - 10]);
  } else {
    const t = Math.floor(rem / 10);
    const o = rem % 10;
    if (t > 0) parts.push(TENS[t]);
    if (o > 0) parts.push(ONES[o]);
  }
  return parts.join(" و ");
}

export function numberToPersianWords(input: string | number): string {
  const clean = toEnglishDigits(String(input)).replace(/\D/g, "").slice(0, 15);
  if (!clean || Number(clean) === 0) return "صفر تومان";
  let num = Number(clean);
  const groups: string[] = [];
  let scaleIdx = 0;
  while (num > 0 && scaleIdx < SCALES.length) {
    const chunk = num % 1000;
    if (chunk > 0) {
      const words = threeDigitsToFa(chunk);
      const scale = SCALES[scaleIdx];
      groups.unshift(scale ? `${words} ${scale}` : words);
    }
    num = Math.floor(num / 1000);
    scaleIdx++;
  }
  return `${groups.join(" و ")} تومان`;
}

/**
 * Persian Text ZWNJ & Orthography Cleanup Engine (Port of toolkit/05-qa-and-bug-hunters/fa_lint.py)
 */
export function cleanupPersianText(raw: string): {
  cleaned: string;
  fixesCount: number;
} {
  let fixesCount = 0;
  let text = raw;

  // 1. Replace Arabic Yeh/Kaf with standard Persian
  const arabicMatches = text.match(/[يك]/g);
  if (arabicMatches) fixesCount += arabicMatches.length;
  text = text.replace(/ي/g, "ی").replace(/ك/g, "ک");

  // 2. Insert ZWNJ (\u200C) after می / نمی before verbs
  text = text.replace(/\b(ن?می)\s+([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]+)/g, (_, p1, p2) => {
    fixesCount++;
    return `${p1}\u200C${p2}`;
  });

  // 3. Insert ZWNJ before plural ها / های and comparative تر / ترین
  text = text.replace(/([آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی])\s+(های?|ترین?)\b/g, (_, w, suf) => {
    fixesCount++;
    return `${w}\u200C${suf}`;
  });

  // 4. Convert English digits to Persian digits
  text = text.replace(/\d/g, (d) => {
    fixesCount++;
    return PERSIAN_DIGITS[Number(d)] ?? d;
  });

  return { cleaned: text, fixesCount };
}

/**
 * ZWNJ-Safe Persian Kinetic Word Splitter
 */
export function splitPersianWordsSafe(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export interface AuditIssue {
  id: string;
  severity: "critical" | "warning";
  titleFa: string;
  rule: string;
  match: string;
  fixFa: string;
}

export function auditRtlMotionCode(code: string): {
  issues: AuditIssue[];
  fixedCode: string;
  score: number;
} {
  const issues: AuditIssue[] = [];
  let fixedCode = code;

  if (/\b(ml|mr|pl|pr)-\d+/.test(code)) {
    issues.push({
      id: "logical-spacing",
      severity: "critical",
      titleFa: "استفاده از کلاس‌های فاصله‌گذاری فیزیکی LTR (ml/mr/pl/pr)",
      rule: "CSS Logical Properties",
      match: (code.match(/\b(ml|mr|pl|pr)-\d+/) || [""])[0],
      fixFa: "تبدیل خودکار به کلاس‌های منطقی دوجهته (ms-* / me-* / ps-* / pe-*)",
    });
    fixedCode = fixedCode
      .replace(/\bml-(\d+)/g, "ms-$1")
      .replace(/\bmr-(\d+)/g, "me-$1")
      .replace(/\bpl-(\d+)/g, "ps-$1")
      .replace(/\bpr-(\d+)/g, "pe-$1");
  }

  if (/\b(left|right)-\d+|\btext-(left|right)\b/.test(code)) {
    issues.push({
      id: "logical-position",
      severity: "critical",
      titleFa: "مختصات فیزیکی چپ/راست (left/right) که در حالت RTL معکوس نمی‌شود",
      rule: "RTL Directional Mirroring",
      match: (code.match(/\b(left|right)-\d+|\btext-(left|right)\b/) || [""])[0],
      fixFa: "تبدیل به start-* / end-* و text-start / text-end",
    });
    fixedCode = fixedCode
      .replace(/\bleft-(\d+)/g, "start-$1")
      .replace(/\bright-(\d+)/g, "end-$1")
      .replace(/\btext-left\b/g, "text-start")
      .replace(/\btext-right\b/g, "text-end");
  }

  if (/\.split\(\s*["']['"]\s*\)/.test(code)) {
    issues.push({
      id: "persian-ligature-break",
      severity: "critical",
      titleFa: "شکستن حروف فارسی با split('') — قطع شدن اتصال حروف و نیم‌فاصله!",
      rule: "Persian Script Integrity",
      match: '.split("")',
      fixFa: "تبدیل به split(/\\s+/) برای حفظ اتصال حروف فارسی و نیم‌فاصله (ZWNJ)",
    });
    fixedCode = fixedCode.replace(/\.split\(\s*["']['"]\s*\)/g, ".split(/\\s+/)");
  }

  if (/\btracking-(wide|wider|widest)\b/.test(code)) {
    issues.push({
      id: "persian-tracking",
      severity: "warning",
      titleFa: "فاصله انداختن بین حروف فارسی (tracking-widest) که خط فارسی را گسسته می‌کند",
      rule: "Persian Typography Standard",
      match: (code.match(/\btracking-(wide|wider|widest)\b/) || [""])[0],
      fixFa: "تبدیل به tracking-normal (letter-spacing: 0)",
    });
    fixedCode = fixedCode.replace(/\btracking-(wide|wider|widest)\b/g, "tracking-normal");
  }

  if (/animate=\{\{\s*(width|height|top|left)\s*:/.test(code)) {
    issues.push({
      id: "gpu-compositor-60fps",
      severity: "critical",
      titleFa: "انیمیت کردن ویژگی‌های Layout (width/top/left) و افت فریم به زیر ۳۰fps",
      rule: "60fps GPU Compositor Rule",
      match: (code.match(/animate=\{\{\s*(width|height|top|left)\s*:/) || [""])[0],
      fixFa: "جایگزینی با تبدیل‌های سخت‌افزاری GPU (scaleX, x, y, opacity)",
    });
    fixedCode = fixedCode.replace(
      /animate=\{\{\s*left\s*:\s*([^}]+)\}\}/g,
      "animate={{ x: $1 }}"
    );
  }

  /* ---------------------------------------------------------------- bauteil 2
     قواعد تکمیلی دوجهته: هرکدام یک باگ واقعی در رابط فارسی است. */

  if (/\bspace-[xy]-\d+/.test(code)) {
    issues.push({
      id: "space-utilities",
      severity: "warning",
      titleFa: "کلاس‌های space-x/space-y در RTL ترتیب فرزندان را برعکس می‌کنند",
      rule: "Flex Gap Over Space Utilities",
      match: (code.match(/\bspace-[xy]-\d+/) || [""])[0],
      fixFa: "جایگزینی با gap-* که در هر دو جهت درست کار می‌کند",
    });
    fixedCode = fixedCode.replace(/\bspace-x-(\d+)/g, "gap-x-$1").replace(/\bspace-y-(\d+)/g, "gap-y-$1");
  }

  if (/\b(border|rounded)-[lr](-|\b)/.test(code)) {
    issues.push({
      id: "logical-corners",
      severity: "critical",
      titleFa: "لبه و گوشه فیزیکی (border-l/r، rounded-l/r) در RTL آینه نمی‌شود",
      rule: "Logical Border & Radius",
      match: (code.match(/\b(border|rounded)-[lr](-[a-z0-9]+)?/) || [""])[0],
      fixFa: "تبدیل به border-s/e و rounded-s/e",
    });
    fixedCode = fixedCode
      .replace(/\bborder-l(?![a-z-])/g, "border-s")
      .replace(/\bborder-r(?![a-z-])/g, "border-e")
      .replace(/\brounded-l(?=[-\s"'`]|$)/g, "rounded-s")
      .replace(/\brounded-r(?=[-\s"'`]|$)/g, "rounded-e");
  }

  if (/text-transform\s*:\s*uppercase|\buppercase\b/.test(code)) {
    issues.push({
      id: "persian-uppercase",
      severity: "warning",
      titleFa: "uppercase روی متن فارسی هیچ اثری ندارد جز شکستن تأکید طراحی",
      rule: "Persian Case Rules",
      match: "uppercase",
      fixFa: "حذف uppercase و استفاده از وزن/اندازه برای تأکید",
    });
    fixedCode = fixedCode
      .replace(/\s*\buppercase\b/g, "")
      .replace(/text-transform\s*:\s*uppercase;?/g, "text-transform: none;");
  }

  if (/\b(dir|direction)\s*[:=]\s*["']?ltr/.test(code)) {
    issues.push({
      id: "hardcoded-ltr",
      severity: "warning",
      titleFa: "قفل‌کردن جهت ltr روی بلوک متنی؛ در حالت راست‌به‌چپ می‌شکند",
      rule: "Direction Inheritance",
      match: (code.match(/\b(dir|direction)\s*[:=]\s*["']?ltr/) || [""])[0],
      fixFa: "جهت را به ریشه بسپارید و فقط برای اعداد/کد از dir=\"ltr\" استفاده کنید",
    });
    fixedCode = fixedCode
      .replace(/\s+dir\s*=\s*(["'])ltr\1/g, "")
      .replace(/\s+style\{\{\s*\{\s*direction\s*:\s*(["'])ltr\1\s*\}\s*\}\}/g, "")
      .replace(/direction\s*:\s*ltr;?/g, "direction: rtl;");
  }

  if (/>[^<>{}]*\d[^<>{}]*</.test(code) && !/faNum|toLocaleString\(["']fa/.test(code)) {
    issues.push({
      id: "latin-digits",
      severity: "warning",
      titleFa: "ارقام لاتین داخل متن فارسی بدون تبدیل به عدد فارسی",
      rule: "Persian Numerals",
      match: (code.match(/>[^<>{}]*\d[^<>{}]*</) || [""])[0].slice(0, 40),
      fixFa: "عبور اعداد از faNum() یا Intl.NumberFormat('fa-IR')",
    });
    const toFa = (d: string) => d.replace(/[0-9]/g, (c) => "۰۱۲۳۴۵۶۷۸۹"[Number(c)]);
    fixedCode = fixedCode.replace(/>([^<>{}]*)</g, (whole, inner: string) =>
      /[آ-ی]/.test(inner) && /[0-9]/.test(inner) ? `>${toFa(inner)}<` : whole
    );
  }

  if (/(?:^|[\s>"'`])(می|نمی)\s+[آ-ی]/.test(code)) {
    issues.push({
      id: "missing-zwnj",
      severity: "critical",
      titleFa: "نیم‌فاصله جا افتاده: «می خواهم» به‌جای «می‌خواهم»",
      rule: "Persian Half-Space (ZWNJ)",
      match: (code.match(/(?:^|[\s>"'`])(می|نمی)\s+[آ-ی]+/) || [""])[0].trim(),
      fixFa: "درج نیم‌فاصله \u200C بین پیشوند و فعل",
    });
    fixedCode = fixedCode.replace(/(^|[\s>"'`])(ن?می)\s+([آ-ی]+)/g, "$1$2\u200C$3");
  }

  if (/[يك]/.test(code)) {
    issues.push({
      id: "arabic-characters",
      severity: "critical",
      titleFa: "حروف عربی (ي/ك) به‌جای ی/ک فارسی؛ فونت فارسی این گلیف‌ها را ندارد",
      rule: "Persian Character Set",
      match: (code.match(/[يك]/) || [""])[0],
      fixFa: "جایگزینی با ی و ک فارسی",
    });
    fixedCode = fixedCode.replace(/ي/g, "ی").replace(/ك/g, "ک");
  }

  if (/letter-spacing\s*:\s*[0-9.]+(px|em|rem)/.test(code) && !/letter-spacing\s*:\s*0/.test(code)) {
    issues.push({
      id: "letter-spacing",
      severity: "warning",
      titleFa: "letter-spacing مثبت اتصال حروف فارسی را می‌شکند",
      rule: "Persian Letter Spacing",
      match: (code.match(/letter-spacing\s*:\s*[0-9.]+(px|em|rem)/) || [""])[0],
      fixFa: "letter-spacing: 0 برای فارسی",
    });
    fixedCode = fixedCode.replace(
      /letter-spacing\s*:\s*[0-9.]+(px|em|rem)/g,
      "letter-spacing: 0"
    );
  }

  if (/(Arrow(Left|Right)|Chevron(Left|Right)|MoveRight|MoveLeft)/.test(code) && !/rtl:|rotate-180|scale-x-\[-1/.test(code)) {
    issues.push({
      id: "icon-mirror",
      severity: "warning",
      titleFa: "آیکون جهت‌دار بدون آینه‌سازی در RTL",
      rule: "Directional Icon Mirroring",
      match: (code.match(/(Arrow(Left|Right)|Chevron(Left|Right)|MoveRight|MoveLeft)/) || [""])[0],
      fixFa: "افزودن rtl:-scale-x-100 یا rtl:rotate-180 به آیکون",
    });
    fixedCode = fixedCode.replace(
      /<(Arrow(?:Left|Right|UpRight)|Chevron(?:Left|Right)|Move(?:Right|Left))\b([^>]*?)className=(["'])([^"']*)\3/g,
      (_m, tag: string, pre: string, q: string, cls: string) =>
        `<${tag}${pre}className=${q}rtl:-scale-x-100 ${cls}${q}`
    );
  }

  if (/animate=\{\{\s*(margin|padding|fontSize)/.test(code)) {
    issues.push({
      id: "layout-animation-2",
      severity: "critical",
      titleFa: "انیمیت‌کردن margin/padding با فریم‌ریت ۶۰ جور درنمی‌آید",
      rule: "60fps GPU Compositor Rule",
      match: (code.match(/animate=\{\{\s*(margin|padding|fontSize)/) || [""])[0],
      fixFa: "استفاده از scale/translate/opacity روی لایه GPU",
    });
  }

  if (/grid-cols-\d/.test(code) && !/dir=|start|end/.test(code) && /text-(left|right)/.test(code)) {
    issues.push({
      id: "grid-direction",
      severity: "warning",
      titleFa: "گرید با جهت متن فیزیکی ترکیب شده است",
      rule: "Grid & Writing Mode",
      match: (code.match(/grid-cols-\d+/) || [""])[0],
      fixFa: "برای گرید از کلاس‌های منطقی و text-start/end استفاده کنید",
    });
  }

  const critical = issues.filter((i) => i.severity === "critical").length;
  const score = Math.max(100 - critical * 14 - (issues.length - critical) * 7, 8);
  return { issues, fixedCode, score };
}

/**
 * ممیزی متن فارسی (نه کد): نیم‌فاصله، حروف عربی، فاصله‌گذاری علائم و ارقام.
 * برای پرامپت‌ها، توضیحات محصول و محتوای استودیوها استفاده می‌شود.
 */
export function auditPersianCopy(input: string): {
  issues: { id: string; titleFa: string; sample: string; fixFa: string }[];
  cleaned: string;
  score: number;
} {
  const issues: { id: string; titleFa: string; sample: string; fixFa: string }[] = [];
  let text = input;

  const arabic = text.match(/[يك]/g);
  if (arabic) {
    issues.push({
      id: "copy-arabic",
      titleFa: `${arabic.length} حرف عربی (ي/ك)`,
      sample: "يك",
      fixFa: "تبدیل به ی/ک فارسی",
    });
    text = text.replace(/ي/g, "ی").replace(/ك/g, "ک");
  }

  const looseMi = text.match(/(^|\s)(ن?می)\s+[آ-ی]/g);
  if (looseMi) {
    issues.push({
      id: "copy-zwnj",
      titleFa: `${looseMi.length} نیم‌فاصله جاافتاده (می خواهم)`,
      sample: looseMi[0].trim(),
      fixFa: "می‌خواهم، نمی‌شود، …",
    });
    text = text.replace(/(^|\s)(ن?می)\s+([آ-ی]+)/g, "$1$2\u200C$3");
  }

  if (/\s+[،؛.!؟:]/g.test(text)) {
    issues.push({
      id: "copy-punct",
      titleFa: "فاصله قبل از علامت نگارشی",
      sample: "… ،",
      fixFa: "علامت به کلمه قبلی می‌چسبد",
    });
    text = text.replace(/\s+([،؛.!؟:])/g, "$1");
  }

  if (/[a-z]/i.test(text) && /[آ-ی]/.test(text)) {
    const latinRun = text.match(/[A-Za-z]{3,}/);
    if (latinRun) {
      issues.push({
        id: "copy-bidi",
        titleFa: "متن لاتین داخل جمله فارسی بدون ایزوله‌سازی",
        sample: latinRun[0],
        fixFa: 'دور واژه لاتین از <bdi dir="ltr"> یا dir="ltr" استفاده کنید',
      });
    }
  }

  const latinDigits = text.match(/\d/g);
  if (latinDigits) {
    issues.push({
      id: "copy-digits",
      titleFa: `${latinDigits.length} رقم لاتین`,
      sample: "1234",
      fixFa: "اعداد فارسی برای متن نمایشی",
    });
  }

  const score = Math.max(0, 100 - issues.length * 16);
  return { issues, cleaned: text, score };
}

export interface StudioPhysicsConfig {
  stiffness: number;
  damping: number;
  mass: number;
  tiltAngle: number;
  scale: number;
  dir: "rtl" | "ltr";
  fontFamily: string;
  accentName: "firoozeh" | "lapis" | "saffron" | "emerald" | "crimson";
}

export const ACCENT_PALETTES: Record<
  StudioPhysicsConfig["accentName"],
  { labelFa: string; hex: string; ring: string; bg: string; text: string; gradient: string }
> = {
  firoozeh: {
    labelFa: "فیروزه‌ای نیشابور",
    hex: "#06B6D4",
    ring: "ring-cyan-500/40",
    bg: "bg-cyan-500",
    text: "text-cyan-400",
    gradient: "from-cyan-500/25 via-sky-500/10 to-transparent",
  },
  lapis: {
    labelFa: "لاجوردی کاشان",
    hex: "#6366F1",
    ring: "ring-indigo-500/40",
    bg: "bg-indigo-500",
    text: "text-indigo-400",
    gradient: "from-indigo-500/25 via-violet-500/10 to-transparent",
  },
  saffron: {
    labelFa: "طلایی زعفرانی",
    hex: "#F59E0B",
    ring: "ring-amber-500/40",
    bg: "bg-amber-500",
    text: "text-amber-400",
    gradient: "from-amber-500/25 via-orange-500/10 to-transparent",
  },
  emerald: {
    labelFa: "زمردی فین‌تک",
    hex: "#10B981",
    ring: "ring-emerald-500/40",
    bg: "bg-emerald-500",
    text: "text-emerald-400",
    gradient: "from-emerald-500/25 via-teal-500/10 to-transparent",
  },
  crimson: {
    labelFa: "یاقوتی",
    hex: "#F43F5E",
    ring: "ring-rose-500/40",
    bg: "bg-rose-500",
    text: "text-rose-400",
    gradient: "from-rose-500/25 via-pink-500/10 to-transparent",
  },
};

export function mutateComponentCode(
  baseCode: string,
  config: StudioPhysicsConfig
): string {
  const palette = ACCENT_PALETTES[config.accentName];
  return baseCode
    .replace(/stiffness:\s*\d+/g, `stiffness: ${config.stiffness}`)
    .replace(/damping:\s*\d+/g, `damping: ${config.damping}`)
    .replace(/mass:\s*[\d.]+/g, `mass: ${config.mass}`)
    .replace(/MAX_TILT\s*=\s*\d+/g, `MAX_TILT = ${config.tiltAngle}`)
    .replace(/whileHover=\{\{\s*scale:\s*[\d.]+/g, `whileHover={{ scale: ${config.scale}`)
    .replace(/dir=["'](rtl|ltr)["']/g, `dir="${config.dir}"`)
    .replace(/#6366F1|#06B6D4|#F59E0B|#10B981/g, palette.hex);
}
