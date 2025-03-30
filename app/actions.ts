"use server"

import { scrapeWeatherWithCheerio } from "./actions-with-cheerio"

interface WttrResponse {
  current_condition: Array<{
    temp_C: string
    temp_F: string
    weatherDesc: Array<{ value: string }>
    humidity: string
    windspeedKmph: string
    observation_time: string
  }>
  nearest_area: Array<{
    areaName: Array<{ value: string }>
    country: Array<{ value: string }>
    region: Array<{ value: string }>
    datetime:string
  }>
  weather: Array<{
    date: string
    astronomy: Array<{
      sunrise: string
      sunset: string
    }>
  }>
}

export async function scrapeWeatherData(location: string) {
  try {
    // Use wttr.in service which doesn't require an API key
    const response = await fetch(
      `https://wttr.in/${encodeURIComponent(location)}?format=j1`,
      { next: { revalidate: 1800 } }, // Cache for 30 minutes
    )

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Location "${location}" not found. Please check the spelling and try again.`)
      }
      throw new Error(`Weather service error: ${response.status}`)
    }

    const data = (await response.json()) as WttrResponse

    

    // Check if we have the data we need
    if (!data.current_condition?.[0] || !data.nearest_area?.[0]) {
      throw new Error(`No weather data available for "${location}"`)
    }

    const current = data.current_condition[0]
    const area = data.nearest_area[0]

    // Format the location
    const cityName = area.areaName[0].value
    const region = area.region[0].value
    const country = area.country[0].value
    const locationString = region ? `${cityName}, ${region}, ${country}` : `${cityName}, ${country}`

    const responsegetTime =await scrapeWeatherWithCheerio(location);
    console.log('get time here',responsegetTime)

    // Get the local date and time
    const localDate = new Date()
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }
    const formattedDateTime = localDate.toLocaleDateString("en-US", options)

    return {
      locationquery:encodeURIComponent(location),
      location: locationString,
      temperature: `${current.temp_C}°C (${current.temp_F}°F)`,
      condition: current.weatherDesc[0].value,
      dateTime: `${responsegetTime.date} ${responsegetTime.time}`,//${formattedDateTime} (Observation 
      humidity: `${current.humidity}%`,
      windSpeed: `${current.windspeedKmph} km/h`,
    }
  } catch (error) {
    console.error("Error fetching weather data:", error)
    throw error instanceof Error ? error : new Error(`Failed to get weather data for ${location}`)
  }
}

