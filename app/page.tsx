"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Wind, Droplets, Eye, Gauge } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import WeatherBackground from "@/components/weather-background"
import WeatherCard from "@/components/weather-card"
import ForecastTimeline from "@/components/forecast-timeline"
import AQIDisplay from "@/components/aqi-display"
import RealisticWeather from "@/components/realistic-weather"

interface WeatherData {
  city: string
  temp: number
  feelsLike: number
  humidity: number
  windSpeed: number
  pressure: number
  condition: string
  description: string
  visibility: number
  sunrise: string
  sunset: string
  icon: string
}

interface ForecastItem {
  time: string
  date: string
  temp: number
  tempMax: number
  tempMin: number
  condition: string
  icon: string
  humidity: number
  windSpeed: number
  chanceOfRain: number
}

interface AQIData {
  aqi: number
  pm25: number
  pm10: number
  no2: number
  o3: number
  status: string
  lastUpdate: string
}

export default function Home() {
  const [daysInput, setDaysInput] = useState("3")
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastItem[]>([])
  const [aqi, setAqi] = useState<AQIData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchWeatherData = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const numDays = Math.min(Math.max(Number.parseInt(daysInput) || 1, 1), 5)

      const res = await fetch(`/api/weather?days=${numDays}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to fetch weather data")

      setWeather(data.weather)
      setForecast(data.forecast)
      
      if (data.aqi) {
        setAqi(data.aqi)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data")
      console.log("[v0] Error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherData()
  }, [])

  const chartData = forecast.map((item) => ({
    date: item.time,
    temp: item.temp,
    tempMax: item.tempMax,
    tempMin: item.tempMin,
    humidity: item.humidity,
    windSpeed: Math.round(item.windSpeed * 3.6 * 10) / 10, // Convert to km/h
  }))

  const aqiChartData = [
    { label: "PM2.5", value: aqi?.pm25 || 0, limit: 35, color: "#D97706" },
    { label: "PM10", value: aqi?.pm10 || 0, limit: 50, color: "#F97316" },
    { label: "NO₂", value: aqi?.no2 || 0, limit: 40, color: "#EF4444" },
    { label: "O₃", value: aqi?.o3 || 0, limit: 100, color: "#8B5CF6" },
  ]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchWeatherData()
  }

  return (
    <main className="min-h-screen bg-transparent">
      <WeatherBackground condition={weather?.condition || "Clear"} />

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-900 dark:to-slate-950 text-white py-8 shadow-xl">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-6">
              <h1 className="text-4xl font-bold tracking-tight">
                <span className="text-white">AQI Prediction</span>
                <span className="ml-2 text-blue-400">Dashboard</span>
              </h1>
              <p className="text-slate-300 mt-2">Karachi • Professional Air Quality & Weather Forecasting</p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-3 flex-wrap mb-6">
              <div className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-lg border border-slate-600">
                <span className="text-slate-300 text-sm font-medium">Forecast for</span>
                <Input
                  type="number"
                  min="1"
                  max="16"
                  value={daysInput}
                  onChange={(e) => setDaysInput(e.target.value)}
                  className="w-16 bg-slate-600 border-slate-500 text-white text-center px-2"
                  placeholder="3"
                />
                <span className="text-slate-300 text-sm">days</span>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg"
              >
                {loading ? "Loading..." : "Update Forecast"}
              </Button>
            </form>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {error && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {weather && (
            <>
              {/* Current Weather Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="md:col-span-2 bg-white/85 dark:bg-slate-800/85 backdrop-blur border-slate-200 dark:border-slate-700 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-3xl">{weather.city}</CardTitle>
                    <CardDescription className="capitalize text-base">{weather.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-7xl font-bold text-slate-800 dark:text-slate-100">{weather.temp}°C</div>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">Feels like {weather.feelsLike}°C</p>
                      </div>
                      <RealisticWeather condition={weather.condition} size={180} />
                    </div>
                  </CardContent>
                </Card>

                {aqi && <AQIDisplay aqi={aqi} />}
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <WeatherCard
                  icon={<Droplets className="w-6 h-6" />}
                  label="Humidity"
                  value={`${weather.humidity}%`}
                  color="text-blue-600 dark:text-blue-400"
                />
                <WeatherCard
                  icon={<Wind className="w-6 h-6" />}
                  label="Wind Speed"
                  value={`${weather.windSpeed} m/s`}
                  color="text-slate-600 dark:text-slate-400"
                />
                <WeatherCard
                  icon={<Eye className="w-6 h-6" />}
                  label="Visibility"
                  value={`${weather.visibility} km`}
                  color="text-amber-600 dark:text-amber-400"
                />
                <WeatherCard
                  icon={<Gauge className="w-6 h-6" />}
                  label="Pressure"
                  value={`${weather.pressure} hPa`}
                  color="text-purple-600 dark:text-purple-400"
                />
              </div>

              {/* Sunrise/Sunset */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <Card className="bg-gradient-to-br from-orange-400 to-orange-600 text-white border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <SunIcon className="w-5 h-5" /> Sunrise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{weather.sunrise}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MoonIcon className="w-5 h-5" /> Sunset
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{weather.sunset}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              {forecast.length > 0 && (
                <>
                  <Card className="mb-8 bg-white/85 dark:bg-slate-800/85 backdrop-blur border-slate-200 dark:border-slate-700 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl">Temperature Trend</CardTitle>
                      <CardDescription>{daysInput} day forecast with daily highs and lows</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTempMax" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#EA580C" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#EA580C" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorTempMin" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0284C7" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#0284C7" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="date" stroke="#64748B" />
                          <YAxis stroke="#64748B" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(15, 23, 42, 0.95)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              borderRadius: "8px",
                              color: "#F1F5F9",
                            }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="tempMax"
                            stroke="#EA580C"
                            fillOpacity={1}
                            fill="url(#colorTempMax)"
                            name="Max Temp (°C)"
                          />
                          <Area
                            type="monotone"
                            dataKey="tempMin"
                            stroke="#0284C7"
                            fillOpacity={1}
                            fill="url(#colorTempMin)"
                            name="Min Temp (°C)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Humidity & Wind Chart */}
                  <Card className="mb-8 bg-white/85 dark:bg-slate-800/85 backdrop-blur border-slate-200 dark:border-slate-700 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl">Humidity & Wind Speed</CardTitle>
                      <CardDescription>Combined forecast metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="date" stroke="#64748B" />
                          <YAxis stroke="#64748B" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(15, 23, 42, 0.95)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                              borderRadius: "8px",
                              color: "#F1F5F9",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="humidity"
                            stroke="#0EA5E9"
                            name="Humidity (%)"
                            strokeWidth={3}
                            dot={{ fill: "#0EA5E9", r: 5 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="windSpeed"
                            stroke="#F59E0B"
                            name="Wind Speed (km/h)"
                            strokeWidth={3}
                            dot={{ fill: "#F59E0B", r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Hourly Forecast Timeline */}
                  <ForecastTimeline forecast={forecast} />

                  {/* Temperature Heatmap */}
                  <Card className="mb-8 bg-white/85 dark:bg-slate-800/85 backdrop-blur border-slate-200 dark:border-slate-700 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-2xl">Temperature Distribution Heatmap</CardTitle>
                      <CardDescription>Visual temperature range across forecast days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4">
                        {forecast.map((day, idx) => {
                          const tempRange = day.tempMax - day.tempMin
                          const normalizedMax = Math.min(day.tempMax / 50, 1)
                          const normalizedMin = Math.min(day.tempMin / 50, 1)
                          const getHeatColor = (temp: number) => {
                            if (temp > 35) return "bg-gradient-to-r from-red-600 to-red-400"
                            if (temp > 25) return "bg-gradient-to-r from-orange-500 to-orange-300"
                            if (temp > 15) return "bg-gradient-to-r from-yellow-500 to-yellow-300"
                            if (temp > 5) return "bg-gradient-to-r from-green-500 to-green-300"
                            return "bg-gradient-to-r from-blue-600 to-blue-400"
                          }

                          return (
                            <div key={idx} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{day.date}</span>
                                <div className="flex gap-3 text-sm">
                                  <span className="text-red-600 dark:text-red-400 font-bold">{day.tempMax}°C</span>
                                  <span className="text-blue-600 dark:text-blue-400 font-bold">{day.tempMin}°C</span>
                                </div>
                              </div>
                              <div className="flex gap-2 h-10">
                                <div
                                  className={`${getHeatColor(day.tempMax)} rounded-lg flex-1 flex items-center justify-end pr-3 text-white font-bold text-sm`}
                                  style={{ minWidth: `${normalizedMax * 100}%` }}
                                >
                                  Max
                                </div>
                                <div
                                  className={`${getHeatColor(day.tempMin)} rounded-lg flex-1 flex items-center justify-end pr-3 text-white font-bold text-sm`}
                                  style={{ minWidth: `${normalizedMin * 100}%` }}
                                >
                                  Min
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Weather Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {forecast.map((day, idx) => (
                      <Card key={idx} className="bg-white/85 dark:bg-slate-800/85 backdrop-blur border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{day.date}</CardTitle>
                          <CardDescription className="capitalize">{day.condition}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-600 dark:text-slate-400">Temperature</span>
                              <span className="font-bold text-slate-800 dark:text-slate-100">{Math.round(day.temp)}°C</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-400 to-red-400 h-2 rounded-full"
                                style={{ width: `${Math.min(((day.temp + 50) / 100) * 100, 100)}%` }}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-2">
                              <div className="bg-slate-100 dark:bg-slate-700/50 p-2 rounded">
                                <p className="text-xs text-slate-600 dark:text-slate-400">Humidity</p>
                                <p className="font-bold text-slate-800 dark:text-slate-100">{day.humidity}%</p>
                              </div>
                              <div className="bg-slate-100 dark:bg-slate-700/50 p-2 rounded">
                                <p className="text-xs text-slate-600 dark:text-slate-400">Rain</p>
                                <p className="font-bold text-slate-800 dark:text-slate-100">{day.chanceOfRain}%</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {aqi && (
                    <>
                      <Card className="mb-8 bg-white/85 dark:bg-slate-800/85 backdrop-blur border-slate-200 dark:border-slate-700 shadow-xl">
                        <CardHeader>
                          <CardTitle className="text-2xl">Air Quality Pollutants</CardTitle>
                          <CardDescription>PM2.5 • PM10 • NO₂ • O₃ measurements</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={aqiChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                              <XAxis dataKey="label" stroke="#64748B" />
                              <YAxis stroke="#64748B" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                                  border: "1px solid rgba(255, 255, 255, 0.1)",
                                  borderRadius: "8px",
                                  color: "#F1F5F9",
                                }}
                              />
                              <Legend />
                              <Bar dataKey="value" fill="#D97706" name="Current Level (μg/m³)" />
                              <Bar dataKey="limit" fill="#10B981" name="Safe Limit (μg/m³)" />
                            </BarChart>
                          </ResponsiveContainer>
                          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {aqiChartData.map((item) => (
                              <div key={item.label} className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.label}</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Pollutant Health Impact Heatmap */}
                      <Card className="mb-8 bg-white/85 dark:bg-slate-800/85 backdrop-blur border-slate-200 dark:border-slate-700 shadow-xl">
                        <CardHeader>
                          <CardTitle className="text-2xl">Pollutant Health Impact Index</CardTitle>
                          <CardDescription>Visual representation of pollution levels and health risks</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {aqiChartData.map((item) => {
                              const percentage = (item.value / item.limit) * 100
                              let colorClass = "bg-gradient-to-r from-green-500 to-green-400"
                              let riskLevel = "Safe"

                              if (percentage > 150) {
                                colorClass = "bg-gradient-to-r from-red-600 to-red-500"
                                riskLevel = "Hazardous"
                              } else if (percentage > 100) {
                                colorClass = "bg-gradient-to-r from-red-500 to-orange-500"
                                riskLevel = "Unhealthy"
                              } else if (percentage > 80) {
                                colorClass = "bg-gradient-to-r from-orange-500 to-yellow-500"
                                riskLevel = "Moderate"
                              } else if (percentage > 50) {
                                colorClass = "bg-gradient-to-r from-yellow-500 to-green-500"
                                riskLevel = "Fair"
                              }

                              return (
                                <div key={item.label}>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.label}</span>
                                    <div className="text-right">
                                      <span className="font-bold text-slate-800 dark:text-slate-100">{item.value} / {item.limit}</span>
                                      <span className={`ml-3 text-xs font-bold px-2 py-1 rounded ${percentage > 150 ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" : percentage > 100 ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" : percentage > 80 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"}`}>
                                        {riskLevel}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                                    <div
                                      className={`${colorClass} h-3 rounded-full transition-all duration-500`}
                                      style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>

                      {/* AQI Gauge and History */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <Card className="bg-white/85 dark:bg-slate-800/85 backdrop-blur border-slate-200 dark:border-slate-700 shadow-xl">
                          <CardHeader>
                            <CardTitle className="text-2xl">Current AQI Index</CardTitle>
                            <CardDescription>Overall air quality status</CardDescription>
                          </CardHeader>
                          <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="relative w-48 h-48 flex items-center justify-center">
                              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                                <circle cx="100" cy="100" r="90" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                                <circle
                                  cx="100"
                                  cy="100"
                                  r="90"
                                  fill="none"
                                  stroke={
                                    aqi.aqi > 150
                                      ? "#dc2626"
                                      : aqi.aqi > 100
                                        ? "#ea580c"
                                        : aqi.aqi > 50
                                          ? "#f59e0b"
                                          : "#10b981"
                                  }
                                  strokeWidth="20"
                                  strokeDasharray={`${(aqi.aqi / 500) * 565} 565`}
                                  className="transition-all duration-500"
                                  transform="rotate(-90 100 100)"
                                />
                              </svg>
                              <div className="text-center">
                                <p className="text-5xl font-bold text-slate-800 dark:text-slate-100">{aqi.aqi}</p>
                                <p className="text-slate-600 dark:text-slate-400 font-semibold">{aqi.status}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-white/85 dark:bg-slate-800/85 backdrop-blur border-slate-200 dark:border-slate-700 shadow-xl">
                          <CardHeader>
                            <CardTitle className="text-2xl">Health Recommendations</CardTitle>
                            <CardDescription>Based on current AQI level</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {aqi.aqi > 150 ? (
                                <>
                                  <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-600 p-4 rounded">
                                    <p className="font-bold text-red-800 dark:text-red-200">⚠️ Hazardous Conditions</p>
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">Everyone should avoid outdoor activities. Stay indoors with air purifiers.</p>
                                  </div>
                                </>
                              ) : aqi.aqi > 100 ? (
                                <>
                                  <div className="bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-600 p-4 rounded">
                                    <p className="font-bold text-orange-800 dark:text-orange-200">⚠️ Unhealthy</p>
                                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">Vulnerable groups should limit outdoor exposure. Wear N95 masks if going outside.</p>
                                  </div>
                                </>
                              ) : aqi.aqi > 50 ? (
                                <>
                                  <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-600 p-4 rounded">
                                    <p className="font-bold text-yellow-800 dark:text-yellow-200">ℹ️ Moderate</p>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">Sensitive groups should consider limiting prolonged outdoor exposure.</p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-600 p-4 rounded">
                                    <p className="font-bold text-green-800 dark:text-green-200">✅ Good</p>
                                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">Air quality is satisfactory. Outdoor activities are fine for most people.</p>
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="mt-6 space-y-2 bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg">
                              <p className="font-semibold text-slate-700 dark:text-slate-300">Last Updated</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{aqi.lastUpdate}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

function SunIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="5" />
      <path
        d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6m-16.78 7.78l4.24-4.24m5.08-5.08l4.24-4.24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
