import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Target, BarChart2 } from "@/components/ui/icons"

interface RecommendationCardProps {
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  actionText: string;
  onAction?: () => void;
}

export function RecommendationCard({ priority, title, description, actionText, onAction }: RecommendationCardProps) {
  const isHigh = priority === "HIGH";
  const isMed = priority === "MEDIUM";

  const PriorityIcon = isHigh ? Zap : isMed ? Target : BarChart2;
  const badgeVariant = isHigh ? "critical" : isMed ? "warning" : "default";

  return (
    <Card className="hover:shadow-md transition-shadow border-l-4" style={{ 
      borderLeftColor: isHigh ? 'var(--color-critical)' : isMed ? 'var(--color-warning)' : 'var(--color-primary)' 
    }}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <Badge variant={badgeVariant} className="px-2">
          {priority} PRIORITY
        </Badge>
        <PriorityIcon className="h-5 w-5 text-muted opacity-50" />
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-muted mb-6 leading-relaxed">
          {description}
        </p>
        <Button onClick={onAction} variant={isHigh ? "default" : "outline"} className="w-full sm:w-auto">
          {actionText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
