# Make Website Suitable for Mobile View

The goal is to adapt the existing desktop-first UI to work seamlessly on mobile devices without losing the established dark cinematic aesthetic. 

## User Review Required

> [!IMPORTANT]
> The biggest challenge on mobile is the **Seat Map**. Seats cannot be arbitrarily shrunk down because they become un-tappable on touch screens. 
> - For the 2D view: We will maintain `overflow-x-auto` so users can swipe horizontally to view the whole theater, while slightly reducing seat margins on small screens.
> - For the 3D view: The canvas height will be capped on mobile (e.g., `50vh`) so users can still scroll the page without getting "stuck" panning the 3D scene.
> - Please let me know if you prefer a different approach for the seat selection on mobile (e.g. pinch-to-zoom).

## Open Questions
- Do you want a sticky "Checkout" bar at the bottom of the screen on mobile, so the user doesn't have to scroll past the entire seat map to see their total? (I will implement this by default as it is standard UX for booking apps).

## Proposed Changes

### Global Layout & Navigation
#### [MODIFY] src/app/layout.tsx
- Replace the static `flex` navigation with a responsive layout.
- Add a Hamburger menu for mobile screens.
- Hide the primary links (`Movies`, `Theatres`, `Account`, `Admin`) behind the mobile menu on `sm` screens and use `md:flex` for the desktop view.

### Homepage
#### [MODIFY] src/app/page.tsx
- Adjust padding (`px-6 py-12` to `px-4 py-8` on mobile).
- Scale down the massive fonts on the Search Banner for smaller screens (e.g., `text-2xl` instead of `text-3xl`).
- Ensure the header layout (Welcome + Avatar) stacks or shrinks correctly on narrow widths.

### Booking Flow
#### [MODIFY] src/app/booking/[showId]/BookingClient.tsx
- Add a sticky bottom bar on mobile screens specifically for the "Booking Summary" total and the "Checkout" button, improving usability.
- Retain the right-side sticky panel for desktop (`lg:w-1/4`).

#### [MODIFY] src/components/booking/TwoDSeatMap.tsx
- Optimize the seat map container for touch screens. 
- Reduce seat gaps slightly on mobile.
- Add an `inset-shadow` or a visual cue indicating horizontal scrolling is available.

#### [MODIFY] src/components/booking/SeatSelector.tsx
- Constrain the height of the 3D canvas (if toggled) on mobile devices to prevent the 3D viewer from hijacking the entire touch area (e.g., `h-[50vh]`).

### Auxiliary Pages (Checkout & Tickets)
#### [MODIFY] src/app/checkout/[bookingId]/CheckoutClient.tsx
- Ensure the payment form scales to 100% width on mobile without overflowing.

#### [MODIFY] src/app/tickets/[bookingRef]/page.tsx
- Adjust the ticket layout to stack vertically (`flex-col`) on mobile instead of side-by-side, ensuring barcodes and QR codes render at scannable sizes.

## Verification Plan

### Manual Verification
- Emulate mobile devices (iPhone 12/14/15, Pixel) in the browser DevTools.
- Verify the hamburger menu opens and closes correctly.
- Verify the 2D seat map scrolls horizontally and seats remain easily tappable.
- Verify the checkout button remains accessible on mobile without excessive scrolling.
