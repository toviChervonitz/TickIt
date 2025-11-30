import { sanitizeFilter } from "mongoose";
import en from "../locales/en.json";
import he from "../locales/he.json";

type Translations = typeof en; // ensures both en & he have the same keys

export const getTranslation = (lang: "en" | "he") => (key: keyof Translations): string => {
  const t = lang === "he" ? (he as unknown as Translations) : (en as unknown as Translations);
  return (t[key] as string) || key;
};

