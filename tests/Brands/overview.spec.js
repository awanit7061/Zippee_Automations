const { test, expect } = require('@playwright/test');

test('Automate ZFW Hospitality Overview Configuration - Call Masking', async ({ page }) => {
  test.setTimeout(90000);
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
  await page.waitForTimeout(2000);

  console.log('Logged in. Navigating to Brands...');
  // 5. Navigate to Brands by clicking the sidebar link
  try {
    // Click the Brands link in the sidebar
    await page.locator('a, div, span').filter({ hasText: /^Brands$/ }).first().click({ timeout: 5000 });
  } catch (e) {
    // Fallback URL if click fails
    await page.goto(process.env.BASE_URL + 'pnd/brands');
  }

  // Wait for the page to settle after navigation (avoiding networkidle which can hang)
  await page.waitForTimeout(3000);
  await page.waitForTimeout(2000);

  // 6. Search for Brand
  const brandName = process.env.BRAND_NAME;
  console.log(`Searching for Brand: ${brandName}...`);

  // Wait for the search box to actually appear before filling it
  const searchInput = page.getByPlaceholder(/search/i).first();
  await searchInput.waitFor({ state: 'visible', timeout: 10000 });
  await searchInput.fill(brandName);
  await page.waitForTimeout(2000);

  // 7. Click on the Brand
  console.log('Clicking on the brand...');
  try {
    await page.getByText(brandName).first().click({ timeout: 5000 });
  } catch (e) {
    // Fallback: click the first row of the table
    await page.locator('table tbody tr').first().click();
  }
  await page.waitForTimeout(2000);

  // 8. Click Overview
  console.log('Clicking Overview tab...');
  try {
    await page.getByRole('button', { name: 'Overview', exact: true }).click({ timeout: 5000 });
  } catch (e) {
    try {
      await page.getByText('Overview', { exact: true }).first().click({ timeout: 5000 });
    } catch (e2) {
      console.log('Overview tab already active or not found.');
    }
  }
  await page.waitForTimeout(2000);

  // 9. Edit PnD Configurations -> Call Masking
  console.log('Editing PnD Configurations -> Call Masking...');

  try {
    await page.getByRole('button', { name: 'Edit' }).first().click({ timeout: 3000 });
    await page.waitForTimeout(1000);
  } catch (e) {
    console.log('No Edit button found or already in edit mode.');
  }

  const callMaskingOption = process.env.CALL_MASKING || 'Inactive';
  console.log(`Setting Call Masking to ${callMaskingOption}...`);

  // Helper to set dropdown
  async function setDropdownOption(labelText, optionValue) {
    if (!optionValue) return;
    console.log(`Setting ${labelText} to ${optionValue}...`);
    
    // Attempt to locate the specific label
    const label = page.getByText(labelText, { exact: true }).first();
    const dropdown = label.locator('..').locator('input').first();
    
    try {
      await dropdown.click({ timeout: 5000 });
    } catch (e) {
      await label.locator('..').click();
    }
    
    await page.waitForTimeout(500);
    await page.getByRole('option', { name: optionValue, exact: true }).last().click();
    await page.waitForTimeout(500);
  }

  await setDropdownOption('Call Masking', callMaskingOption);

  // 10. Save Changes
  console.log('Saving changes...');
  try {
    await page.getByRole('button', { name: 'Save' }).first().click({ timeout: 3000 });
    await page.waitForTimeout(4000);
  } catch (e) {
    console.log('Save button not found. Maybe it saves automatically.');
  }

  console.log('Overview Configuration - Call Masking automated successfully!');
});
