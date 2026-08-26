import { test, expect } from '@playwright/test';

test.describe('Payment & Checkout Flow', () => {
  test('creates a checkout session and redirect to Stripe', async ({ page }) => {
    // We mock the API request to /api/checkout to avoid hitting real Stripe in basic tests
    await page.route('/api/checkout', async (route) => {
      const json = { url: 'https://checkout.stripe.com/test' };
      await route.fulfill({ json });
    });

    // Assume user is already at checkout page for a valid booking
    // Note: in a full E2E, we would seed a booking or go through the booking flow.
    // For this test, we simulate an existing booking ID.
    const mockBookingId = '11111111-1111-1111-1111-111111111111';
    
    // We mock the Supabase data fetching for the checkout page
    await page.route(`**/rest/v1/bookings?id=eq.${mockBookingId}*`, async (route) => {
      await route.fulfill({
        json: [{
          id: mockBookingId,
          total_amount: 15.00,
          status: 'PENDING',
          shows: {
            movies: { title: 'Test Movie' },
            auditoriums: { name: 'Auditorium 1', theatres: { name: 'Theatre 1' } },
            start_time: new Date().toISOString()
          },
          booking_items: [
            { price: 15.00, show_seats: { seats: { seat_number: 1, seat_rows: { row_name: 'A' } } } }
          ]
        }]
      });
    });

    await page.goto(`/checkout/${mockBookingId}`);
    
    // Verify checkout page shows amount and items
    await expect(page.locator('text=Complete Your Booking')).toBeVisible();
    await expect(page.locator('text=$15.00')).toBeVisible();

    // Click pay button
    // It should trigger the API and redirect to the mock URL
    const payButton = page.locator('button:has-text("Pay with Stripe")');
    await payButton.waitFor({ state: 'visible' });
    
    // Listen for navigation
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('checkout.stripe.com')),
      payButton.click()
    ]);
    
    expect(request.url()).toContain('checkout.stripe.com');
  });

  test('ticket page displays booking details securely', async ({ page }) => {
    const mockBookingRef = 'TKT-TEST1234';
    
    await page.route(`**/rest/v1/bookings?booking_reference=eq.${mockBookingRef}*`, async (route) => {
      await route.fulfill({
        json: [{
          id: '11111111-1111-1111-1111-111111111111',
          booking_reference: mockBookingRef,
          total_amount: 15.00,
          status: 'CONFIRMED',
          shows: {
            movies: { title: 'Test Movie' },
            auditoriums: { name: 'Auditorium 1', theatres: { name: 'Theatre 1' } },
            start_time: new Date().toISOString()
          },
          booking_items: [
            { price: 15.00, show_seats: { seats: { seat_number: 1, seat_rows: { row_name: 'A' } } } }
          ]
        }]
      });
    });

    await page.goto(`/tickets/${mockBookingRef}`);
    
    await expect(page.locator('text=Booking Confirmed!')).toBeVisible();
    await expect(page.locator(`text=${mockBookingRef}`)).toBeVisible();
    await expect(page.locator('text=Test Movie')).toBeVisible();
    await expect(page.locator('text=A1')).toBeVisible();
  });
});
