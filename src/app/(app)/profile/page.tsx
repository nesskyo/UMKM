"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabaseClient"
import type { Business, Profile } from "@/lib/types"
import { Mail, MapPin, Phone, Building2, Pencil, CheckCircle2, Save, X } from "@/components/ui/icons"

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [email, setEmail] = useState("")
  const [savedMessage, setSavedMessage] = useState("")

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      setEmail(user.email ?? "")

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
      setProfile((profileData as Profile) ?? null)

      const { data: businessData } = await supabase
        .from("businesses")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .single()
      setBusiness((businessData as Business) ?? null)
    }
    load()
  }, [router])

  const handleProfileChange = (field: keyof Profile, value: string) => {
    setProfile((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleBusinessChange = (field: keyof Business, value: string) => {
    setBusiness((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleSave = async () => {
    if (profile) {
      await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
        })
        .eq("id", profile.id)
    }

    if (business) {
      await supabase
        .from("businesses")
        .update({
          name: business.name,
          type: business.type,
          address: business.address,
          phone: business.phone,
          email: business.email,
        })
        .eq("id", business.id)
    }

    setIsEditing(false)
    setSavedMessage("Perubahan profil berhasil disimpan.")
    setTimeout(() => setSavedMessage(""), 2500)
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !profile) return

    const previewUrl = URL.createObjectURL(file)
    setProfile((prev) => (prev ? { ...prev, avatar_url: previewUrl } : prev))

    try {
      const filePath = `avatars/${profile.id}-${Date.now()}-${file.name}`
      await supabase.storage.from("avatars").upload(filePath, file)
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath)
      await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", profile.id)
      setProfile((prev) => (prev ? { ...prev, avatar_url: urlData.publicUrl } : prev))
    } catch (err) {
      console.error("Upload avatar gagal. Catatan: buat bucket 'avatars' di Supabase Storage.", err)
    }
  }

  if (!profile || !business) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <p className="text-muted text-sm">Memuat profil...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profil</h1>
          <p className="text-muted text-sm mt-1">
            Kelola informasi pemilik dan bisnis Anda.
          </p>
        </div>

        {!isEditing ? (
          <Button className="gap-2" onClick={() => setIsEditing(true)} type="button">
            <Pencil className="h-4 w-4" />
            Edit Profil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setIsEditing(false)} type="button">
              <X className="h-4 w-4" />
              Batal
            </Button>
            <Button className="gap-2" onClick={handleSave} type="button">
              <Save className="h-4 w-4" />
              Simpan
            </Button>
          </div>
        )}
      </div>

      {savedMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {savedMessage}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-primary/10">
                  {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name} />}
                  <AvatarFallback>{profile.full_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-sm hover:bg-primary/90">
                    <Pencil className="h-4 w-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{profile.full_name}</h2>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-muted">{business.name}</p>
                <p className="text-xs text-muted mt-1">Status akun aktif</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary">
              <CheckCircle2 className="h-4 w-4" />
              Verified owner
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Nama Lengkap</label>
                  <Input
                    value={profile.full_name}
                    onChange={(event) => handleProfileChange("full_name", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Email</label>
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-surface px-3">
                    <Mail className="h-4 w-4 text-muted" />
                    <Input disabled value={email} className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 opacity-60" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Nomor Telepon</label>
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-surface px-3">
                    <Phone className="h-4 w-4 text-muted" />
                    <Input
                      value={profile.phone ?? ""}
                      onChange={(event) => handleProfileChange("phone", event.target.value)}
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                      placeholder="+62..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Alamat</label>
                  <div className="flex items-start gap-2 rounded-md border border-gray-200 bg-surface px-3 py-2">
                    <MapPin className="mt-2 h-4 w-4 text-muted" />
                    <Input
                      value={profile.address ?? ""}
                      onChange={(event) => handleProfileChange("address", event.target.value)}
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                      placeholder="Jl. ..."
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Nama Lengkap</label>
                  <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium">
                    {profile.full_name}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Email</label>
                  <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                    {email}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Nomor Telepon</label>
                  <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                    {profile.phone || "-"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Alamat</label>
                  <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted" />
                    <span>{profile.address || "-"}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Bisnis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Nama Bisnis</label>
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-surface px-3">
                    <Building2 className="h-4 w-4 text-muted" />
                    <Input
                      value={business.name}
                      onChange={(event) => handleBusinessChange("name", event.target.value)}
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Jenis Usaha</label>
                  <Input
                    value={business.type ?? ""}
                    onChange={(event) => handleBusinessChange("type", event.target.value)}
                    placeholder="Coffee Shop"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Alamat Bisnis</label>
                  <div className="flex items-start gap-2 rounded-md border border-gray-200 bg-surface px-3 py-2">
                    <MapPin className="mt-2 h-4 w-4 text-muted" />
                    <Input
                      value={business.address ?? ""}
                      onChange={(event) => handleBusinessChange("address", event.target.value)}
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Kontak Bisnis</label>
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-surface px-3">
                    <Phone className="h-4 w-4 text-muted" />
                    <Input
                      value={business.phone ?? ""}
                      onChange={(event) => handleBusinessChange("phone", event.target.value)}
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Email Bisnis</label>
                  <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-surface px-3">
                    <Mail className="h-4 w-4 text-muted" />
                    <Input
                      value={business.email ?? ""}
                      onChange={(event) => handleBusinessChange("email", event.target.value)}
                      className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Nama Bisnis</label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted" />
                    <span>{business.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Jenis Usaha</label>
                  <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium">
                    {business.type || "-"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Alamat Bisnis</label>
                  <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 text-muted" />
                    <span>{business.address || "-"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Kontak Bisnis</label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                    <Phone className="h-4 w-4 text-muted" />
                    <span>{business.phone || "-"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted">Email Bisnis</label>
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                    <Mail className="h-4 w-4 text-muted" />
                    <span>{business.email || "-"}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}