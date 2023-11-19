const { default: axios } = require('axios');
const ExcelJS = require('exceljs');

const FETCH_SIZE = 50;
const SLEEP_SECONDS = 2;

async function run() {
  const actionsList = require('./list.json');




  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Váriações');

  let data = [];
  for (let i = 0; i < actionsList.length; i++) {
    const action = actionsList[i];
    const response = await fetchData(action);
    if(!response.data) {
      console.log('🚨 Error fetching data for', action);
      continue;
    }
    data.push({ action, values: response.data.reverse() });

    // sleep
    console.log(`⏳ Sleeping for ${SLEEP_SECONDS} seconds...`);
    await new Promise(resolve => setTimeout(resolve, SLEEP_SECONDS * 1000));
  }

  // mount table
  console.log('📝 Writing data...');
  sheet.addRow(['Data', ...data.map(({ action }) => action)]);

  for (let i = 0; i < FETCH_SIZE; i++) {
    const row = [];
    row.push(data[0].values[0][0].display);
    for (let j = 0; j < data.length; j++) {
      row.push(parseFloat(data[j].values[i][3].replace(',', '.')));
    }
    sheet.addRow(row);
  }


  // save file
  console.log('💾 Saving file...');
  await workbook.xlsx.writeFile('variacoes.xlsx');
  console.log('✅ File saved!');
}

function fetchData(action) {
  try {

    console.log(`📡 Fetching data for ${action}...`);
    // formdata page=0&numberItems=50&symbol=MGLU3

    const body = new URLSearchParams();
    body.append('page', 0);
    body.append('numberItems', FETCH_SIZE);
    body.append('symbol', action);

    return axios.post("https://www.infomoney.com.br/wp-json/infomoney/v1/quotes/history", body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  } catch (e) {
    console.log(e);
  }

}


run();