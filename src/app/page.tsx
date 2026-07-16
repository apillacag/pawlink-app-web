import Link from "next/link"
import { PawPrint, Shield, MapPin, Star, Heart, Users, ArrowRight, CheckCircle, Search, Calendar, Camera } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { getServerTranslations } from "@/i18n/server"

export default async function HomePage() {
  const { t } = await getServerTranslations()

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-amber-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700">
                <Heart className="h-4 w-4" />
                {t("home.heroBadge")}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {t("home.heroTitle")}{" "}
                <span className="text-emerald-600">{t("home.heroTitleHighlight")}</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-xl">{t("home.heroSubtitle")}</p>
              <div className="flex flex-wrap gap-4">
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    {t("home.getStarted")} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/walkers">
                  <Button variant="outline" size="lg">{t("home.findWalker")}</Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> {t("home.verifiedProfessionals")}</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> {t("home.gpsTracking")}</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" /> {t("home.247Support")}</span>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="/images/hero-dog-walking.jpg"
                  alt="Dog walking in a sunny park"
                  className="w-full h-full object-cover rounded-2xl"
                  style={{ maxHeight: "520px", minHeight: "400px" }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center">
                      <PawPrint className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-white font-medium text-sm">{t("home.heroCardTitle")} &mdash; {t("home.heroCardSubtitle")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-emerald-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t("tutorial.title")}</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t("tutorial.desc")}</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl bg-black">
              <iframe
                src="https://www.youtube.com/embed/kL4MA8GpjTs"
                title="PawLink Tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t("home.howItWorks")}</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t("home.howItWorksDesc")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: Search, title: t("home.step1Title"), desc: t("home.step1Desc") },
              { step: "02", icon: Calendar, title: t("home.step2Title"), desc: t("home.step2Desc") },
              { step: "03", icon: MapPin, title: t("home.step3Title"), desc: t("home.step3Desc") },
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                <span className="text-5xl font-bold text-emerald-100 absolute top-4 right-4">{item.step}</span>
                <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-5">
                  <item.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t("home.whyTitle")}</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t("home.whyDesc")}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: t("home.verifiedProfessionalsTitle"), desc: t("home.verifiedProfessionalsDesc") },
              { icon: MapPin, title: t("home.gpsTrackingTitle"), desc: t("home.gpsTrackingDesc") },
              { icon: Camera, title: t("home.photoUpdatesTitle"), desc: t("home.photoUpdatesDesc") },
              { icon: Star, title: t("home.trustedReviewsTitle"), desc: t("home.trustedReviewsDesc") },
              { icon: Heart, title: t("home.wellnessTitle"), desc: t("home.wellnessDesc") },
              { icon: Users, title: t("home.communityTitle"), desc: t("home.communityDesc") },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-white border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t("home.forProfessionalsTitle")}</h2>
              <p className="text-lg text-gray-600">{t("home.forProfessionalsDesc")}</p>
              <ul className="space-y-4">
                {[
                  t("home.profBenefits1"),
                  t("home.profBenefits2"),
                  t("home.profBenefits3"),
                  t("home.profBenefits4"),
                  t("home.profBenefits5"),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-4">
                <Link href="/register?role=WALKER">
                  <Button size="lg">{t("home.becomeWalker")}</Button>
                </Link>
                <Link href="/register?role=SPECIALIST">
                  <Button variant="outline" size="lg">{t("home.becomeSpecialist")}</Button>
                </Link>
              </div>
            </div>
            <div className="relative space-y-6">
              <div className="rounded-2xl overflow-hidden shadow-md">
                <img
                  src="/images/for-professionals.jpg"
                  alt="Happy pet owner with dog"
                  className="w-full h-56 object-cover"
                  loading="lazy"
                />
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-emerald-50 p-8 border border-amber-100">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">S/</div>
                    <div>
                      <p className="font-semibold text-gray-900">{t("home.earnUpTo")}</p>
                      <p className="text-3xl font-bold text-emerald-600">{t("home.earningsRate")}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {t("home.professionalsRateDesc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t("home.testimonialsTitle")}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: t("home.testimonial1Quote"),
                author: t("home.testimonial1Author"),
                role: t("home.testimonial1Role"),
                rating: 5,
                avatar: "/images/testimonial-1.jpg",
              },
              {
                quote: t("home.testimonial2Quote"),
                author: t("home.testimonial2Author"),
                role: t("home.testimonial2Role"),
                rating: 5,
                avatar: "/images/testimonial-2.jpg",
              },
              {
                quote: t("home.testimonial3Quote"),
                author: t("home.testimonial3Author"),
                role: t("home.testimonial3Role"),
                rating: 5,
                avatar: "/images/testimonial-3.jpg",
              },
            ].map((tItem) => (
              <div key={tItem.author} className="rounded-xl bg-white border border-gray-200 p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: tItem.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">&ldquo;{tItem.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img
                    src={tItem.avatar}
                    alt={tItem.author}
                    className="h-10 w-10 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{tItem.author}</p>
                    <p className="text-sm text-gray-500">{tItem.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-emerald-600 to-emerald-700">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">{t("home.ctaTitle")}</h2>
          <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">{t("home.ctaDesc")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 gap-2">
                {t("home.ctaButton")} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/walkers">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-emerald-500">
                {t("home.findWalker")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
