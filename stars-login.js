const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Go to the page
    await page.goto('https://www.starsnational.com/products/monthly-lesson', { waitUntil: 'networkidle' });
    
    console.log('Page title:', await page.title());
    console.log('Current URL:', page.url());
    
    // Get the body text first to see what we have
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('\n--- INITIAL PAGE ---\n');
    console.log(bodyText.substring(0, 3000));
    
    // Look for login form
    const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i], input[id*="email" i]');
    const passwordInput = await page.$('input[type="password"], input[name="password"]');
    
    if (emailInput && passwordInput) {
      console.log('\n--- FOUND LOGIN FORM, ATTEMPTING LOGIN ---\n');
      await emailInput.fill('karinusry@gmail.com');
      await passwordInput.fill('99IMAhGi&^RvXDDq');
      
      // Find and click submit button
      const submitButton = await page.$('button[type="submit"], input[type="submit"], button:has-text("Sign in"), button:has-text("Log in"), button:has-text("Login"), button:has-text("Submit")');
      if (submitButton) {
        await submitButton.click();
        await page.waitForTimeout(5000);
        await page.waitForLoadState('networkidle');
        
        console.log('After login URL:', page.url());
        const afterLoginText = await page.evaluate(() => document.body.innerText);
        console.log('\n--- AFTER LOGIN ---\n');
        console.log(afterLoginText.substring(0, 15000));
      }
    } else {
      console.log('No login form found on page');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
