const chalk = require('chalk');

const scraperLog = (...args) => console.log(chalk.blue(...args));

function getScraper(page, browser) {
  async function removeElementBySelector(sel) {
    scraperLog('removeElementBySelector');
    await page.evaluate((sel) => {
      var elements = document.querySelectorAll(sel);
      for (var i = 0; i < elements.length; i++) {
        elements[i].parentNode.removeChild(elements[i]);
      }
    }, sel);
  }

  // puppeteer doesn't support the :contains selector (not part of the spec)
  // we _could_ include sizzle in the eval, but that's just brutal
  function waitForText(sel, texts) {
    texts = Array.isArray(texts) ? texts : [texts];
    const textStr = JSON.stringify(texts);
    const evalStr = `${textStr}.includes(document.querySelector(${JSON.stringify(sel)}).innerText.trim())`;
    scraperLog('waitForText', evalStr);
    return page.waitForFunction(evalStr);
  }

  async function clickOnText(sel, texts) {
    texts = Array.isArray(texts) ? texts : [texts];
    const textStr = JSON.stringify(texts);
    const evalStr = [
      `const el = document.querySelector(${JSON.stringify(sel)});`,
      `const text = (el || "").innerText.trim();`,
      `if (${textStr}.includes(text)) el.click();`,
    ].join('');
    scraperLog('waitForText', evalStr);
    await waitForText(sel, texts);
    return page.evaluate(evalStr);
  }

  return {
    removeElementBySelector,
    waitForText,
    clickOnText,
  };
}

module.exports = {
  getScraper,
};
