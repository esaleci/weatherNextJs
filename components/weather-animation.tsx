"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudRain, CloudSnow, CloudFog, Sun, CloudLightning, CloudDrizzle } from "lucide-react"

interface WeatherAnimationProps {
  condition: string
  className?: string
}

export function WeatherAnimation({ condition, className = "" }: WeatherAnimationProps) {
  const [weatherType, setWeatherType] = useState<string>("clear")

  useEffect(() => {
    // Normalize the condition string to determine animation type
    const normalizedCondition = condition.toLowerCase()

    if (normalizedCondition.includes("rain") || normalizedCondition.includes("shower")) {
      setWeatherType("rain")
    } else if (normalizedCondition.includes("snow") || normalizedCondition.includes("sleet")) {
      setWeatherType("snow")
    } else if (normalizedCondition.includes("cloud") || normalizedCondition.includes("overcast")) {
      setWeatherType("cloudy")
    } else if (normalizedCondition.includes("fog") || normalizedCondition.includes("mist")) {
      setWeatherType("fog")
    } else if (normalizedCondition.includes("thunder") || normalizedCondition.includes("lightning")) {
      setWeatherType("thunder")
    } else if (normalizedCondition.includes("drizzle")) {
      setWeatherType("drizzle")
    } else if (normalizedCondition.includes("clear") || normalizedCondition.includes("sunny")) {
      setWeatherType("clear")
    } else {
      setWeatherType("clear") // Default
    }
  }, [condition])

  return (
    <div className={`relative h-40 w-full overflow-hidden rounded-lg ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-600 dark:from-blue-900 dark:to-blue-950">
        {weatherType === "clear" && (
          <div className="animate-weather-float absolute left-1/2 top-1/4 -translate-x-1/2">
            <Sun size={80} className="text-yellow-300 animate-pulse" />
            <div className="absolute inset-0 bg-yellow-300 blur-xl opacity-30 rounded-full" />
          </div>
        )}

        {weatherType === "cloudy" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-weather-float-slow translate-x-5">
              <Cloud size={60} className="text-white" />
            </div>
            <div className="animate-weather-float absolute -translate-x-10 -translate-y-6">
              <Cloud size={40} className="text-gray-200" />
            </div>
            <div className="animate-weather-float-slow absolute translate-x-16 translate-y-10">
              <Cloud size={50} className="text-gray-100" />
            </div>
          </div>
        )}

        {weatherType === "rain" && (
          <div className="absolute inset-0">
            <div className="absolute top-2 left-1/2 -translate-x-1/2">
              <CloudRain size={70} className="text-gray-300" />
            </div>
            <div className="absolute inset-x-0 top-20 flex justify-around">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 h-4 bg-blue-200 rounded-full animate-rain"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    left: `${10 + i * 8}%`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {weatherType === "snow" && (
          <div className="absolute inset-0">
            <div className="absolute top-2 left-1/2 -translate-x-1/2">
              <CloudSnow size={70} className="text-gray-300" />
            </div>
            <div className="absolute inset-x-0 top-20 flex justify-around">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-white rounded-full animate-snow"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    left: `${5 + i * 6}%`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {weatherType === "fog" && (
          <div className="absolute inset-0">
            <div className="absolute top-2 left-1/2 -translate-x-1/2">
              <CloudFog size={70} className="text-gray-300" />
            </div>
            <div className="absolute inset-0 flex flex-col justify-center gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-2 bg-white/30 rounded-full animate-fog"
                  style={{
                    animationDelay: `${i * 0.5}s`,
                    width: `${70 + i * 5}%`,
                    marginLeft: `${i * 2}%`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {weatherType === "thunder" && (
          <div className="absolute inset-0">
            <div className="absolute top-2 left-1/2 -translate-x-1/2">
              <CloudLightning size={70} className="text-gray-700" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-lightning w-1 h-16 bg-yellow-300 blur-sm" />
            </div>
          </div>
        )}

        {weatherType === "drizzle" && (
          <div className="absolute inset-0">
            <div className="absolute top-2 left-1/2 -translate-x-1/2">
              <CloudDrizzle size={70} className="text-gray-300" />
            </div>
            <div className="absolute inset-x-0 top-20 flex justify-around">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 h-3 bg-blue-200 rounded-full animate-drizzle"
                  style={{
                    animationDelay: `${i * 0.3}s`,
                    left: `${15 + i * 10}%`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

