"use client"

import Link from "next/link"
import { useState, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  themes,
  useAppearance,
} from "@/components/layout/appearance-provider"
import {
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  Eye,
  Sliders,
  AlertCircle,
  UserCircle2,
} from "@/components/ui/icons"

export default function SettingsPage() {
  const {
    theme,
    setTheme,
    background,
    uploadCustomBackground,
    updateOpacity,
    updateBlur,
    clearBackground,
  } = useAppearance()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (file: File) => {
    setUploadError(null)
    setIsUploading(true)
    try {
      await uploadCustomBackground(file)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengunggah gambar."
      setUploadError(message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-muted text-sm mt-1">
          Kelola tampilan, tema, dan preferensi aplikasi Anda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle2 className="h-5 w-5 text-primary" />
            Akun & Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted">
            Informasi pemilik dan bisnis dikelola di halaman profil agar lebih mudah diakses dan lebih rapi.
          </p>
          <Link href="/profile">
            <Button type="button" className="gap-2">
              <UserCircle2 className="h-4 w-4" />
              Buka Profil
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Tampilan & Latar Belakang
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Section 1: Themes */}
          <div>
            <p className="text-sm font-medium mb-3">Pilih Tema Warna Application</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {themes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                    theme === item.id
                      ? "border-primary ring-2 ring-primary/20 shadow-sm"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  aria-pressed={theme === item.id}
                >
                  <span
                    className="h-6 w-6 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: item.primary }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                  {theme === item.id && (
                    <Check className="h-4 w-4 text-primary ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Section 2: Custom Background */}
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold">Custom Background Image</h3>
              <p className="text-muted text-sm mt-1">
                Personalisasi tampilan dashboard, transaksi, dan halaman lainnya dengan foto
                atau pola pilihan Anda.
              </p>
            </div>

            {/* Upload Custom Image */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted mb-3 block">
                Unggah Gambar Sendiri
              </label>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-gray-300 hover:border-primary hover:bg-gray-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0])
                    }
                  }}
                />

                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {isUploading
                        ? "Memproses gambar..."
                        : "Klik atau seret file gambar ke sini"}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      Format didukung: PNG, JPG, WEBP, SVG (Maks. 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {uploadError && (
                <div className="mt-2 text-xs text-critical flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" />
                  {uploadError}
                </div>
              )}
            </div>

            {/* Sliders for Opacity and Blur */}
            {background.enabled && (
              <div className="space-y-5 bg-subtle p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Sliders className="h-4 w-4 text-primary" />
                  Penyesuaian Efek Latar Belakang
                </div>

                <div className="space-y-4">
                  {/* Opacity Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <label htmlFor="opacity-slider">Transparansi / Opasitas</label>
                      <span className="text-primary font-bold">
                        {Math.round(background.opacity * 100)}%
                      </span>
                    </div>
                    <input
                      id="opacity-slider"
                      type="range"
                      min="0.05"
                      max="0.60"
                      step="0.01"
                      value={background.opacity}
                      onChange={(e) => updateOpacity(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <p className="text-[11px] text-muted">
                      Mengatur seberapa jelas gambar latar belakang terlihat di balik kartu data.
                    </p>
                  </div>

                  {/* Blur Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <label htmlFor="blur-slider">Efek Buram (Blur)</label>
                      <span className="text-primary font-bold">{background.blur}px</span>
                    </div>
                    <input
                      id="blur-slider"
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={background.blur}
                      onChange={(e) => updateBlur(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <p className="text-[11px] text-muted">
                      Efek lembut agar gambar tidak mengganggu keterbacaan teks dan tabel.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Live Interactive Preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                <Eye className="h-4 w-4" />
                Pratinjau Keterbacaan Teks (Live Preview)
              </div>

              <div className="relative rounded-xl border border-gray-200 overflow-hidden p-6 min-h-[160px] flex items-center justify-center">
                {/* Embedded preview background */}
                <div
                  className="absolute inset-0 z-0 transition-all duration-300"
                  style={{
                    backgroundImage: background.enabled ? `url("${background.url}")` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: background.enabled ? background.opacity : 0,
                    filter: `blur(${background.blur}px)`,
                  }}
                />

                {/* Sample Card Overlaid */}
                <div className="relative z-10 w-full max-w-sm p-4 rounded-lg bg-surface border border-gray-200 shadow-md backdrop-blur-md space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-primary tracking-wide">
                      Sample Card UI
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success font-medium">
                      Aktif
                    </span>
                  </div>
                  <h4 className="text-base font-bold">Total Penjualan Hari Ini</h4>
                  <p className="text-xl font-extrabold text-foreground">Rp 1.450.000</p>
                  <p className="text-xs text-muted">
                    Pratinjau ini memastikan teks tetap terlihat sangat jelas & kontras.
                  </p>
                </div>
              </div>
            </div>

            {/* Reset / Remove Background Button */}
            {background.enabled && (
              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearBackground}
                  className="flex items-center gap-2 text-critical border-critical/20 hover:bg-critical/10"
                >
                  <RotateCcw className="h-4 w-4" />
                  Hapus / Reset Latar Belakang
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="pt-4">
        <Button variant="critical">Logout</Button>
      </div>
    </div>
  )
}
