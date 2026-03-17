const XLSX = require('xlsx');
const path = require('path');

const filePath = "C:/Users/tgarci02/OneDrive - Kearney/Documents/Proyectos/Claro/07. Madurez/Cuestionario/Kearney_Claro_DO_AE_Encuesta_Stages_of_Excellence.xlsx";

const workbook = XLSX.readFile(filePath, { cellStyles: true, cellNF: true, cellHTML: true });

console.log("=== SHEET NAMES ===");
console.log(JSON.stringify(workbook.SheetNames, null, 2));

for (const sheetName of workbook.SheetNames) {
  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`SHEET: "${sheetName}"`);
  console.log('='.repeat(80));

  const sheet = workbook.Sheets[sheetName];

  // Get the range
  const range = sheet['!ref'];
  console.log(`Range: ${range}`);

  if (!range) {
    console.log("(empty sheet)");
    continue;
  }

  // Convert to array of arrays with raw values
  const data = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    raw: false,
    blankrows: true
  });

  console.log(`Rows: ${data.length}`);

  for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
    const row = data[rowIdx];
    if (row.some(cell => cell !== '')) {
      console.log(`\nRow ${rowIdx + 1}: ${JSON.stringify(row)}`);
    }
  }
}
