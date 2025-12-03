import { useLanguage } from "../context/LanguageContext";
import en from "../locales/en.json";
import he from "../locales/he.json";

type Translations = typeof en;

export const getTranslation = () => {
  const { lang } = useLanguage();

  const t = (key: keyof Translations): string => {
    // Type assertion ensures TS knows both en & he have the same keys
    const translations: Translations = lang === "he" ? (he as unknown as Translations) : (en as Translations);
    return (translations[key] as string) || key;
  };

  return t;
};
