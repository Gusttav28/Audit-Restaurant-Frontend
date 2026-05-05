"use client"

import { Mail, Shield, Store, User } from "lucide-react"
import Header from "@/components/layout/header"
import Sidebar from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppContext } from "@/components/app-context"

export default function ProfilePage() {
  const { selectedRestaurant, t } = useAppContext()
  const profile = {
    name: "John Smith",
    email: "john@restaurant.com",
    role: t("admin"),
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Header />
        <main className="space-y-6 p-4 sm:p-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t("profile")}</h1>
            <p className="mt-1 text-muted-foreground">{t("accountDetails")}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent">
                  <User size={36} className="text-accent-foreground" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-foreground">{profile.name}</h2>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <span className="mt-3 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                  {profile.role}
                </span>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>{t("accountDetails")}</CardTitle>
                <CardDescription>{selectedRestaurant.name}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <User size={16} className="text-primary" />
                    {t("memberName")}
                  </div>
                  <p className="font-semibold text-foreground">{profile.name}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail size={16} className="text-primary" />
                    {t("email")}
                  </div>
                  <p className="break-words font-semibold text-foreground">{profile.email}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield size={16} className="text-primary" />
                    {t("currentRole")}
                  </div>
                  <p className="font-semibold text-foreground">{profile.role}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/20 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Store size={16} className="text-primary" />
                    {t("currentRestaurant")}
                  </div>
                  <p className="font-semibold text-foreground">{selectedRestaurant.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedRestaurant.location}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
