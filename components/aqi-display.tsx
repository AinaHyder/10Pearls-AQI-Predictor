import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface AQIData {
  aqi: number
  pm25: number
  pm10: number
  no2: number
  o3: number
  status: string
  lastUpdate: string
}

export default function AQIDisplay({ aqi }: { aqi: AQIData }) {
  const getAQIColor = () => {
    if (aqi.aqi <= 50) return "bg-gradient-to-br from-emerald-500 to-teal-600"
    if (aqi.aqi <= 100) return "bg-gradient-to-br from-yellow-500 to-amber-600"
    if (aqi.aqi <= 150) return "bg-gradient-to-br from-orange-500 to-orange-600"
    if (aqi.aqi <= 200) return "bg-gradient-to-br from-red-500 to-red-700"
    if (aqi.aqi <= 300) return "bg-gradient-to-br from-purple-600 to-purple-800"
    return "bg-gradient-to-br from-slate-700 to-slate-900"
  }

  return (
    <Card className={`${getAQIColor()} text-white border-0 shadow-xl`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6" />
          Air Quality Index
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold mb-2">{aqi.aqi}</div>
        <p className="text-lg font-semibold mb-4">{aqi.status}</p>
        <div className="grid grid-cols-2 gap-3 text-sm mb-3 bg-white/20 p-3 rounded-lg backdrop-blur">
          <div>
            <p className="opacity-90 text-xs">PM2.5</p>
            <p className="font-bold text-base">{aqi.pm25 > 0 ? aqi.pm25.toFixed(1) : "N/A"}</p>
          </div>
          <div>
            <p className="opacity-90 text-xs">PM10</p>
            <p className="font-bold text-base">{aqi.pm10 > 0 ? aqi.pm10.toFixed(1) : "N/A"}</p>
          </div>
          <div>
            <p className="opacity-90 text-xs">NO₂</p>
            <p className="font-bold text-base">{aqi.no2 > 0 ? aqi.no2.toFixed(1) : "N/A"}</p>
          </div>
          <div>
            <p className="opacity-90 text-xs">O₃</p>
            <p className="font-bold text-base">{aqi.o3 > 0 ? aqi.o3.toFixed(1) : "N/A"}</p>
          </div>
        </div>
        <p className="text-xs opacity-75">Updated: {aqi.lastUpdate}</p>
      </CardContent>
    </Card>
  )
}
