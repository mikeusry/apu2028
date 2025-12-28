const { chromium } = require('playwright');
const fs = require('fs');

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
  
  let allContent = [];
  
  try {
    // Login
    console.log('Logging in...');
    await page.goto('https://www.starsnational.com/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    await page.fill('#member_email', 'karinusry@gmail.com');
    await page.fill('#member_password', '99IMAhGi&^RvXDDq');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    console.log('Logged in, navigating to library...');
    
    // Go to monthly lesson
    await page.goto('https://www.starsnational.com/products/monthly-lesson', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Get all lesson links
    const lessonLinks = await page.$$eval('a[href*="/lessons/"], a[href*="/posts/"]', els => 
      els.map(e => ({ href: e.href, text: e.innerText.trim() }))
    );
    
    console.log(`Found ${lessonLinks.length} lessons/posts`);
    
    // Get unique links
    const uniqueLinks = [...new Map(lessonLinks.map(l => [l.href, l])).values()];
    
    // Visit key template lessons
    const templateKeywords = ['email', 'twitter', 'template', 'text', 'juniors', 'seniors'];
    const templateLessons = uniqueLinks.filter(l => 
      templateKeywords.some(kw => l.text.toLowerCase().includes(kw))
    );
    
    console.log(`\nTemplate-related lessons: ${templateLessons.length}`);
    
    for (const lesson of templateLessons.slice(0, 10)) {
      console.log(`\n--- Fetching: ${lesson.text} ---`);
      
      try {
        await page.goto(lesson.href, { waitUntil: 'networkidle', timeout: 20000 });
        await page.waitForTimeout(2000);
        
        const content = await page.evaluate(() => {
          const main = document.querySelector('.post-body, .lesson-content, main, article, .content');
          return main ? main.innerText : document.body.innerText;
        });
        
        allContent.push({
          title: lesson.text,
          url: lesson.href,
          content: content
        });
        
        console.log(content.substring(0, 1500));
        console.log('\n---\n');
        
      } catch (e) {
        console.log('Error fetching:', e.message);
      }
    }
    
    // Save all content
    fs.writeFileSync('stars-templates-content.json', JSON.stringify(allContent, null, 2));
    console.log('\nSaved content to stars-templates-content.json');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
