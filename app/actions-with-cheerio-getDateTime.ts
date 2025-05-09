"use server"

import * as cheerio from "cheerio"

export async function scrapeWeatherWithCheerioGetDate(location: string) {
  try {

    console.log('region,country',location)
    
    // 1. Fetch the HTML content from a weather website

    const response = await fetch(`https://time.is/${location}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch data 5: ${response.status}`)
    }

    // 2. Get the HTML text content
    const html = await response.text()

    // 3. Load the HTML into cheerio (similar to jQuery)
    const $ = cheerio.load(html)

    // 4. Use CSS selectors to extract data from the HTML
    // These selectors would need to match the structure of the website you're scraping
    const time = $("#clock").text().trim()
    const date = $("#dd").text().trim()
    // const conditionText = $(".weather-condition").text().trim()

    // // 5. You can navigate the DOM just like with jQuery
    // const dateTimeText = $(".weather-date-time").text().trim()

    // // 6. You can also find elements relative to others
    // const humidityText = $('span:contains("Humidity")').next().text().trim()
    // const windSpeedText = $('span:contains("Wind")').next().text().trim()

    // 7. Return the extracted data
    return {
      time: time || "N/A",
      date: date || "N/A",
      // condition: conditionText || "N/A",
      // dateTime: dateTimeText || new Date().toLocaleString(),
      // humidity: humidityText || null,
      // windSpeed: windSpeedText || null,
    }
  } catch (error) {
    return {
      time:  "N/A",
      date:  "N/A",
      // condition: conditionText || "N/A",
      // dateTime: dateTimeText || new Date().toLocaleString(),
      // humidity: humidityText || null,
      // windSpeed: windSpeedText || null,
    }
    // console.error("Error scraping datetime data:", error)
    // throw new Error(`Failed to get datetime from Time.is for ${location} `)
  }
}

