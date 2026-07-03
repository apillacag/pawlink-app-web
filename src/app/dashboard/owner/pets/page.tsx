import { getServerTranslations } from "@/i18n/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Plus, Dog, Cat, Edit, Trash2 } from "lucide-react"

export default async function PetsPage() {
  const { t, locale } = await getServerTranslations()
  const user = await getCurrentUser()
  if (!user || user.role !== "OWNER") redirect("/dashboard")

  const pets = await prisma.pet.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{t("pets.title")}</h2>
        <Link href="/dashboard/owner/pets/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> {t("pets.addPet")}</Button>
        </Link>
      </div>

      {pets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Dog className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{t("pets.noPets")}</p>
            <Link href="/dashboard/owner/pets/new">
              <Button>{t("pets.addFirstPet")}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <Card key={pet.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      {pet.species === "CAT" ? (
                        <Cat className="h-6 w-6 text-emerald-600" />
                      ) : (
                        <Dog className="h-6 w-6 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                      <p className="text-sm text-gray-500">{pet.breed || t(`pets.${pet.species.toLowerCase()}`)}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-500">
                  {pet.age && <p>{t("pets.ageLabel")}: {pet.age} {t("pets.years")}</p>}
                  {pet.weight && <p>{t("pets.weightLabel")}: {pet.weight} {t("pets.kg")}</p>}
                </div>
                {pet.notes && (
                  <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{pet.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
