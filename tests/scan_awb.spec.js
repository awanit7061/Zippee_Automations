const { test, expect } = require('@playwright/test');

test.use({ headless: false });

test.describe('Scan AWB Numbers on Trip Page', () => {

  test('Create Trip and Scan AWBs', async ({ page }) => {
    test.setTimeout(120000); // 120 seconds for the whole workflow
    console.log('Navigating to the site...');
    await page.goto(process.env.BASE_URL);

    // 1. Locate the email field and type the username
    await page.locator('#email').fill(process.env.USER_EMAIL);

    // 2. Click the continue button
    await page.getByRole('button', { name: 'Continue with Email' }).click();

    // 3. Enter the password
    await page.getByPlaceholder('Password').fill(process.env.USER_PASSWORD);

    // 4. Click the final Login button
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    console.log('Logged in. Navigating to Valkyrie -> Deliveries...');

    // 5. Click on Valkyrie in the sidebar
    await page.getByRole('link', { name: 'Valkyrie' }).click();

    // 6. Click on Deliveries
    await page.getByRole('link', { name: 'Deliveries' }).click();

    // 7. Click on Create Trip
    await page.getByRole('button', { name: 'Create Trip' }).click();

    // 8. Search for AWB from AWB_NUMBER in .env
    console.log('Searching for AWB_NUMBER...');
    const awbNumber = process.env.AWB_NUMBER || '';
    const searchInput = page.locator('input[placeholder="Search..."]').first();

    console.log(`Searching and selecting AWB: ${awbNumber}`);
    await searchInput.fill('');
    await page.waitForTimeout(500); // small delay after clearing
    await searchInput.fill(awbNumber);
    // Wait a short moment for the table to filter the results
    await page.waitForTimeout(2000);
    // 9. Select the specific AWB checkbox
    await page.locator('input[type="checkbox"]').nth(1).check();

    // 10. Click Add Shipments
    console.log('Adding Shipments...');
    await page.getByRole('button', { name: 'Add Shipments' }).click();

    console.log('Trip creation workflow completed! Extracting Trip ID...');

    // Wait for the Trip ID to be visible on the new page
    await page.waitForSelector('text="Trip ID"');

    // Extract the trip ID text
    const tripId = await page.locator('xpath=//span[text()="Trip ID"]/following-sibling::span').innerText();
    console.log(`Extracted Trip ID: ${tripId}`);

    console.log('Navigating to Trips list to search for the newly created trip...');
    await page.goto(process.env.BASE_URL + 'pnd/trips');

    // Go to "All" tab
    console.log('Going to All tab...');
    await page.getByText('All', { exact: true }).click();
    await page.waitForTimeout(1000);

    // Search for the extracted Trip ID
    console.log(`Searching for Trip ID: ${tripId}...`);
    await page.getByPlaceholder('Search...').first().fill(tripId);
    await page.waitForTimeout(2000); // Wait for the table to filter

    // Wait for the table to load
    await page.waitForSelector('table tbody tr');

    console.log('Clicking on the searched Trip ID...');
    await page.locator('table tbody tr').first().locator('td a').first().click();

    // Now we are on the Trip Details page
    console.log('Navigated to Trip details page. Finding "Scan" button...');
    await page.waitForTimeout(2000); // let the page settle

    // 11. Find and click the "Scan" button
    console.log('Clicked "Scan" button. Waiting for page/modal to load...');
    await page.getByRole('button', { name: 'Scan', exact: true }).click();

    // Wait for the new view/modal to load
    await page.waitForTimeout(3000);
    console.log('Scan view opened successfully!');

    // 12. Find "Scan AWB number ..." input field and insert AWBs one by one
    console.log('Inserting AWBs one by one...');
    const scanInput = page.locator('input[placeholder*="Scan AWB"]');

    // Read Dynamic AWBs
    const dynamicAwbsString = process.env.Dynamic_AWBs || '';
    const dynamicAwbs = dynamicAwbsString.split(',').map(awb => awb.trim()).filter(Boolean);

    for (const awb of dynamicAwbs) {
      console.log(`Scanning AWB: ${awb}`);
      await scanInput.fill(awb);
      
      // Automatically adds, so no need for Enter
      // Wait for the scan to process before the next one
      await page.waitForTimeout(1500);
    }

    console.log('All AWBs scanned successfully!');

    // 13. Click on the cross button to close the modal/view
    console.log('Clicking on cross button to close...');
    
    try {
      // The X button is an SVG inside a button with class "text-xl text-black"
      const crossButton = page.locator('button.text-xl.text-black, button:has(svg[viewBox="0 0 512 512"]), text="X", button[aria-label="Close"]').first();
      await crossButton.click({ force: true, timeout: 5000 });
      console.log('Cross button clicked successfully.');
    } catch (error) {
      console.log('Could not find the cross button with default locators within 5 seconds. You may need to update the locator.');
    }

    // Wait a few seconds at the end so you can visually verify the result before the browser closes!
    await page.waitForTimeout(5000);
  });
});
