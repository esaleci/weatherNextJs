// Example of how to install and import cheerio
// In your package.json:
// "dependencies": {
//   "cheerio": "^1.0.0-rc.12"
// }

// To install:
// npm install cheerio

// Basic cheerio usage example
import * as cheerio from "cheerio"

// Example HTML string
const html = `
  <div class="weather-card">
    <h2 class="location-name">New York, USA</h2>
    <div class="temperature">
      <span class="temperature-value">72°F</span>
    </div>
    <div class="condition">Partly Cloudy</div>
    <div class="details">
      <div class="detail-item">
        <span class="label">Humidity:</span>
        <span class="value">65%</span>
      </div>
      <div class="detail-item">
        <span class="label">Wind:</span>
        <span class="value">8 mph</span>
      </div>
    </div>
  </div>
`

// Load HTML into cheerio
const $ = cheerio.load(html)

// Extract data using CSS selectors (similar to jQuery)
const location = $(".location-name").text()
const temperature = $(".temperature-value").text()
const condition = $(".condition").text()
const humidity = $('.detail-item:contains("Humidity") .value').text()
const wind = $('.detail-item:contains("Wind") .value').text()

console.log({
  location,
  temperature,
  condition,
  humidity,
  wind,
})
// Output:
// {
//   location: 'New York, USA',
//   temperature: '72°F',
//   condition: 'Partly Cloudy',
//   humidity: '65%',
//   wind: '8 mph'
// }
