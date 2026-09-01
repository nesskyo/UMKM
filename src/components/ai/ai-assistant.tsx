"use client"

import { useState, useRef, useEffect } from "react"
import { Sparkles, X, Send, User } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: React.ReactNode}[]>([
    { role: 'ai', content: "Halo, Andi! Saya UMKM Smart Advisor Anda. Ada yang bisa saya bantu terkait performa Kopi Senja hari ini?" }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping])

  const suggestedPrompts = [
    "Produk apa yang paling laku?",
    "Apakah saya perlu restock Kopi Susu?",
    "Bagaimana tren penjualan minggu ini?"
  ]

  const handleSend = (text: string) => {
    if (!text.trim()) return
    
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)
      
      let aiResponse: React.ReactNode = "Maaf, saya tidak mengerti. Bisa ditanyakan dengan cara lain?"
      
      const lower = text.toLowerCase();
      if (lower.includes("restock") || lower.includes("kopi susu")) {
        aiResponse = (
          <div className="space-y-3">
            <p>Berdasarkan histori penjualan 30 hari terakhir dan prediksi 7 hari ke depan, permintaan Kopi Susu diperkirakan meningkat 18%.</p>
            <div className="bg-surface border border-gray-100 p-3 rounded-lg text-sm grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted text-xs">Stok saat ini</p>
                <p className="font-bold text-foreground">12 unit</p>
              </div>
              <div>
                <p className="text-muted text-xs">Estimasi kebutuhan</p>
                <p className="font-bold text-foreground">35 unit</p>
              </div>
            </div>
            <div className="bg-primary/10 text-primary border border-primary/20 p-3 rounded-lg text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Rekomendasi: Tambah sekitar 25 unit
            </div>
          </div>
        )
      } else if (lower.includes("paling laku")) {
        aiResponse = "Produk paling laku adalah Kopi Susu dengan 428 unit terjual (menghasilkan Rp 8.560.000) dalam 30 hari terakhir."
      } else if (lower.includes("tren penjualan")) {
        aiResponse = "Tren penjualan Anda sangat positif! Pendapatan naik 12.8% dibanding bulan lalu, didorong oleh peningkatan pesat di akhir pekan."
      }

      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }])
    }, 1000)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 lg:bottom-6 right-4 lg:right-6 h-14 w-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-surface border-l border-gray-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="h-16 border-b border-gray-100 flex items-center justify-between px-4 bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">UMKM AI Assistant</h3>
                <p className="text-[10px] text-muted">Business intelligence advisor</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex gap-3 max-w-[90%]", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                <div className={cn("shrink-0 h-8 w-8 rounded-full flex items-center justify-center shadow-sm", msg.role === 'user' ? "bg-surface border border-gray-200 text-foreground" : "bg-primary text-white")}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>
                <div className={cn("rounded-2xl px-4 py-3 text-sm shadow-sm", msg.role === 'user' ? "bg-primary text-white rounded-tr-sm" : "bg-surface border border-gray-100 text-foreground rounded-tl-sm")}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="shrink-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="rounded-2xl px-4 py-3 text-sm bg-surface border border-gray-100 flex items-center gap-1 rounded-tl-sm shadow-sm">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 bg-surface">
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedPrompts.map(prompt => (
                <button 
                  key={prompt} 
                  onClick={() => handleSend(prompt)}
                  className="text-[10px] bg-blue-50 text-primary border border-blue-100 px-2.5 py-1.5 rounded-full hover:bg-blue-100 transition-colors text-left font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault()
                const form = e.currentTarget
                const input = form.elements.namedItem('message') as HTMLInputElement
                handleSend(input.value)
                input.value = ''
              }}
              className="flex items-center gap-2"
            >
              <input 
                name="message"
                type="text" 
                placeholder="Tanya AI tentang bisnismu..." 
                className="flex-1 h-10 px-3 text-sm rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50"
              />
              <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0 shadow-sm">
                <Send className="h-4 w-4 ml-0.5" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
