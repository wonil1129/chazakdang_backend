const ExcelJS = require('exceljs');
const db = require('../../config/db');
const path = require('path');
require('dotenv').config();
console.log(process.env.DB_USER, process.env.DB_PASS);


function formatColumnName(name) {
  return name
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

(async () => {
  const filePath = path.join(__dirname, '../../data/food_data.xlsx');
  const stream = new ExcelJS.stream.xlsx.WorkbookReader(filePath);

  let headers = null;
  let tableCreated = false;

  for await (const worksheet of stream) {
    console.log('Reading sheet:', worksheet.name);
    let rowNum = 0;

    for await (const row of worksheet) {
      rowNum++;
      const values = row.values.slice(1);

      if (rowNum === 1) {
        headers = values.map(formatColumnName);

        // Create table
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS food_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ${headers.map(col => `\`${col}\` TEXT`).join(',\n')}
          ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `;

        await new Promise((resolve, reject) => {
          db.query(createTableSQL, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });

        tableCreated = true;
        continue;
      }

      if (!tableCreated) continue; // Shouldn't happen, but safety check

      const insertSQL = `
        INSERT INTO food_data (${headers.map(col => `\`${col}\``).join(', ')})
        VALUES (${headers.map(() => '?').join(', ')})
      `;

      await new Promise((resolve, reject) => {
        db.query(insertSQL, values, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }
  }

  console.log('Import complete!');
})();
