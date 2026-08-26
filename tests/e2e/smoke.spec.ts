import { test, expect } from '@playwright/test';

const routes = [
  '/',
  '/movies',
  '/movies/123',
  '/theatres',
  '/theatres/123',
  '/shows/123',
  '/booking/123',
  '/account',
  '/admin',
  '/admin/theatres',
  '/admin/movies',
  '/admin/shows',
  '/admin/bookings',
];

for (const route of routes) {
  test(`Route ${route} should load successfully`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
  });
}
