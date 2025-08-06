const { firefox } = require('playwright');
const cheerio = require('cheerio');

async function crawlCoupang(keyword) {
  const url = `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`;
  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(url, { waitUntil: 'load' });

  try {
    await page.waitForSelector('ul#product-list', { timeout: 5000 });
  } catch (e) {
    await browser.close();
    throw new Error('Product list not found');
  }

  const html = await page.content();
  const $ = cheerio.load(html);
  const productList = $('ul#product-list');

  let firstRankedA;
  productList.find('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href.includes('rank=1')) {
      firstRankedA = $(el);
      return false; // break
    }
  });

  await browser.close();

  if (!firstRankedA) return null;

  const img = firstRankedA.find('img');
  let imgSrc = img.attr('src');
  if (imgSrc?.startsWith('//')) imgSrc = 'https:' + imgSrc;

  return imgSrc || null;
}

module.exports = crawlCoupang;



// old codes under here

/**

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter keyword: ', async (keyword) => {
  const url = `https://www.coupang.com/np/search?q=${encodeURIComponent(keyword)}`;

  const browser = await firefox.launch({ headless: true });
// 크롤링 막힐시 header 설정 변경해야 함

  const context = await browser.newContext();

  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'load' });

  try {
    await page.waitForSelector('ul#product-list', { timeout: 5000 });
    console.log('Loaded ul#product-list');
  } catch (e) {
    console.log('Element not found within 5 seconds.');
  }

  const html = await page.content();
  const $ = cheerio.load(html);

  const productList = $('ul#product-list');

  let firstRankedA;
  productList.find('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href.includes('rank=1')) {
      firstRankedA = $(el);
      return false;
    }
  });

  if (firstRankedA) {
    const img = firstRankedA.find('img');
    const imgSrc = img.attr('src');
    const fullImgSrc = imgSrc?.startsWith('//') ? 'https:' + imgSrc : imgSrc;
    const altText = img.attr('alt') || 'No alt text';
    const productLink = 'https://www.coupang.com' + firstRankedA.attr('href');

    console.log('Image URL:', fullImgSrc);
    console.log('Product Name (alt):', altText);
    console.log('Product Link:', productLink);
  } else {
    console.log('No product link with rank=1 found');
  }

  await browser.close();
  rl.close();
});

**/