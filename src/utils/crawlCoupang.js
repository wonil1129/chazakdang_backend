// THIS FILE IS DEPRECATED AND NOT USED ANYMORE

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