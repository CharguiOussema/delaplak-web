import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { Spin } from "antd";
import { siteSettingsService } from "../../services/SiteSettingsService";
import { queryKeys } from "../../services/QueryClientManager";
import { useApp } from "../../hooks";
import { localize, imageUrl } from "../../utils/i18nText";
import { API_URL } from "../../constants";
import { heroImageFallback } from "../../content/home";

export const HomePage = () => {
  const { language } = useApp();

  const { data: settings, isLoading } = useQuery({
    queryKey: [queryKeys.SITE_SETTINGS],
    queryFn: () => siteSettingsService.get(),
  });

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center py-32">
        <Spin size="large" />
      </div>
    );
  }

  const heroMainImage = settings.hero.mainImage ? imageUrl(API_URL, settings.hero.mainImage) : heroImageFallback.main;
  const heroAccentImage = settings.hero.accentImage ? imageUrl(API_URL, settings.hero.accentImage) : heroImageFallback.accent;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="eyebrow mb-4">{localize(settings.hero.eyebrow, language)}</p>
            <h1 className="text-4xl leading-[1.1] text-ink sm:text-5xl md:text-6xl">
              {localize(settings.hero.titleLine1, language)}
              <br />
              <span className="italic text-brass">{localize(settings.hero.titleAccent, language)}</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-charcoal">{localize(settings.hero.intro, language)}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/catalog" className="btn-primary">
                {localize(settings.hero.ctaPrimaryLabel, language)}
              </Link>
              <Link to="/profile" className="btn-ghost">
                {localize(settings.hero.ctaSecondaryLabel, language)}
              </Link>
            </div>
          </div>
          <div className="relative">
            <div
              className="aspect-[4/5] w-full rounded-sm bg-cover bg-center shadow-xl"
              style={{ backgroundImage: `url(${heroMainImage})` }}
            />
            <div
              className="absolute -bottom-6 -left-6 hidden aspect-square w-40 rounded-sm border-4 border-ivory bg-cover bg-center shadow-lg md:block"
              style={{ backgroundImage: `url(${heroAccentImage})` }}
            />
          </div>
        </div>
      </section>

      {/* Strengths */}
      <section className="bg-ivory py-24">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="eyebrow mb-4">{localize(settings.strengthsSection.eyebrow, language)}</p>
          <h2 className="max-w-xl text-3xl text-ink sm:text-4xl">{localize(settings.strengthsSection.title, language)}</h2>
          <ul className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {settings.strengths.map((item) => (
              <li key={item._id} className="flex items-start gap-3 text-charcoal">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                {localize(item.text, language)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Décors showcase */}
      <section className="bg-ink py-24 text-ivory">
        <div className="mx-auto w-full max-w-6xl px-6">
          <p className="eyebrow mb-4">{localize(settings.decorsSection.eyebrow, language)}</p>
          <h2 className="max-w-xl text-3xl sm:text-4xl">{localize(settings.decorsSection.title, language)}</h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {settings.decors.map((decor) => (
              <Link
                key={decor._id}
                to="/catalog"
                className="group relative block aspect-[3/4] overflow-hidden rounded-sm bg-charcoal"
              >
                {decor.image ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 group-hover:opacity-80"
                    style={{ backgroundImage: `url(${imageUrl(API_URL, decor.image)})` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-charcoal" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="font-serif text-xl text-ivory">{localize(decor.title, language)}</p>
                  <p className="mt-1 text-xs uppercase tracking-widest2 text-brass opacity-0 transition-opacity group-hover:opacity-100">
                    {localize(settings.decorsSection.discoverLabel, language)} →
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
          <h2 className="max-w-lg text-2xl sm:text-3xl">{localize(settings.cta.title, language)}</h2>
          <Link to="/catalog" className="btn bg-ink text-ivory hover:bg-ivory hover:text-ink">
            {localize(settings.cta.actionLabel, language)}
          </Link>
        </div>
      </section>
    </>
  );
};
