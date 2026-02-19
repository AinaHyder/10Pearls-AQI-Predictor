import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface WeatherCardProps {
  icon: ReactNode
  label: string
  value: string
  color: string
}

export default function WeatherCard({ icon, label, value, color }: WeatherCardProps) {
  return (
    <Card className="bg-white/85 dark:bg-slate-800/85 backdrop-blur border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm font-semibold flex items-center gap-2 ${color}`}>
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      </CardContent>
    </Card>
  )
}
