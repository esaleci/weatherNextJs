"use server"

import * as cheerio from "cheerio"

export async function scrapeWeatherWithCheerio(location: string) {
  try {
    // 1. Fetch the HTML content from a weather website
    const response = await fetch(`https://weather.example.com/search?q=${encodeURIComponent(location)}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`)
    }

    // 2. Get the HTML text content
    const html = await response.text()

    // 3. Load the HTML into cheerio (similar to jQuery)
    const $ = cheerio.load(html)

    // 4. Use CSS selectors to extract data from the HTML
    // These selectors would need to match the structure of the website you're scraping
    const locationText = $(".location-name").text().trim()
    const temperatureText = $(".temperature-value").text().trim()
    const conditionText = $(".weather-condition").text().trim()

    // 5. You can navigate the DOM just like with jQuery
    const dateTimeText = $(".weather-date-time").text().trim()

    // 6. You can also find elements relative to others
    const humidityText = $('span:contains("Humidity")').next().text().trim()
    const windSpeedText = $('span:contains("Wind")').next().text().trim()

    // 7. Return the extracted data
    return {
      location: locationText || location,
      temperature: temperatureText || "N/A",
      condition: conditionText || "N/A",
      dateTime: dateTimeText || new Date().toLocaleString(),
      humidity: humidityText || null,
      windSpeed: windSpeedText || null,
    }
  } catch (error) {
    console.error("Error scraping weather data:", error)
    throw new Error(`Failed to get weather data for ${location}`)
  }
}
