const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
  
  try {
    // Go to login page
    console.log('Navigating to login page...');
    await page.goto('https://www.starsnational.com/login', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await page.waitForTimeout(3000);
    
    // Get all inputs on the page
    const inputs = await page.$$eval('input', els => els.map(e => ({
      type: e.type,
      name: e.name,
      id: e.id,
      placeholder: e.placeholder,
      class: e.className
    })));
    console.log('Found inputs:', JSON.stringify(inputs, null, 2));
    
    // Try to find by any means
    const emailField = await page.$('input[type="email"]') || 
                       await page.$('input[name*="email"]') || 
                       await page.$('input#email') ||
                       await page.$('input[placeholder*="Email"]');
    
    const passwordField = await page.$('input[type="password"]');
    
    if (emailField && passwordField) {
      console.log('Found email and password fields');
      await emailField.type('karinusry@gmail.com', { delay: 50 });
      await passwordField.type('99IMAhGi&^RvXDDq', { delay: 50 });
      
      // Find submit button
      const buttons = await page.$$eval('button', els => els.map(e => ({
        text: e.innerText,
        type: e.type,
        class: e.className
      })));
      console.log('Found buttons:', JSON.stringify(buttons, null, 2));
      
      // Click the submit button
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      
      console.log('After login URL:', page.url());
      
      // Navigate to monthly lesson
      await page.goto('https://www.starsnational.com/products/monthly-lesson', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      await page.waitForTimeout(3000);
      
      const bodyText = await page.evaluate(() => document.body.innerText);
      console.log('\n--- CONTENT ---\n');
      console.log(bodyText);
    } else {
      console.log('Could not find form fields');
      console.log('Email found:', !!emailField);
      console.log('Password found:', !!passwordField);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
})();
