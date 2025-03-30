"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Heart } from "lucide-react"
import { scrapeWeatherData } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WeatherAnimation } from "@/components/weather-animation"

interface WeatherData {
  locationquery:string,
  location: string
  temperature: string
  condition: string
  description?: string
  dateTime: string
  humidity?: string
  windSpeed?: string
}

interface FavoriteLocation {
  location: string
  id: string
  name: string
}

export default function WeatherScraperPage() {
  const [location, setLocation] = useState("")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([])
  const [activeTab, setActiveTab] = useState("search")
  const [dashboardData, setDashboardData] = useState<Record<string, WeatherData | null>>({})
  const [loadingFavorites, setLoadingFavorites] = useState<Record<string, boolean>>({})

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const savedFavorites = localStorage.getItem("weatherFavorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("weatherFavorites", JSON.stringify(favorites))
  }, [favorites])

  // Load weather data for favorites when dashboard tab is selected
  useEffect(() => {
    if (activeTab === "dashboard" && favorites.length > 0) {
      loadFavoritesData()
    }
  }, [activeTab, favorites])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!location.trim()) return

    setLoading(true)
    setError(null)

    try {
      const data = await scrapeWeatherData(location)
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

  const refreshFavorite = async (id: string, name: string) => {
    setLoadingFavorites((prev) => ({ ...prev, [id]: true }))

    try {
      const data = await scrapeWeatherData(name)
      setDashboardData((prev) => ({
        ...prev,
        [id]: data,
      }))
    } catch (error) {
      console.error(`Error refreshing data for ${name}:`, error)
    } finally {
      setLoadingFavorites((prev) => ({ ...prev, [id]: false }))
    }
  }

  const isLocationInFavorites = () => {
    return weatherData && favorites.some((fav) => fav.location === weatherData.location)
  }

  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Global Weather App</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="dashboard">My Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <div className="max-w-md mx-auto mb-8">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter location (e.g., London, Tokyo, New York)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? <Skeleton className="h-5 w-5 rounded-full" /> : <Search className="h-5 w-5" />}
              </Button>
            </form>
          </div>

          {loading && (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-40 w-full rounded-lg" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="max-w-md mx-auto p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>
          )}

          {weatherData && !loading && (
            <Card className="max-w-md mx-auto overflow-hidden">
              <CardHeader>
                <CardTitle>{weatherData.location}</CardTitle>
                <CardDescription>{weatherData.dateTime}</CardDescription>
              </CardHeader>

              {/* Weather Animation */}
              <WeatherAnimation condition={weatherData.condition} />

              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-bold">{weatherData.temperature}</span>
                    <div className="text-right">
                      <div className="text-lg font-medium">{weatherData.condition}</div>
                      {weatherData.description && (
                        <div className="text-sm text-muted-foreground capitalize">{weatherData.description}</div>
                      )}
                    </div>
                  </div>

                  {(weatherData.humidity || weatherData.windSpeed) && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {weatherData.humidity && (
                        <div className="bg-muted p-3 rounded-md">
                          <div className="text-sm text-muted-foreground">Humidity</div>
                          <div className="font-medium">{weatherData.humidity}</div>
                        </div>
                      )}
                      {weatherData.windSpeed && (
                        <div className="bg-muted p-3 rounded-md">
                          <div className="text-sm text-muted-foreground">Wind</div>
                          <div className="font-medium">{weatherData.windSpeed}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant={isLocationInFavorites() ? "outline" : "default"}
                  onClick={addToFavorites}
                  disabled={isLocationInFavorites()||false}
                  className="w-full"
                >
                  <Heart className={`mr-2 h-4 w-4 ${isLocationInFavorites() ? "fill-primary" : ""}`} />
                  {isLocationInFavorites() ? "Added to Favorites" : "Add to Favorites"}
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dashboard">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.length === 0 ? (
              <div className="col-span-full text-center p-8 border rounded-lg bg-muted/50">
                <p className="text-muted-foreground mb-4">You haven't added any favorite locations yet.</p>
                <Button variant="outline" onClick={() => setActiveTab("search")}>
                  <Search className="mr-2 h-4 w-4" />
                  Search for a location
                </Button>
              </div>
            ) : (
              favorites.map((favorite) => (
                <Card key={favorite.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg h-[80px] text-ellipsis">{favorite.location}</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromFavorites(favorite.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                        <span className="sr-only">Remove from favorites</span>
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Weather Animation for each favorite */}
                  {dashboardData[favorite.id] && !loadingFavorites[favorite.id] && (
                    <WeatherAnimation condition={dashboardData[favorite.id]?.condition || ""} className="h-32" />
                  )}

                  {loadingFavorites[favorite.id] && <Skeleton className="h-32 w-full" />}

                  <CardContent>
                    {loadingFavorites[favorite.id] ? (
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-10 w-full" />
                        <div className="grid grid-cols-2 gap-2">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      </div>
                    ) : dashboardData[favorite.id] ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {dashboardData[favorite.id]?.dateTime?.split("(")[0]}
                        </p>
                        <div className="flex justify-between items-center h-[64px]">
                          <span className="text-2xl font-bold">{dashboardData[favorite.id]?.temperature}</span>
                          <span className="text-right">{dashboardData[favorite.id]?.condition}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {dashboardData[favorite.id]?.humidity && (
                            <div className="bg-muted p-2 rounded">
                              <span className="text-muted-foreground">Humidity:</span>{" "}
                              {dashboardData[favorite.id]?.humidity}
                            </div>
                          )}
                          {dashboardData[favorite.id]?.windSpeed && (
                            <div className="bg-muted p-2 rounded">
                              <span className="text-muted-foreground">Wind:</span>{" "}
                              {dashboardData[favorite.id]?.windSpeed}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground">Failed to load data</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => refreshFavorite(favorite.id, favorite.name)}
                      disabled={loadingFavorites[favorite.id]}
                    >
                      {loadingFavorites[favorite.id] ? "Refreshing..." : "Refresh"}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12 max-w-2xl mx-auto text-center text-muted-foreground">
        <p className="text-sm">
          This application uses the wttr.in service to fetch weather data. Enter a location to get the current weather
          conditions and local time.
        </p>
      </div>
    </main>
  )
}

