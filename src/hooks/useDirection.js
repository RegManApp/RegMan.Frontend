import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const useDirection = () => {
  const { i18n } = useTranslation();

  return useMemo(() => {
    const lng = i18n.language || "en";
    const isRtl = String(lng).toLowerCase().startsWith("ar");
    return { isRtl, dir: isRtl ? "rtl" : "ltr", lang: isRtl ? "ar" : "en" };
  }, [i18n.language]);
};

export default useDirection;
