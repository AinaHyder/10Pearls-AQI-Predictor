import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, CloudRain, Sun, CloudSnow } from "lucide-react"
import RealisticWeather from "./realistic-weather"

interface ForecastItem {
  time: string
  temp: number
  tempMax?: number
  tempMin?: number
  condition: string
  icon: string
  humidity: number
  windSpeed: number
  chanceOfRain: number
}

export default function ForecastTimeline({ forecast }: { forecast: ForecastItem[] }) {
  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase()
    if (c.includes("rain")) return <CloudRain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
    if (c.includes("cloud")) return <Cloud className="w-6 h-6 text-slate-500 dark:text-slate-400" />
    if (c.includes("snow")) return <CloudSnow className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
    if (c.includes("clear") || c.includes("sunny"))
      return <Sun className="w-6 h-6 text-amber-500 dark:text-amber-400" />
    return <Cloud className="w-6 h-6 text-slate-400 dark:text-slate-500" />
  }

  return (
    <Card className="bg-white/85 dark:bg-slate-800/85 backdrop-blur border-slate-200 dark:border-slate-700 shadow-xl mb-8">
      <CardHeader>
        <CardTitle className="text-2xl">Daily Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-4 min-w-max">
            {forecast.map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-4 min-w-[140px] border border-slate-200 dark:border-slate-600 hover:shadow-lg transition-all duration-200"
              >
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{item.time}</p>
                <div className="flex justify-center mb-3 scale-75">
                  <RealisticWeather condition={item.condition} size={80} />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{item.temp}°C</p>
                {item.tempMax && item.tempMin && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    {item.tempMax}°/{item.tempMin}°
                  </p>
                )}
                <p className="text-xs text-slate-700 dark:text-slate-300 capitalize line-clamp-1 font-medium">
                  {item.condition}
                </p>
                <div className="mt-3 text-xs space-y-1 border-t border-slate-300 dark:border-slate-500 pt-2">
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>💧</span>
                    <span className="font-semibold">{item.humidity}%</span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>💨</span>
                    <span className="font-semibold">{item.windSpeed}m/s</span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>🌧️</span>
                    <span className="font-semibold">{Math.round(item.chanceOfRain)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
