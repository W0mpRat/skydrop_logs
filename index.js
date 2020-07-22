const xlsx = require('xlsx')
const fsp = require('fs').promises

async function main () {
  try {
    const years = await fsp.readdir('./flight_logs')

    for (const year of years) {
      const days = await fsp.readdir(`./flight_logs/${year}`)

      for (const day of days) {
        const flights = await fsp.readdir(`./flight_logs/${year}/${day}`)

        console.log(flights)
      }
    }
  } catch (error) {
    
  }
}

main().catch((error) => {
  console.error(error)
})