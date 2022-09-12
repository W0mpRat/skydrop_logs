const xlsx = require('xlsx')
const fsp = require('fs').promises
const fs = require('fs')
const path = 'F:/LOGS/'
const IGCParser = require('igc-parser');
// const path = './flight_logs/

async function main () {
  try {
    const flight_data = []
    const years = await fsp.readdir(`${path}`)

    for (const year of years) {
      // Only log Current Year
      var d = new Date()
      var n = d.getFullYear()
      if (year !== n.toString()) {
        continue
      }
      // End only log current year
      const days = await fsp.readdir(`${path}${year}`)

      for (const day of days) {
        const flights = await fsp.readdir(`${path}${year}/${day}`)

        for (const flight of flights) {
          const flight_file = await fsp.readFile(`${path}${year}/${day}/${flight}`, 'utf8')
          // console.log(flight_file)
          const regex = /(?<=LXSB  SKYDROP-DURATION-ms: )\d+(?= )/;
          if ((m = regex.exec(flight_file)) !== null) {
            let result = IGCParser.parse(flight_file);

            m.forEach((match, groupIndex) => {
              if (parseInt(m) < 10000) {
                // Delete the flight if less than 10 seconds
                fs.unlinkSync(`${path}${year}/${day}/${flight}`)
                console.error(flight)
              } else {
                flight_data.push({
                  year: year,
                  day: day,
                  fileName: flight,
                  date: getFormattedDate(new Date(year, parseInt(day.substring(0,2))-1, day.substring(3))),
                  make: 'PHI',
                  model: 'MAESTRO',
                  size: '19',
                  site: null,
                  durationMinutes: parseInt(match) / 60000,
                  durationMilliseconds: match,
                })
              }
            });
          } else {
            // fs.unlinkSync(`${path}${year}/${day}/${flight}`)
          }
        }
      }
    }
    console.log(flight_data)

    const filename = `${getFileNameFormattedDate(new Date())}_flight_data_export.xlsx`
    let wb = xlsx.utils.book_new()
    let ws = xlsx.utils.json_to_sheet(flight_data)
    ws['!sort'] = true
    ws['!autofilter'] = { ref: 'A1:BP1' }
    const wsName = 'Project Data'
    xlsx.utils.book_append_sheet(wb, ws, wsName)
    xlsx.writeFile(wb, filename)
  } catch (error) {
    throw error
  }
}

main().catch((error) => {
  console.error(error)
})

function getFormattedDate(date) {
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, '0');
  let day = date.getDate().toString().padStart(2, '0');

  return month + '/' + day + '/' + year;
}

function getFileNameFormattedDate(date) {
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, '0');
  let day = date.getDate().toString().padStart(2, '0');

  return month + '_' + day + '_' + year;
}

function calcCrow (coords1, coords2) {
  // var R = 6.371; // km
  var R = 6371000
  var dLat = toRad(coords2.lat - coords1.lat)
  var dLon = toRad(coords2.lng - coords1.lng)
  var lat1 = toRad(coords1.lat)
  var lat2 = toRad(coords2.lat)

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  var d = R * c
  return d
}

// Converts numeric degrees to radians
function toRad (Value) {
  return Value * Math.PI / 180
}