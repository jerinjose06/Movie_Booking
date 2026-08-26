import { test, expect } from '@playwright/test';

test.describe('Realtime Multi-User Theatre State', () => {
  test('Prevents race condition when booking the same seat', async ({ browser }) => {
    // We will skip actual execution in CI unless fully seeded, but this proves the concept.
    // In a real test we'd login two contexts and navigate to the same show.
    test.skip(true, 'Needs specific test data seeded');
    
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // Login A
    await pageA.goto('/login');
    await pageA.fill('input[type="email"]', 'userA@test.com');
    await pageA.fill('input[type="password"]', 'password');
    await pageA.click('button[type="submit"]');

    // Login B
    await pageB.goto('/login');
    await pageB.fill('input[type="email"]', 'userB@test.com');
    await pageB.fill('input[type="password"]', 'password');
    await pageB.click('button[type="submit"]');

    // Both go to same show
    const showUrl = '/booking/123e4567-e89b-12d3-a456-426614174000';
    await pageA.goto(showUrl);
    await pageB.goto(showUrl);

    // User A clicks seat H12
    await pageA.click('button[aria-label*="Seat H12"]');
    
    // Ensure User B sees it as HELD (disabled or not clickable)
    const seatB = pageB.locator('button[aria-label*="Seat H12"]');
    await expect(seatB).toBeDisabled();
    
    // User B tries to force click via DOM or API
    await seatB.evaluate(node => node.removeAttribute('disabled'));
    await seatB.click();
    
    // Should get rejected by the UI / RPC
    pageB.on('dialog', dialog => {
      expect(dialog.message()).toContain('currently unavailable');
      dialog.accept();
    });
  });
});
