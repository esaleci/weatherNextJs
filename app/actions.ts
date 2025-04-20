"use server"

import { text } from "stream/consumers"
import { scrapeWeatherWithCheerioGetDate } from "./actions-with-cheerio-getDateTime"

interface WttrResponse {
  current_condition: Array<{
    temp_C: string
    temp_F: string
    weatherDesc: Array<{ value: string }>
    humidity: string
    windspeedKmph: string
    observation_time: string
    FeelsLikeC:string
    visibilityMiles:string
    precipInches:string
    uvIndex:string
    winddirDegree:string
    windspeedMiles:string

  }>
  nearest_area: Array<{
    areaName: Array<{ value: string }>
    country: Array<{ value: string }>
    region: Array<{ value: string }>
  }>
  weather: Array<{
    date: string
    avgtempC:string,

    astronomy: Array<{
      sunrise: string
      sunset: string
    }>
    hourly:Array<
      {
          DewPointC: string
          FeelsLikeC:string
          tempC:string
          weatherDesc: Array<{ value: string }>
          humidity: string
          time:string
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

    
    // const responseGetLatlon = await fetch(
    //   // `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,daily&appid=4b0b770bd77669733201ac086a4284b3`,
    //   `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=2&appid=4b0b770bd77669733201ac086a4284b3`,
    //   { next: { revalidate: 1800 } }, // Cache for 30 minutes
    // )

    // if (!responseGetLatlon.ok) {
    //   if (responseGetLatlon.status === 404) {
    //     throw new Error(`Location "${location}" not found. Please check the spelling and try again.`)
    //   }
    //   throw new Error(`Weather service error: ${responseGetLatlon.status}`)
    // }

    // const datalat = (await responseGetLatlon.json()) 

    // const response = await fetch(
    //   // `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,daily&appid=4b0b770bd77669733201ac086a4284b3`,
    //   // `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=4b0b770bd77669733201ac086a4284b3`,
    //   `https://api.openweathermap.org/data/3.0/onecall?lat=${datalat[0]?.lat}&lon=${datalat[0]?.lon}&exclude=hourly,daily&appid=4b0b770bd77669733201ac086a4284b3`,
    //   { next: { revalidate: 1800 } }, // Cache for 30 minutes
    // )



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
    const weather = data.weather[0]

    // Format the location
    const cityName = area.areaName[0].value
    const region = area.region[0].value
    const country = area.country[0].value
    const locationString = region ? `${cityName}, ${region}, ${country}` : `${cityName}, ${country}`


        const responsegetTime =await scrapeWeatherWithCheerioGetDate(location);
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

    const MilitaryTime=[
      {value:'0',text:'12:00 AM'},
      {value:'300',text:'3:00 AM'},
      {value:'600',text:'6:00 AM'},
      {value:'900',text:'9:00 AM'},
      {value:'1200',text:'12:00 PM'},
      {value:'1500',text:'3:00 PM'},
      {value:'1800',text:'6:00 PM'},
      {value:'2100',text:'9:00 PM'},
    
    ]
    
    
    const madeHourly=data?.weather[0]?.hourly.map((day,index)=>{

      return {
       time:MilitaryTime.find(f=>f.value==day.time)?.text ,
       temp: day?.tempC || "0°", condition: day?.weatherDesc[0].value || "Clear"
      }
    })
    const madeDaily=data.weather?.map((day,index)=>{

      return {
        day: index==0? "Today" : day.date,
        date: day.date,
        temp: day?.avgtempC || "0°",
        condition: day?.hourly?.map((c)=>(c.weatherDesc[0].value)).join(' ') || "Clear",
      }
    })

    return {
      locationquery:encodeURIComponent(location),
      location: locationString,
      temperature: `${current.temp_C}°C (${current.temp_F}°F)`,
      condition: current.weatherDesc[0].value,
      dateTime:`${responsegetTime.date} ${responsegetTime.time}`, //`${formattedDateTime} (Observation time: ${current.observation_time})`,
      humidity: `${current.humidity}%`,
      windSpeed: `${current.windspeedKmph} km/h`,
      uvindex:current.uvIndex,
      feelsLike:current.FeelsLikeC,
      precip:`${current.precipInches} "`,
      visibility:`${current.visibilityMiles} mi`,
      windDegree:current.winddirDegree,
      windmi:`${current.windspeedMiles}`,
      windkmp:`${current.windspeedKmph}`,
      sunrise:`${weather.astronomy[0].sunrise}`,
      sunset:`${weather.astronomy[0].sunset}`,
      weatherhorly:madeHourly,
      weathers: madeDaily,
      lat:'',
      lon:'',
    }
  } catch (error) {
    console.error("Error fetching weather data:", error)
    throw error instanceof Error ? error : new Error(`Failed to get weather data for ${location}`)
  }
}
