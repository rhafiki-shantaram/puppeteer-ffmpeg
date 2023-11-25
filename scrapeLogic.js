const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async(res) => {
    
    // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath: process.env.NODE_ENV === 'production' ? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath()
  });

  try {    
        
    const page = await browser.newPage();

    // Navigate the page to a URL
    await page.goto('https://developer.chrome.com/');

    // Set screen size
    await page.setViewport({width: 1080, height: 1024});

    // Type into search box
    await page.type('.search-box__input', 'modify');

    // Wait and click on first result
    const searchResultSelector = '.search-box__link';
    await page.waitForSelector(searchResultSelector);
    await page.click(searchResultSelector);

    // Locate the full title with a unique string
    await page.waitForSelector('h1');
    const fullTitle = await page.$eval('h1', h1 => h1.textContent);


    // Print the full title
    const logStatement = `The title of this blog post is ${fullTitle}`
    console.log(logStatement);
    res.send(logStatement);

  } catch (e) {
    
    const err = `Error: ${e}`;
    console.log(err);
    res.send(err)

  } finally {
    
    await browser.close();

  }

};

module.exports = { scrapeLogic };    