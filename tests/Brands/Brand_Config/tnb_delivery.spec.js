const { test, expect } = require('@playwright/test');

test('Automate ZFW Hospitality T&B Delivery Configuration', async ({ page }) => {
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

  // 8. Click Configuration
  console.log('Clicking Configuration tab...');
  try {
    await page.getByRole('button', { name: 'Configuration', exact: true }).click({ timeout: 5000 });
  } catch (e) {
    await page.getByText('Configuration', { exact: true }).first().click({ timeout: 5000 });
  }
  await page.waitForTimeout(2000);

  // 9. Switch to T&B Delivery module BEFORE entering edit mode
  console.log('Switching to T&B Delivery module...');
  try {
    // Remove exact: true just in case there are trailing spaces, use partial matching with first()
    await page.getByText('T&B Delivery').first().click({ timeout: 5000 });
    await page.waitForTimeout(2000);
  } catch (e) {
    console.log('T&B Delivery already selected or not clickable as a tab.');
  }

  // 10. Click Edit
  console.log('Clicking Edit button...');
  await page.getByRole('button', { name: 'Edit' }).first().click();
  await page.waitForTimeout(1000);

  console.log('Setting Configuration options from .env...');

  // Helper to set dropdown to the specified option using index for duplicated labels
  async function setDropdownOption(labelText, optionValue, index = 0) {
    if (!optionValue) return; // Skip if no option provided
    console.log(`Setting ${labelText} (index ${index}) to ${optionValue}...`);
    // Use exact match to avoid substring conflicts (e.g., "OTP" vs "OTP For COD")
    const label = page.getByText(labelText, { exact: true }).nth(index);
    const dropdown = label.locator('..').locator('input').first();
    await dropdown.click();
    await page.waitForTimeout(500);
    // Because there might be multiple options in the DOM, click the last one (usually the currently open dropdown)
    await page.getByRole('option', { name: optionValue, exact: true }).last().click();
    await page.waitForTimeout(500);
  }

  // Helper to set text input
  async function setTextInput(labelText, textValue, index = 0) {
    if (!textValue) return;
    console.log(`Setting text for ${labelText} (index ${index}) to ${textValue}...`);
    const label = page.getByText(labelText, { exact: true }).nth(index);

    // Go up the DOM tree to find the closest container that actually has an input inside it
    const container = label.locator('xpath=ancestor::*[.//input[not(@type="hidden")] | .//textarea][1]');
    const input = container.locator('input:not([type="hidden"]), textarea').last();

    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(textValue);
    await page.waitForTimeout(500);
  }

  // --- General ---
  await setDropdownOption("TnB Type", process.env.TNB_TYPE, 0);

  // Helper to parse comma-separated env variables, stripping quotes
  function getOption(envVar, index) {
    const parts = (process.env[envVar] || '').split(',').map(s => s.trim().replace(/^"|"$/g, ''));
    if (parts.length === 1) return parts[0]; // If only 1 value is provided, apply it to all
    return parts[index] !== undefined ? parts[index] : '';
  }

  // --- Pickup ---
  await setDropdownOption("AWB Scan", getOption('TNB_PICKUP', 0), 0);
  await setDropdownOption("Proof of Pickup (photo)", getOption('TNB_PICKUP', 1), 0);
  await setDropdownOption("OTP", getOption('TNB_PICKUP', 2), 0);

  // --- Delivered ---
  await setDropdownOption("AWB Scan", getOption('TNB_DELIVERED', 0), 1);
  await setDropdownOption("Proof of Delivery Image Capture", getOption('TNB_DELIVERED', 1), 0);
  await setDropdownOption("OTP For COD", getOption('TNB_DELIVERED', 2), 0);
  await setDropdownOption("OTP For Prepaid", getOption('TNB_DELIVERED', 3), 0);

  // --- Return Pickup ---
  await setDropdownOption("Proof of Pickup (photo)", getOption('TNB_RETURN_PICKUP', 0), 1);
  await setDropdownOption("Quality Check 1", getOption('TNB_RETURN_PICKUP', 0), 0);
  await setTextInput("Question for Quality Check 1", process.env.TNB_RETURN_PICKUP_QC_1_QUESTION?.replace(/^"|"$/g, ''), 0);
  await setDropdownOption("Quality Check 2", getOption('TNB_RETURN_PICKUP', 0), 0);
  await setTextInput("Question for Quality Check 2", process.env.TNB_RETURN_PICKUP_QC_2_QUESTION?.replace(/^"|"$/g, ''), 0);
  await setDropdownOption("Quality Check 3", getOption('TNB_RETURN_PICKUP', 0), 0);
  await setTextInput("Question for Quality Check 3", process.env.TNB_RETURN_PICKUP_QC_3_QUESTION?.replace(/^"|"$/g, ''), 0);
  await setDropdownOption("OTP For Prepaid", getOption('TNB_RETURN_PICKUP', 0), 1);
  await setDropdownOption("OTP For COD", getOption('TNB_RETURN_PICKUP', 0), 1);
  await setDropdownOption("Remarks", getOption('TNB_RETURN_PICKUP', 0), 0);
  await setDropdownOption("Item Level Scanning", getOption('TNB_RETURN_PICKUP', 0), 0);
  await setDropdownOption("Item wise separate return shipment", process.env.TNB_RETURN_PICKUP_ITEM_WISE_SEPARATE, 0);

  // --- Return Delivery ---
  await setDropdownOption("AWB Scan", getOption('TNB_RETURN_DELIVERY', 0), 3);
  await setDropdownOption("Proof of Delivery", getOption('TNB_RETURN_DELIVERY', 1), 0);
  await setDropdownOption("OTP", getOption('TNB_RETURN_DELIVERY', 2), 1);

  // --- Wait Time ---
  await setDropdownOption("Wait Time", process.env.TNB_WAIT_TIME, 0);

  // 10. Save Changes
  console.log('Saving changes...');
  await page.getByRole('button', { name: 'Save' }).first().click();

  await page.waitForTimeout(4000);
  console.log('T&B Delivery Configuration automated successfully!');
});
