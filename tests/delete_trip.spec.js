const { test, expect } = require('@playwright/test');

test('Automate ZFW Hospitality Delete Trip', async ({ page }) => {
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

  console.log('Logged in. Navigating to Valkyrie -> Trips...');
  // 5. Click on Valkyrie in the sidebar to load the correct module context
  await page.getByRole('link', { name: 'Valkyrie' }).click();
  await page.waitForTimeout(1000);

  // Navigate to Trips
  await page.goto(process.env.BASE_URL + 'pnd/trips');

  // Wait for the page to settle
  await page.waitForTimeout(2000);

  // 5. Go to "All" tab
  console.log('Going to All tab...');
  await page.getByText('All', { exact: true }).click();
  await page.waitForTimeout(1000);

  // 6. Search for the specific Trip ID
  const tripIdToDelete = process.env.TRIP_ID_TO_DELETE; // Update this with the Trip ID you want to delete
  console.log(`Searching for Trip ID: ${tripIdToDelete}...`);
  await page.getByPlaceholder('Search...').first().fill(tripIdToDelete);
  await page.waitForTimeout(2000); // Wait for the table to filter

  // Wait for the table to load after search
  await page.waitForSelector('table tbody tr', { timeout: 10000 });

  // 7. Click the 3 dots for that trip
  console.log('Clicking the 3 dots (View Details) for the trip...');
  await page.locator('table tbody tr').first().locator('img[alt="View Details"]').first().click();
  await page.waitForTimeout(1000);

  // 8. Click "Delete Trip" from the dropdown
  console.log('Clicking "Delete Trip" option...');
  await page.getByRole('button', { name: 'Delete Trip', exact: true }).click();
  await page.waitForTimeout(1000);

  // 9. Confirm the deletion in the modal
  console.log('Confirming trip deletion...');
  await page.getByRole('button', { name: 'Delete', exact: true }).click();

  console.log(`Trip ${tripIdToDelete} deleted successfully!`);

  // Wait a few seconds to visually verify
  await page.waitForTimeout(4000);
});
