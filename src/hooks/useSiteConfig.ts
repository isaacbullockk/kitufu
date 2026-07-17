import { useMemo } from "react";
import { trpc } from "../providers/trpc";

export interface SiteConfig {
  brandName: string;
  brandTagline: string;
  primaryColor: string;
  secondaryColor: string;
  eventName: string;
  eventYear: string;
  eventDates: string;
  currencyCode: string;
  currencySymbol: string;
  countryName: string;
  supportEmail: string;
  supportPhone: string;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  metaTitle: string;
  metaDescription: string;
}

const DEFAULTS: SiteConfig = {
  brandName: "Kitufu Residences",
  brandTagline: "The Correct Way to Stay",
  primaryColor: "#E85D04",
  secondaryColor: "#2D6A4F",
  eventName: "AFCON 2027",
  eventYear: "2027",
  eventDates: "June – July 2027",
  currencyCode: "UGX",
  currencySymbol: "USh",
  countryName: "Uganda",
  supportEmail: "hello@kitufu.com",
  supportPhone: "+256 772 123 456",
  facebookUrl: "",
  twitterUrl: "",
  instagramUrl: "",
  metaTitle: "Kitufu Residences — AFCON 2027 Accommodation",
  metaDescription: "Book verified fan residences for AFCON 2027 in Uganda.",
};

export function useSiteConfig(): SiteConfig {
  const { data } = trpc.config.getAll.useQuery();

  return useMemo(() => {
    if (!data) return DEFAULTS;
    return {
      brandName: data.brandName || DEFAULTS.brandName,
      brandTagline: data.brandTagline || DEFAULTS.brandTagline,
      primaryColor: data.primaryColor || DEFAULTS.primaryColor,
      secondaryColor: data.secondaryColor || DEFAULTS.secondaryColor,
      eventName: data.eventName || DEFAULTS.eventName,
      eventYear: data.eventYear || DEFAULTS.eventYear,
      eventDates: data.eventDates || DEFAULTS.eventDates,
      currencyCode: data.currencyCode || DEFAULTS.currencyCode,
      currencySymbol: data.currencySymbol || DEFAULTS.currencySymbol,
      countryName: data.countryName || DEFAULTS.countryName,
      supportEmail: data.supportEmail || DEFAULTS.supportEmail,
      supportPhone: data.supportPhone || DEFAULTS.supportPhone,
      facebookUrl: data.facebookUrl || DEFAULTS.facebookUrl,
      twitterUrl: data.twitterUrl || DEFAULTS.twitterUrl,
      instagramUrl: data.instagramUrl || DEFAULTS.instagramUrl,
      metaTitle: data.metaTitle || DEFAULTS.metaTitle,
      metaDescription: data.metaDescription || DEFAULTS.metaDescription,
    };
  }, [data]);
}
