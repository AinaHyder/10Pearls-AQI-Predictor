import { NextRequest, NextResponse } from "next/server"

const PYTHON_API_BASE = process.env.PYTHON_API_BASE || "http://localhost:8000"

export async function GET(request: NextRequest) {
  try {
    // Fetch current AQI from Python backend
    const currentAQIRes = await fetch(`${PYTHON_API_BASE}/api/current-aqi`)
    const currentAQIData = await currentAQIRes.json()

    // Fetch predictions from Python backend
    const predictionsRes = await fetch(`${PYTHON_API_BASE}/api/predictions`)
    const predictionsData = await predictionsRes.json()

    // Fetch alerts
    const alertsRes = await fetch(`${PYTHON_API_BASE}/api/alerts`)
    const alertsData = await alertsRes.json()

    // Keep the original weather fetching for now, but we can enhance it
    const openWeatherKey = process.env.OPENWEATHER_API_KEY
    const KARACHI_LAT = 24.8607
    const KARACHI_LON = 67.0011

    if (!openWeatherKey) {
      return NextResponse.json(
        { error: "Missing OpenWeather API key" },
        { status: 500 }
      )
    }

    // Get number of days from query params, default to 5
    const numDays = Math.min(Math.max(Number.parseInt(request.nextUrl.searchParams.get("days") || "5") || 5, 1), 16)

    // Fetch current weather
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${KARACHI_LAT}&lon=${KARACHI_LON}&units=metric&appid=${openWeatherKey}`
    )
    const weatherData = await weatherRes.json()

    if (!weatherRes.ok) throw new Error("Failed to fetch current weather")

    const currentWeather = {
      city: "Karachi, Pakistan",
      temp: Math.round(weatherData.main.temp),
      feelsLike: Math.round(weatherData.main.feels_like),
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind.speed * 10) / 10,
      pressure: weatherData.main.pressure,
      condition: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      visibility: Math.round(weatherData.visibility / 1000),
      sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      icon: weatherData.weather[0].icon,
    }

    // Fetch forecast
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${KARACHI_LAT}&lon=${KARACHI_LON}&units=metric&appid=${openWeatherKey}`
    )
    const forecastData = await forecastRes.json()

    if (!forecastRes.ok) throw new Error("Failed to fetch forecast")

    // Process forecast data grouped by day
    const dailyStats = new Map<
      string,
      { temps: number[]; humidity: number[]; windSpeeds: number[]; data: any[] }
    >()

    forecastData.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000)
      const dateKey = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })

      if (!dailyStats.has(dateKey)) {
        dailyStats.set(dateKey, { temps: [], humidity: [], windSpeeds: [], data: [] })
      }

      const stats = dailyStats.get(dateKey)!
      stats.temps.push(item.main.temp)
      stats.humidity.push(item.main.humidity)
      stats.windSpeeds.push(item.wind.speed)
      stats.data.push(item)
    })

    // Convert to array and process
    const forecast = Array.from(dailyStats.entries())
      .slice(0, numDays)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([dateKey, stats]) => {
        const date = new Date(dateKey)
        const mainData = stats.data[Math.floor(stats.data.length / 2)]

        return {
          time: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
          date: dateKey,
          temp: Math.round(mainData.main.temp),
          tempMax: Math.round(Math.max(...stats.temps)),
          tempMin: Math.round(Math.min(...stats.temps)),
          condition: mainData.weather[0].main,
          icon: mainData.weather[0].icon,
          humidity: Math.round(
            stats.humidity.reduce((a, b) => a + b, 0) / stats.humidity.length
          ),
          windSpeed:
            Math.round((stats.windSpeeds.reduce((a, b) => a + b, 0) / stats.windSpeeds.length) * 10) / 10,
          chanceOfRain: mainData.clouds.all || 0,
        }
      })

    // Combine with AQI predictions
    const enhancedForecast = forecast.map((day, index) => ({
      ...day,
      predictedAQI: predictionsData.predictions?.[index]?.predicted_aqi || null,
      aqiCategory: predictionsData.predictions?.[index]?.category || null,
    }))

    return NextResponse.json({
      weather: currentWeather,
      forecast: enhancedForecast,
      aqi: {
        current: currentAQIData.current_aqi,
        category: currentAQIData.category,
        predictions: predictionsData.predictions,
        alerts: alertsData.alerts,
      },
    })
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch weather data" },
      { status: 500 }
    )
  }
}
