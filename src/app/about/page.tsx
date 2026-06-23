"use client"
import { PawPrint, Shield, Heart, Target, Eye, Users } from "lucide-react"
import { useI18n } from "@/i18n/context"

export default function AboutPage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-medium text-emerald-700 mb-6">
            <Heart className="h-4 w-4" /> {t("about.title")}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            {t("about.heroTitle")} <span className="text-emerald-600">{t("about.heroTitleHighlight")}</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t("about.heroDesc")}</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{t("about.missionTitle")}</h2>
              <p className="text-gray-600 leading-relaxed">{t("about.missionDesc")}</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-emerald-600" />
                <h3 className="text-xl font-semibold text-gray-900">{t("about.visionTitle")}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{t("about.visionDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">{t("about.valuesTitle")}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: t("about.trustSafety"), desc: t("about.trustSafetyDesc") },
              { icon: Heart, title: t("about.petHappiness"), desc: t("about.petHappinessDesc") },
              { icon: Users, title: t("about.community"), desc: t("about.communityDesc") },
              { icon: Target, title: t("about.transparency"), desc: t("about.transparencyDesc") },
              { icon: Eye, title: t("about.innovation"), desc: t("about.innovationDesc") },
              { icon: PawPrint, title: t("about.responsibility"), desc: t("about.responsibilityDesc") },
            ].map((v) => (
              <div key={v.title} className="bg-white rounded-xl border border-gray-200 p-6">
                <v.icon className="h-8 w-8 text-emerald-600 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
