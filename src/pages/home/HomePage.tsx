import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { decors, heroImages, strengthKeys } from "../../content/home";

export const HomePage = () => {
  const { t } = useTranslation();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="eyebrow mb-4">{t("home.hero.eyebrow")}</p>
            <h1 className="text-4xl leading-[1.1] text-ink sm:text-5xl md:text-6xl">
              {t("home.hero.titleLine1")}
              <br />
              <span className="italic text-brass">{t("home.hero.titleAccent")}</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-charcoal">{t("home.hero.intro")}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/catalog" className="btn-primary">
                {t("home.hero.ctaPrimary")}
              </Link>
              <Link to="/profile" className="btn-ghost">
                {t("home.hero.ctaSecondary")}
              </Link>
            </div>
          </div>
          <div className="relative">
            <div
              className="aspect-[4/5] w-full rounded-sm bg-cover bg-center shadow-xl"
              style={{ backgroundImage: `url(${heroImages.main})` }}
            />
            <div
              className="absolute -bottom-6 -left-6 hidden aspect-square w-40 rounded-sm border-4 border-ivory bg-cover bg-center shadow-lg md:block"
              style={{ backgroundImage: `url(${heroImages.accent})` }}
            />
          </div>
        </div>
      </section>

      {/* Strengths */}
      <section className="bg-ivory py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="eyebrow mb-4">{t("home.strengths.eyebrow")}</p>
          <h2 className="max-w-xl text-3xl text-ink sm:text-4xl">{t("home.strengths.title")}</h2>
          <ul className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {strengthKeys.map((key) => (
              <li key={key} className="flex items-start gap-3 text-charcoal">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Décors showcase */}
      <section className="bg-ink py-24 text-ivory">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="eyebrow mb-4">{t("home.decors.eyebrow")}</p>
          <h2 className="max-w-xl text-3xl sm:text-4xl">{t("home.decors.title")}</h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {decors.map((decor) => (
              <Link
                key={decor.slug}
                to="/catalog"
                className="group relative block aspect-[3/4] overflow-hidden rounded-sm bg-charcoal"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 group-hover:opacity-80"
                  style={{ backgroundImage: `url(${decor.img})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-serif text-xl text-ivory">{t(decor.titleKey)}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest2 text-brass opacity-0 transition-opacity group-hover:opacity-100">
                    {t("home.decors.discover")} →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brass py-16 text-ivory">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="max-w-lg text-2xl sm:text-3xl">{t("home.cta.title")}</h2>
          <Link to="/catalog" className="btn bg-ink text-ivory hover:bg-ivory hover:text-ink">
            {t("home.cta.action")}
          </Link>
        </div>
      </section>
    </>
  );
};
