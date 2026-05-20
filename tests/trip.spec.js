const { test, expect } = require('@playwright/test');

test('Automate ZFW Hospitality Login and Create Trip', async ({ page }) => {
  test.setTimeout(90000); // Increased timeout to 90 seconds
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

  // --- NEW WORKFLOW ---
  console.log('Logged in. Navigating to Valkyrie -> Deliveries...');

  // 5. Click on Valkyrie in the sidebar
  await page.getByRole('link', { name: 'Valkyrie' }).click();

  // 6. Click on Deliveries
  await page.getByRole('link', { name: 'Deliveries' }).click();

  // 7. Click on Create Trip
  await page.getByRole('button', { name: 'Create Trip' }).click();

  // 8. Search for AWBs
  console.log('Searching for AWBs...');
  const awbString = process.env.AWB_NUMBER || '';
  const awbs = awbString.split(',').map(awb => awb.trim()).filter(Boolean);
  const searchInput = page.locator('input[placeholder="Search..."]').first();

  for (const awb of awbs) {
    console.log(`Searching and selecting AWB: ${awb}`);
    await searchInput.fill('');
    await page.waitForTimeout(500); // small delay after clearing
    await searchInput.fill(awb);
    // Wait a short moment for the table to filter the results
    await page.waitForTimeout(2000);
    // 9. Select the specific AWB checkbox
    await page.locator('input[type="checkbox"]').nth(1).check();
  }

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
  console.log('Assigning Rider to Awanit Kumar Singh...');
  await page.waitForTimeout(2000); // let the page settle

  // Click the searchable dropdown (which shows "Select...") using force to bypass the sticky navbar
  await page.getByText('Select...').first().click({ force: true });
  await page.waitForTimeout(500);
  
  // Type the rider name using keyboard (common for react-select components)
  await page.keyboard.type(process.env.RIDER_NAME);
  await page.waitForTimeout(1000);
  
  // Use keyboard to select the option (ArrowDown to highlight, Enter to select)
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(200);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);

  // Click the correct Assign Rider button
  await page.getByRole('button', { name: 'Assign Rider', exact: true }).click();

  console.log('Rider assigned successfully!');






  // console.log('Logged in. Navigating to Valkyrie -> Trips...');
  //   // 5. Click on Valkyrie in the sidebar to load the correct module context
  //   await page.getByRole('link', { name: 'Valkyrie' }).click();
  //   await page.waitForTimeout(1000);

  //   // Navigate to Trips
  //   await page.goto(process.env.BASE_URL + 'pnd/trips');

  //   // Wait for the page to settle
  //   await page.waitForTimeout(2000);

  //   // 5. Go to "All" tab
  //   console.log('Going to All tab...');
  //   await page.getByText('All', { exact: true }).click();
  //   await page.waitForTimeout(1000);

  //   // 6. Search for the specific Trip ID
  //   const tripIdToDelete = `${tripId}`; // Update this with the Trip ID you want to delete
  //   console.log(`Searching for Trip ID: ${tripIdToDelete}...`);
  //   await page.getByPlaceholder('Search...').first().fill(tripIdToDelete);
  //   await page.waitForTimeout(2000); // Wait for the table to filter

  //   // Wait for the table to load after search
  //   await page.waitForSelector('table tbody tr', { timeout: 10000 });

  //   // 7. Click the 3 dots for that trip
  //   console.log('Clicking the 3 dots (View Details) for the trip...');
  //   await page.locator('table tbody tr').first().locator('img[alt="View Details"]').first().click();
  //   await page.waitForTimeout(1000);

  //   // 8. Click "Delete Trip" from the dropdown
  //   console.log('Clicking "Delete Trip" option...');
  //   await page.getByRole('button', { name: 'Delete Trip', exact: true }).click();
  //   await page.waitForTimeout(1000);

  //   // 9. Confirm the deletion in the modal
  //   console.log('Confirming trip deletion...');
  //   await page.getByRole('button', { name: 'Delete', exact: true }).click();

  //   console.log(`Trip ${tripIdToDelete} deleted successfully!`);







  // Wait 4 seconds at the end so you can visually verify the result before the browser closes!
  await page.waitForTimeout(4000);
});
