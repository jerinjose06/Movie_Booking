# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: payment.spec.ts >> Payment & Checkout Flow >> ticket page displays booking details securely
- Location: tests\e2e\payment.spec.ts:55:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Booking Confirmed!')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Booking Confirmed!')
    - waiting for "http://localhost:3000/login" navigation to finish...
    - navigated to "http://localhost:3000/login"

```

```yaml
- navigation:
  - link "Home":
    - /url: /
  - link "Movies":
    - /url: /movies
  - link "Theatres":
    - /url: /theatres
  - link "Account":
    - /url: /account
  - link "Admin":
    - /url: /admin
- main:
  - heading "Sign In to Continue" [level=1]
  - paragraph: Enter an email and password. If the account doesn't exist, we'll create it for you to easily test the app.
  - text: Email
  - textbox "user@example.com"
  - text: Password
  - textbox "••••••••"
  - button "Sign In / Sign Up"
  - text: Don't have an account? Sign up
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Payment & Checkout Flow', () => {
  4  |   test('creates a checkout session and redirect to Stripe', async ({ page }) => {
  5  |     // We mock the API request to /api/checkout to avoid hitting real Stripe in basic tests
  6  |     await page.route('/api/checkout', async (route) => {
  7  |       const json = { url: 'https://checkout.stripe.com/test' };
  8  |       await route.fulfill({ json });
  9  |     });
  10 | 
  11 |     // Assume user is already at checkout page for a valid booking
  12 |     // Note: in a full E2E, we would seed a booking or go through the booking flow.
  13 |     // For this test, we simulate an existing booking ID.
  14 |     const mockBookingId = '11111111-1111-1111-1111-111111111111';
  15 |     
  16 |     // We mock the Supabase data fetching for the checkout page
  17 |     await page.route(`**/rest/v1/bookings?id=eq.${mockBookingId}*`, async (route) => {
  18 |       await route.fulfill({
  19 |         json: [{
  20 |           id: mockBookingId,
  21 |           total_amount: 15.00,
  22 |           status: 'PENDING',
  23 |           shows: {
  24 |             movies: { title: 'Test Movie' },
  25 |             auditoriums: { name: 'Auditorium 1', theatres: { name: 'Theatre 1' } },
  26 |             start_time: new Date().toISOString()
  27 |           },
  28 |           booking_items: [
  29 |             { price: 15.00, show_seats: { seats: { seat_number: 1, seat_rows: { row_name: 'A' } } } }
  30 |           ]
  31 |         }]
  32 |       });
  33 |     });
  34 | 
  35 |     await page.goto(`/checkout/${mockBookingId}`);
  36 |     
  37 |     // Verify checkout page shows amount and items
  38 |     await expect(page.locator('text=Complete Your Booking')).toBeVisible();
  39 |     await expect(page.locator('text=$15.00')).toBeVisible();
  40 | 
  41 |     // Click pay button
  42 |     // It should trigger the API and redirect to the mock URL
  43 |     const payButton = page.locator('button:has-text("Pay with Stripe")');
  44 |     await payButton.waitFor({ state: 'visible' });
  45 |     
  46 |     // Listen for navigation
  47 |     const [request] = await Promise.all([
  48 |       page.waitForRequest(req => req.url().includes('checkout.stripe.com')),
  49 |       payButton.click()
  50 |     ]);
  51 |     
  52 |     expect(request.url()).toContain('checkout.stripe.com');
  53 |   });
  54 | 
  55 |   test('ticket page displays booking details securely', async ({ page }) => {
  56 |     const mockBookingRef = 'TKT-TEST1234';
  57 |     
  58 |     await page.route(`**/rest/v1/bookings?booking_reference=eq.${mockBookingRef}*`, async (route) => {
  59 |       await route.fulfill({
  60 |         json: [{
  61 |           id: '11111111-1111-1111-1111-111111111111',
  62 |           booking_reference: mockBookingRef,
  63 |           total_amount: 15.00,
  64 |           status: 'CONFIRMED',
  65 |           shows: {
  66 |             movies: { title: 'Test Movie' },
  67 |             auditoriums: { name: 'Auditorium 1', theatres: { name: 'Theatre 1' } },
  68 |             start_time: new Date().toISOString()
  69 |           },
  70 |           booking_items: [
  71 |             { price: 15.00, show_seats: { seats: { seat_number: 1, seat_rows: { row_name: 'A' } } } }
  72 |           ]
  73 |         }]
  74 |       });
  75 |     });
  76 | 
  77 |     await page.goto(`/tickets/${mockBookingRef}`);
  78 |     
> 79 |     await expect(page.locator('text=Booking Confirmed!')).toBeVisible();
     |                                                           ^ Error: expect(locator).toBeVisible() failed
  80 |     await expect(page.locator(`text=${mockBookingRef}`)).toBeVisible();
  81 |     await expect(page.locator('text=Test Movie')).toBeVisible();
  82 |     await expect(page.locator('text=A1')).toBeVisible();
  83 |   });
  84 | });
  85 | 
```