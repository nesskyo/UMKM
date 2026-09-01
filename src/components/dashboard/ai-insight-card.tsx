import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "@/components/ui/icons"

interface AIInsightCardProps {
  summary: string;
  onViewDetails?: () => void;
}

export function AIInsightCard({ summary, onViewDetails }: AIInsightCardProps) {
  return (
    <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-0 shadow-sm relative overflow-hidden">
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-white rounded-full blur-3xl opacity-20 pointer-events-none"></div>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 p-2 rounded-full shadow-sm border border-white/30 shrink-0">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-3 flex-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              ✨ AI Business Insight
            </h3>
            <p className="text-sm text-white/90 leading-relaxed font-medium">
              {summary}
            </p>
            {onViewDetails && (
              <Button
                onClick={onViewDetails}
                className="mt-2 text-xs font-semibold px-4 py-2 bg-white text-blue-600 hover:bg-white/90"
                size="sm"
              >
                Lihat Analisis Lengkap
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}