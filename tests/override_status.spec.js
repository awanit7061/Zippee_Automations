const { test, expect } = require('@playwright/test');

test.use({ headless: false });

test('Automate Override Status', async ({ page }) => {
  test.setTimeout(120000); // 120 seconds timeout
  console.log('Navigating to the site...');
  await page.goto(process.env.BASE_URL);

  // 1. Login
  await page.locator('#email').fill(process.env.USER_EMAIL);
  await page.getByRole('button', { name: 'Continue with Email' }).click();
  await page.getByPlaceholder('Password').fill(process.env.USER_PASSWORD);
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  // 2. Navigate to Valkyrie -> Deliveries
  console.log('Navigating to Valkyrie -> Deliveries...');
  await page.waitForTimeout(2000);
  await page.getByRole('link', { name: 'Valkyrie', exact: true }).click();
  await page.getByRole('link', { name: 'Deliveries', exact: true }).click();
  
  // 3. Go to All Shipments
  console.log('Navigating to All Shipments...');
  await page.waitForTimeout(2000);
  await page.getByText('All Shipments', { exact: true }).click();
  await page.waitForTimeout(2000);

  const statuses = process.env.OVERRIDE_STATUSES ? process.env.OVERRIDE_STATUSES.split(',') : ['DELIVERED', 'CANCELLED', 'RTO', 'READY', 'DELIVERY_ATTEMPTED'];
  const awbNumber = process.env.OVERRIDE_AWB;
  const targetReason = process.env.OVERRIDE_REASON;

  for (const status of statuses) {
    console.log(`Processing status override for ${status}...`);
    
    // Search for AWB number
    const searchInput = page.getByPlaceholder('Search...', { exact: false }).first();
    await searchInput.fill(''); // Clear first
    await searchInput.fill(awbNumber);
    
    // Wait for the table to filter
    await page.waitForTimeout(2000);
    await page.waitForSelector('table tbody tr');

    // Click on three dots (action menu) in the last column
    console.log('Clicking the options menu (three dots) for the shipment...');
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.locator('td').last().click();
    await page.waitForTimeout(1000);

    // Click on Override Status
    console.log('Clicking Override Status...');
    await page.getByText('Override Status', { exact: true }).click();
    await page.waitForTimeout(1000);

    // Select Change Status dropdown
    // Click Change Status dropdown
    console.log(`Setting status to ${status}...`);
    await page.getByRole('combobox').last().click();
    await page.waitForTimeout(500);
    // Click the status option
    await page.getByText(status, { exact: true }).last().click();
    
    // Wait for Reason radio buttons to appear (if any) and select the reason
    console.log(`Checking for reason ${targetReason}...`);
    await page.waitForTimeout(1000);
    const reasonOption = page.getByText(targetReason, { exact: true });
    
    if (await reasonOption.isVisible()) {
      console.log(`Reason option found! Selecting ${targetReason}...`);
      await reasonOption.click();
    }

    // Click Update
    console.log('Clicking Update...');
    await page.getByRole('button', { name: 'Update', exact: true }).click();
    await page.waitForTimeout(2000); // Wait for update to process and modal to close
  }

  console.log('Successfully completed override status flow for all statuses!');

  // Wait 4 seconds at the end so you can visually verify the result before the browser closes!
  await page.waitForTimeout(4000);
});
