"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MapPin, Clock, RefreshCw, Search, Plus, X, Sun } from "lucide-react"
import { scrapeWeatherData } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { getlocation } from "./get_location"
import Image from "next/image"
interface WeatherData {
  locationquery:string,
  location: string
  temperature: string
  condition: string
  description?: string
  dateTime: string
  humidity?: string
  windSpeed?: string
  uvindex:string
  feelsLike:string
  precip:string
  visibility:string
  windDegree:string
  windmi:string
  windkmp:string
  sunrise:string
  sunset:string
  weatherhorly:any
  weathers:any
  lat:string,
  lon:string,
}

interface FavoriteLocation {
  id: string
  name:string,
  lat:string,
  lon:string,
  location:string,
 
}

export default function WeatherApp() {
  const [location, setLocation] = useState("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([])
  const [dashboardData, setDashboardData] = useState<Record<string, WeatherData | null>>({})
  const [loadingFavorites, setLoadingFavorites] = useState<Record<string, boolean>>({})
  const [showSearch, setShowSearch] = useState(false)

  const [country, setCountry] = useState<string | null>(null);  
  const [region, setRegion] = useState<string | null>(null); 
  const [city, setCity] = useState<string | null>(null); 
  const [ip, setIp] = useState<string | null>(null); 
  const [lat, setLat] = useState("")
  const [lon, setLon] = useState("")

  // const getGeoLocation=async()=>{
  //   const response = await fetch(`http://ip-api.com/json/`);  
  //   if (!response.ok) {  
  //     throw new Error("Error fetching country data");  
  //   }  

  //   const data = await response.json();  
  //   setCountry(data.country);
  //   setRegion(data.regionName);
  //   setCity(data.city);  
  //   console.log('city is in func',city)
  //   return data.city;
  // }


  const getGeoLocationlat=async()=>{
   
    // navigator.geolocation.getCurrentPosition(
    //   // Success callback function
    //   (position) => {
    //     // Get the user's latitude and longitude coordinates
    //     const lat = position.coords.latitude;
    //     const lng = position.coords.longitude;
  
    //     // Do something with the location data, e.g. display on a map
    //     console.log(`Latitude: ${lat}, longitude: ${lng}`);
    //   },
    //   // Error callback function
    //   (error) => {
    //     // Handle errors, e.g. user denied location sharing permissions
    //     console.log("Error getting user location:", error);
    //   }
    // );

   
    const getLocation=await getlocation(ip||'');
    setLat(getLocation.latitude);
    setLon(getLocation.longitude);  
    setCountry(getLocation.country_name);
    setRegion(getLocation.region_name);
    setCity(getLocation.city_name);  
    return getLocation;
  }

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const fetchIp = async () => {  
      const response = await fetch('https://api.ipify.org?format=json');  
        const data = await response.json();  
     
      const getLocation=await getlocation(data.ip||'');
      console.log('get location',getLocation,data)
      setIp(data.ip);  
    
   

    };  

      fetchIp();  

    const savedFavorites = localStorage.getItem("weatherFavorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    } 


      async function getGeoLo(){
        //  const getData= await getGeoLocation();
         const getgeo=await getGeoLocationlat();
         console.log('city is',getgeo)
         handleLocationSelect(getgeo?.city_name ||"London, UK")
      }

      getGeoLo();
    

   

    // // Load default location if no favorites
    // if (!savedFavorites || JSON.parse(savedFavorites).length === 0) {
    //   // handleLocationSelect("London, UK")
    //   handleLocationSelect(city||"London, UK")
    // } else {
    //   // Load the first favorite
    //   const firstFav = JSON.parse(savedFavorites)[0]
    //   handleLocationSelect(firstFav.name)
    // }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("weatherFavorites", JSON.stringify(favorites))
  }, [favorites])

  // Load weather data for favorites
  useEffect(() => {
    if (favorites.length > 0) {
      loadFavoritesData()
    }
  }, [favorites])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!location.trim()) return
    handleLocationSelect(location)
    setShowSearch(false)
  }

  const handleLocationSelect = async (locationName: string) => {
    setLoading(true)
    setError(null)

    try {
      const data = await scrapeWeatherData(locationName)
      setWeatherData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather data")
      setWeatherData(null)
    } finally {
      setLoading(false)
    }
  }

  const addToFavorites = () => {
    if (!weatherData) return

    const newFavorite = {
      id: Date.now().toString(),
      lat:weatherData.lat,
      lon:weatherData.lon,
      name: weatherData.locationquery,
      location:weatherData.location,
    }

    // Check if already in favorites
    if (!favorites.some((fav) => fav.name === newFavorite.name)) {
      setFavorites((prev) => [...prev, newFavorite])
    }
  }

  const removeFromFavorites = (id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id))
    console.log('fav id is',id,favorites)
    // Also remove from dashboard data
    setDashboardData((prev) => {
      const newData = { ...prev }
      delete newData[id]
      return newData
    })
  }

  const loadFavoritesData = async () => {
    // Create a copy of current loading states
    const newLoadingStates = { ...loadingFavorites }

    // Load data for each favorite
    for (const favorite of favorites) {
      if (!dashboardData[favorite.id]) {
        newLoadingStates[favorite.id] = true
        setLoadingFavorites(newLoadingStates)

        try {
          const data = await scrapeWeatherData(favorite.name)
          setDashboardData((prev) => ({
            ...prev,
            [favorite.id]: data,
          }))
        } catch (error) {
          console.error(`Error loading data for ${favorite.name}:`, error)
        } finally {
          newLoadingStates[favorite.id] = false
          setLoadingFavorites(newLoadingStates)
        }
      }
    }
  }

  const refreshWeather = async () => {
    if (weatherData) {
      handleLocationSelect(weatherData.location)
    }
  }

  const isLocationInFavorites = () => {
    return weatherData && favorites.some((fav) => fav.name === weatherData.location)
  }

  // Extract temperature as a number for display
  const getTemperatureNumber = (temp: string) => {
    const match = temp.match(/(\d+)/)
    return match ? match[1] : "N/A"
  }

  // Get weather condition for background effect
  const getWeatherCondition = () => {
    if (!weatherData) return "default"

    const condition = weatherData.condition.toLowerCase()
    if (condition.includes("rain") || condition.includes("shower")) return "rain"
    if (condition.includes("snow") || condition.includes("sleet")) return "snow"
    if (condition.includes("cloud") || condition.includes("overcast")) return "cloudy"
    if (condition.includes("fog") || condition.includes("mist")) return "fog"
    if (condition.includes("thunder") || condition.includes("lightning")) return "thunder"
    if (condition.includes("clear") || condition.includes("sunny")) return "sunny"

    return "default"
  }

  // Mock data for hourly and daily forecast
  const hourlyForecast = [
    { time: "Now", temp: weatherData?.temperature || "0°", condition: weatherData?.condition || "Clear" },
    { time: "15:00", temp: "28°", condition: "Rain" },
    { time: "16:00", temp: "26°", condition: "Rain" },
    { time: "17:00", temp: "29°", condition: "Cloudy" },
    { time: "18:00", temp: "32°", condition: "Partly Cloudy" },
    { time: "19:00", temp: "28°", condition: "Rain" },
  ]

  const dailyForecast = [
    {
      day: "Today",
      date: "18/09",
      temp: weatherData?.temperature || "0°",
      condition: weatherData?.condition || "Clear",
    },
    { day: "Thu", date: "19/09", temp: "28°", condition: "Rain" },
    { day: "Fri", date: "20/09", temp: "26°", condition: "Rain" },
    { day: "Sat", date: "21/09", temp: "29°", condition: "Cloudy" },
    { day: "Sun", date: "22/09", temp: "32°", condition: "Partly Cloudy" },
    { day: "Mon", date: "23/09", temp: "28°", condition: "Rain" },
  ]

  const weatherCondition = getWeatherCondition()

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8 relative overflow-hidden">
      {/* Dynamic weather background effect */}
      <div className={`absolute inset-0 pointer-events-none z-0 weather-bg weather-${weatherCondition}`}>
        {weatherCondition === "rain" && (
          <div className="rain-container">
             <Image
      src="/rain2.svg"
      width={500}
      height={500}
      alt="rain weather"
    />
            {Array.from({ length: 80 }).map((_, i) => (
              <div key={i} className={`raindrop !left-[${i.toString()}%]`}></div>
            ))}
            
          </div>
        )}

        {weatherCondition === "snow" && (
          <div className="snow-container">
                <Image
      src="/extreme-snow.svg"
      width={500}
      height={500}
      alt="sunny weather"
    />
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className="snowflake"></div>
            ))}
          </div>
        )}

        {weatherCondition === "sunny" && (
          <div className="sunny-container">
            {/* <div className="sun-glow"></div>
            <div className="sun-rays"></div> */}
            <div>
            <Image
      src="/sunny.svg"
      width={500}
      height={500}
      alt="sunny weather"
    />
              </div>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="light-particle"></div>
            ))}
          </div>
        )}

        {weatherCondition === "cloudy" && (
          <div className="cloudy-container">
            
            <Image
      src="/extreme-day-haze.svg"
      width={500}
      height={500}
      alt="cloudy weather"
    />
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="cloud"></div>
            ))}
          </div>
        )}

        {weatherCondition === "fog" && (
          <div className="fog-container">
                <Image
      src="/fog.svg"
      width={500}
      height={500}
      alt="rain weather"
    />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="fog-layer" style={{ top: `${i * 16}%` }}></div>
            ))}
          </div>
        )}

        {weatherCondition === "thunder" && (
          <div className="thunder-container">
            {/* <div className="lightning-flash"></div> */}
            <Image
      src="/thunderstorms-rain.svg"
      width={500}
      height={500}
      alt="rain weather"
    />
            {Array.from({ length: 80 }).map((_, i) => (
              <div key={i} className="raindrop thunder-drop"></div>
            ))}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Search bar */}
        <div className="relative mb-6">
          {showSearch ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Enter location (e.g., London, Tokyo)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-400"
                autoFocus
              />
              <Button type="submit" variant="ghost" size="icon" className="bg-gray-800/80 hover:bg-gray-700">
                <Search className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="bg-gray-800/80 hover:bg-gray-700"
                onClick={() => setShowSearch(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div
              className="flex items-center gap-2 bg-gray-800/80 rounded-md px-4 py-2 cursor-pointer"
              onClick={() => setShowSearch(true)}
            >
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-gray-200">{weatherData?.location || "Search location..."}</span>
            </div>
          )}
        </div>

        {/* Main grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left column - Current weather */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 flex flex-col">
            {loading ? (
              <div className="animate-pulse flex flex-col items-center justify-center h-full">
                <div className="h-32 w-32 bg-gray-700 rounded-full mb-4"></div>
                <div className="h-8 w-40 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-60 bg-gray-700 rounded"></div>
              </div>
            ) : weatherData ? (
              <>
                {/* Current temperature */}
                <div className="text-center text-gray-100 mb-4 text-xl">{weatherData.location}</div>

                <div className="text-center mb-4">
                  <div className="text-8xl font-light">{getTemperatureNumber(weatherData.temperature)}°</div>
                  <h2 className="text-2xl font-medium mt-2">{weatherData.condition}</h2>
                </div>

                
                {/* Date and time */}
                <div className="text-center text-gray-300 mb-4">{weatherData.dateTime}</div>

                {/* Weather description */}
                <p className="text-gray-300 text-center mb-8">
                  Expect {weatherData.condition.toLowerCase()} with temperatures reaching a maximum of{" "}
                  {weatherData.temperature}.{" "}
                  {weatherData.condition.toLowerCase().includes("rain")
                    ? "Make sure to check your umbrella and raincoat before heading out."
                    : weatherData.condition.toLowerCase().includes("snow")
                      ? "Bundle up and be careful on slippery surfaces."
                      : weatherData.condition.toLowerCase().includes("cloud")
                        ? "A good day to enjoy outdoor activities with some cloud cover."
                        : weatherData.condition.toLowerCase().includes("sunny") ||
                            weatherData.condition.toLowerCase().includes("clear")
                          ? "Perfect weather to enjoy outdoor activities. Don't forget sunscreen!"
                          : "Check the forecast regularly for any changes in conditions."}
                </p>

                {/* Weather details grid */}
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="bg-gray-900/60 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1 flex items-center">
                      <span className="mr-1">FEELS LIKE</span>
                    </div>
                    <div className="text-3xl font-bold">{weatherData.feelsLike}°</div>
                    <div className="text-xs text-gray-400 mt-1">The temperature is {weatherData.temperature} ° ,but you might feel it's {weatherData.temperature> weatherData.feelsLike ? "colder": "warmer"} </div>
                  </div>

                  <div className="bg-gray-900/60 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1 flex items-center">
                      <span className="mr-1">PRECIPITATION</span>
                    </div>
                    <div className="text-3xl font-bold">{weatherData.precip}</div>
                    <div className="text-xs text-gray-400 mt-1">in last 24h</div>
                  </div>

                  <div className="bg-gray-900/60 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1 flex items-center">
                      <span className="mr-1">VISIBILITY</span>
                    </div>
                    <div className="text-3xl font-bold">{weatherData.visibility}</div>
                  </div>

                  <div className="bg-gray-900/60 rounded-lg p-4">
                    <div className="text-gray-400 text-sm mb-1 flex items-center">
                      <span className="mr-1">HUMIDITY</span>
                    </div>
                    <div className="text-3xl font-bold">{weatherData.humidity || "82%"}</div>
                    {/* <div className="text-xs text-gray-400 mt-1">The dew point is 25° right now</div> */}
                  </div>
                </div>
              </>
            ) : error ? (
              <div className="text-red-400 text-center p-8">
                <p>{error}</p>
                <Button
                  variant="outline"
                  className="mt-4 border-gray-700 text-gray-700 hover:bg-gray-700"
                  onClick={() => setShowSearch(true)}
                >
                  Try another location
                </Button>
              </div>
            ) : null}
          </div>

          {/* Right column - Forecasts */}
          <div className="flex flex-col gap-4">
            {/* Hourly forecast */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center mb-4">
                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                <h3 className="text-gray-400 text-sm font-medium">HOURLY FORECAST</h3>
              </div>

              <div className="grid grid-cols-4 gap-2">
              {loading? (
                    <div className="animate-pulse w-full flex justify-between gap-8 items-center  h-full">
                    <div className="h-8 w-60 bg-gray-700 rounded "></div>
                    <div className="h-8 w-60 bg-gray-700 rounded "></div>
                    <div className="h-8 w-60 bg-gray-700 rounded"></div>
                    <div className="h-8 w-60 bg-gray-700 rounded"></div>
                  </div>
                ):<>
                 {weatherData?.weatherhorly?.map((hour:any, index:any) => (
                
                  <div
                    key={index}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-lg",
                      index === 0 ? "bg-gray-700/80" : "bg-gray-900/60",
                    )}
                  >
                    <div className="text-xs text-gray-400 mb-1">{hour.time}</div>
                    <div className="text-xl font-bold mb-1">{getTemperatureNumber(hour.temp)}°</div>
                    <div className="w-full h-8 flex gap-1">
                      {hour.condition.toLowerCase().includes("rain") && (
                        <CloudRainIcon className="w-full h-full text-gray-300" />
                      )}
                      {hour.condition.toLowerCase().includes("cloud") && (
                        <CloudIcon className="w-full h-full text-gray-300" />
                      )}
                      {(hour.condition.toLowerCase().includes("clear") ||
                        hour.condition.toLowerCase().includes("sunny")) && (
                        <SunIcon className="w-full h-full text-yellow-300" />
                      )}
                      {hour.condition.toLowerCase().includes("partly") && (
                        <CloudSunIcon className="w-full h-full text-gray-300" />
                      )}
                    </div>
                  </div>
                ))}
                     </>
                    }
              </div>
            </div>

            {/* 10-day forecast */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center mb-4">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <h3 className="text-gray-400 text-sm font-medium">DAY FORECAST</h3>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {loading? (
                    <div className="animate-pulse w-full flex justify-between gap-8 items-center  h-full">
                    <div className="h-8 w-60 bg-gray-700 rounded "></div>
                    <div className="h-8 w-60 bg-gray-700 rounded "></div>
                    <div className="h-8 w-60 bg-gray-700 rounded"></div>
                  </div>
                ):<>
                {weatherData?.weathers?.map((day:any, index:any) => (
                  <div
                    key={index}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-lg",
                      index === 0 ? "bg-gray-700/80" : "bg-gray-900/60",
                    )}
                  >
                    <div className="text-xs text-gray-400 mb-1">{day.day}</div>
                    <div className="text-xs text-gray-500 mb-1">{day.date||''}</div>
                    <div className="text-xl font-bold mb-1">{getTemperatureNumber(day.temp)}°</div>
                    <div className="w-full h-8 flex gap-1">
                      {day.condition.toLowerCase().includes("rain") && (
                        <CloudRainIcon className="w-full h-full text-gray-300" />
                      )}
                      {day.condition.toLowerCase().includes("cloud") && (
                        <CloudIcon className="w-full h-full text-gray-300" />
                      )}
                      {(day.condition.toLowerCase().includes("clear") ||
                        day.condition.toLowerCase().includes("sunny")) && (
                        <SunIcon className="w-full h-full text-yellow-300" />
                      )}
                      {day.condition.toLowerCase().includes("partly") && (
                        <CloudSunIcon className="w-full h-full text-gray-300" />
                      )}
                    </div>
                  </div>
                ))}
                </>
}
                
                
              </div>
            </div>

            {/* Additional metrics */}
            <div className="grid grid-cols-2 gap-4">
              {/* UV Index */}
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center mb-2">
                  <Sun className="h-4 w-4 text-gray-400 mr-2" />
                  <h3 className="text-gray-400 text-sm font-medium">UV INDEX</h3>
                </div>

                {loading? (
                    <div className="animate-pulse w-full flex-col justify-center gap-8 items-center  h-full">
                    <div className="h-16 w-16 bg-gray-700 rounded mb-3"></div>
                   
                    <div className="h-2 w-full bg-gray-700 rounded"></div>
                  </div>
                ):
                
                  <>

                <div className="text-3xl font-bold">{weatherData?.uvindex}</div>
                <div className="text-gray-300 mb-2">Moderate</div>

                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 h-2 rounded-full"
                    style={{ width:  `${weatherData?.uvindex ==="0" ? 2 :weatherData?.uvindex }%` }}
                  ></div>
                </div>

                <div className="text-xs text-gray-400">Use sun protection until {weatherData?.sunset}</div>
                </>
}
              </div>

              {/* Wind */}
              <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center mb-2">
                  <WindIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <h3 className="text-gray-400 text-sm font-medium">WIND</h3>
                </div>
              {loading? (
                    <div className="animate-pulse w-full flex justify-center gap-8 items-center  h-full">
                    <div className="h-16 w-16 bg-gray-700 rounded "></div>
                   
                    <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
                  </div>
                ):
                
                  <>
                

                <div className="flex items-center justify-between">

                  <div>
                    <div className="text-3xl font-bold">{weatherData?.windkmp}</div>
                    <div className="text-xs text-gray-400">
                      MPH
                      <br />
                      Wind
                    </div>

                    <div className="mt-2">
                      <div className="text-3xl font-bold">{weatherData?.windmi}</div>
                      <div className="text-xs text-gray-400">
                        MPH
                        <br />
                        Gusts
                      </div>
                    </div>
                  </div>

                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-2 border-gray-700 rounded-full"></div>
                    <div className="absolute inset-0 flex items-top justify-center">
                      <div className="text-xs text-gray-400">N</div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-center">
                      <div className="text-xs text-gray-400">S</div>
                    </div>
                    <div className="absolute inset-y-0 left-0 flex items-center justify-center">
                      <div className="text-xs text-gray-400">W</div>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center justify-center">
                      <div className="text-xs text-gray-400">E</div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                    <div className={`absolute animate-pulse top-1/2 left-1/2 w-12 h-[0.9px] bg-gray-100 origin-left transform -translate-y-1/3 rotate-[${weatherData?.windDegree}deg] scale(-1, -1)`}></div>
                  </div>
                </div>
                </>
}
              </div>
            </div>

            {/* Favorites section */}
            <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-300 font-medium">Favorites</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={refreshWeather}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {favorites.length === 0 ? (
                  <div className="text-gray-400 text-sm py-2">No favorite locations yet. Search and add some!</div>
                ) : (
                  favorites.map((favorite) => (
                    <div  key={favorite.id} className="flex gap-0">
                    <div
                     role="button"
                      // variant="outline"
                      // size="sm"
                      className="z-[1] px-2 py-1 border rounded bg-gray-900/60 border-gray-700 hover:bg-gray-700 text-gray-300 flex items-center gap-1"
                      onClick={() => handleLocationSelect(favorite.name)}
                    >
                      {favorite.name.split(",")[0]}
                      <X
                        className=" h-5 w-5 ml-1 opacity-60 hover:opacity-100 z-"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromFavorites(favorite.id)
                        }}
                      />
                     
                  
                    {/* <Button  key={`del-${favorite.id}`}
                      variant="ghost"
                      size="sm"
                      className="bg-gray-900/60 border-gray-700 hover:bg-gray-700 text-gray-300 flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFromFavorites(favorite.id)
                      }}
                    >
                    <X
                        className="h-3 w-3 ml-1 opacity-60 hover:opacity-100"
                      
                      />
                      </Button> */}
                      </div>
                    </div>
                  ))
                )}

                {weatherData && !isLocationInFavorites() && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-900/60 border-gray-700 hover:bg-gray-700 text-gray-300"
                    onClick={addToFavorites}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add current
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Weather icons components
function CloudRainIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
      <path d="M16 14v6"></path>
      <path d="M8 14v6"></path>
      <path d="M12 16v6"></path>
    </svg>
  )
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
    </svg>
  )
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  )
}

function CloudSunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="M20 12h2"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
      <path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"></path>
      <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"></path>
    </svg>
  )
}

function Calendar({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
      <line x1="16" x2="16" y1="2" y2="6"></line>
      <line x1="8" x2="8" y1="2" y2="6"></line>
      <line x1="3" x2="21" y1="10" y2="10"></line>
    </svg>
  )
}

function WindIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"></path>
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2"></path>
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2"></path>
    </svg>
  )
}
