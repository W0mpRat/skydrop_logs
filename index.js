const xlsx = require('xlsx')
const fsp = require('fs').promises
const fs = require('fs')
const path = 'F:/LOGS/'
// const path = './flight_logs/

async function main () {
  try {
    const flight_data = []
    const years = await fsp.readdir(`${path}`)

    for (const year of years) {
      const days = await fsp.readdir(`${path}${year}`)

      for (const day of days) {
        const flights = await fsp.readdir(`${path}${year}/${day}`)

        for (const flight of flights) {
          const flight_file = await fsp.readFile(`${path}${year}/${day}/${flight}`, 'utf8')
          // console.log(flight_file)
          const regex = /(?<=LXSB  SKYDROP-DURATION-ms: )\d+(?= )/;
          if ((m = regex.exec(flight_file)) !== null) {

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
                  model: 'SYMPHONIA',
                  size: '22',
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