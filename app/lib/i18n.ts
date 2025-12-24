import en from "../locales/en.json";
import he from "../locales/he.json";
import useAppStore from "../store/useAppStore";

type Translations = typeof en;

export const getTranslation = () => {
  const { language } = useAppStore();

  const t = (key: keyof Translations): string => {
    const translations: Translations = language === "he" ? (he as unknown as Translations) : (en as Translations);
    return (translations[key] as string) || key;
  };

  return t;
};
