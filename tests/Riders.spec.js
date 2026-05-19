const { test, expect } = require('@playwright/test');

test.use({ headless: false });

test('Automate Rider Verification Rejection', async ({ page }) => {
  test.setTimeout(120000); // 120 seconds timeout
  console.log('Navigating to the site...');
  await page.goto(process.env.BASE_URL);

  // 1. Login
  await page.locator('#email').fill(process.env.USER_EMAIL);
  await page.getByRole('button', { name: 'Continue with Email' }).click();
  await page.getByPlaceholder('Password').fill(process.env.USER_PASSWORD);
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  // 2. Navigate to COD -> Riders
  console.log('Navigating to COD -> Riders...');
  await page.waitForTimeout(2000); // wait for dashboard to load after login
  await page.getByRole('link', { name: 'COD', exact: true }).click();
  await page.getByRole('link', { name: 'Riders', exact: true }).click();
  
  // Wait for the page to load
  await page.waitForTimeout(2000);

  // 3. Search rider in Rider Name Search field
  console.log(`Searching for Rider ${process.env.RIDER_NAME}...`);
  const searchInput = page.getByPlaceholder('Search rider name', { exact: false });
  await searchInput.first().click();
  await searchInput.first().fill(process.env.RIDER_NAME);
  
  // Wait for the table to filter
  await page.waitForTimeout(2000);
  await page.waitForSelector('table tbody tr');

  // 4. Click the options menu (three lines) in the last column
  console.log('Clicking the options menu for the rider...');
  const firstRow = page.locator('table tbody tr').first();
  await firstRow.locator('td').last().click();

  await page.waitForTimeout(1000);

  // 5. Click on all documents and set their status
  const documents = ['PAN', 'Aadhaar', 'Vehicle', 'Driving License', 'Selfie'];
  const targetStatus = process.env.DOCUMENT_STATUS || 'Rejected';

  for (const doc of documents) {
    console.log(`Setting ${doc} to ${targetStatus} and saving...`);
    // Click the document tab/section
    await page.getByText(doc, { exact: true }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('combobox', { name: 'Status' }).selectOption(targetStatus);

    // Enter Reason only if status is Rejected
    if (targetStatus === 'Rejected') {
      await page.waitForTimeout(500);
      await page.getByPlaceholder(/reason/i).fill(process.env.REJECT_REASON);
    }

    // Save
    await page.getByRole('button', { name: 'Save' }).first().click();
    await page.waitForTimeout(1000);
  }

  console.log(`Successfully processed all documents for the rider with status: ${targetStatus}!`);

  // Wait 4 seconds at the end so you can visually verify the result before the browser closes!
  await page.waitForTimeout(4000);
});
