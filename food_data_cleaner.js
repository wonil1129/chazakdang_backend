require('dotenv').config();
const db = require('./config/db'); // adjust path if needed

async function checkAndAlterColumns() {
  // Get all text columns from food_data
  const [columns] = await db.promise().query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'food_data'
      AND DATA_TYPE IN ('text', 'varchar', 'char')
  `);

  for (const col of columns) {
    const colName = col.COLUMN_NAME;

    // Check if all non-null values are integers
    const [[intCheck]] = await db.promise().query(
      `SELECT COUNT(*) AS not_int_count FROM food_data WHERE \`${colName}\` IS NOT NULL AND \`${colName}\` <> '' AND \`${colName}\` NOT REGEXP '^-?[0-9]+$'`
    );

    if (intCheck.not_int_count === 0) {
      // all ints! alter to INT
      console.log(`Altering column \`${colName}\` to INT`);
      await db.promise().query(`ALTER TABLE food_data MODIFY COLUMN \`${colName}\` INT NULL`);
      continue;
    }

    // Check if all non-null values are floats
    const [[floatCheck]] = await db.promise().query(
      `SELECT COUNT(*) AS not_float_count FROM food_data WHERE \`${colName}\` IS NOT NULL AND \`${colName}\` <> '' AND \`${colName}\` NOT REGEXP '^-?[0-9]+(\\.[0-9]+)?$'`
    );

    if (floatCheck.not_float_count === 0) {
      // all floats! alter to FLOAT
      console.log(`Altering column \`${colName}\` to FLOAT`);
      await db.promise().query(`ALTER TABLE food_data MODIFY COLUMN \`${colName}\` FLOAT NULL`);
      continue;
    }

    console.log(`Column \`${colName}\` is not numeric, skipping`);
  }

  console.log('Done!');
  process.exit(0);
}

checkAndAlterColumns().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
