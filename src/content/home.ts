// Structural data for the Accueil page — display strings live in i18n
// locale files (home.* keys) so the page stays fully translated (en/fr/ar),
// consistent with the rest of this app's i18n convention.

export type Decor = {
  slug: string;
  img: string;
  titleKey: string;
};

export const heroImages = {
  main: "/images/decors/prestige-walnut.jpg",
  accent: "/images/decors/walnova.jpg",
};

export const decors: Decor[] = [
  { slug: "prestige-walnut", img: "/images/decors/prestige-walnut.jpg", titleKey: "home.decors.prestigeWalnut" },
  { slug: "mocha-wood", img: "/images/decors/mocha-wood.jpg", titleKey: "home.decors.mochaWood" },
  { slug: "sereno-oak", img: "/images/decors/sereno-oak.jpg", titleKey: "home.decors.serenoOak" },
  { slug: "chene-vanillia", img: "/images/decors/chene-vanillia.jpg", titleKey: "home.decors.cheneVanillia" },
  { slug: "gris-moineau", img: "/images/decors/gris-moineau.jpg", titleKey: "home.decors.grisMoineau" },
  { slug: "japandi", img: "/images/decors/japandi.jpg", titleKey: "home.decors.japandi" },
];

export const strengthKeys = [
  "home.strengths.quality",
  "home.strengths.design",
  "home.strengths.durability",
  "home.strengths.service",
];
