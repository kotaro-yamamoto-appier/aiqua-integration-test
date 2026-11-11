# Little Goods — AIQUA shopping sandbox

A buildless, frontend-only shop: six products, category filters, product detail URLs, a persistent localStorage cart, quantity controls, and a mock checkout. No accounts, backend, payment processing, or dependencies. Currency is USD.

## Run locally

From this directory:

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. Serve over HTTP rather than opening the HTML file directly. Deployed HTTPS is useful for testing the real SDK; use the exact host registered in your AIQUA project.

## Connect AIQUA

1. Open **Common settings → Integration → SDK → Web SDK** in your Appier project. Register your test website URL.
2. Copy the complete project-specific SDK snippet into the marked section in `dist/index.html`, before the application scripts. Do not put secret API keys in browser files.
3. Set `enabled: true` in `dist/aiqua-config.js`.
4. Reload, perform new shopping actions, and inspect **Integration lab**. "Passed to SDK" means the SDK function was called, not that the server received it. Check **AIQUA → Recent Activity → Web** to verify ingestion; the docs note this may take several minutes.

Official references:
- https://docs.enterprise.appier.com/docs/common-settings-integrations-sdks-web
- https://docs.aiqua.appier.com/docs/logging-event-information-on-the-web-sdk
- https://docs.enterprise.appier.com/docs/data-management-schemas-reference-event

## Events

`track()` in `dist/app.js` is the single integration point. It invokes `appier('event', name, flatProperties, optionalValueToSum)` only when explicitly enabled and the SDK function exists. Local mode is the default. No past events are replayed. The newest 100 events are kept in memory and can be exported as JSON. No personal information is collected by the mock checkout.

| Action | Event |
| --- | --- |
| Open product details | `product_viewed` |
| Select category | `category_viewed` |
| Add product / increase quantity | `product_added_to_cart` |
| Remove product / decrease quantity | `product_removed_from_cart` |
| Open bag | `cart_viewed` |
| Begin mock checkout | `checkout_started` |
| Complete mock order | `product_purchased` per product and `checkout_completed` per order |

Purchase events include a unique test order ID, numeric quantities and prices, and USD currency. The fourth SDK argument carries line value for `product_purchased` and order total for `checkout_completed`. Cart and checkout-start events are convenience test events; confirm their names/properties against your project's schema before building campaigns. The SDK owns the initial automatic page view; product details use `product_viewed` instead of a second page view. Local mode shows an initial `page_viewed` observation for debugging.

The application also dispatches a browser `shop:analytics` CustomEvent containing each log record. Example: `window.addEventListener('shop:analytics', e => console.log(e.detail))`.

## Test flow

1. Open a product, add it twice, open the bag, and change quantities.
2. Reload and verify the cart persists. Remove an item.
3. Start checkout, close it to simulate abandonment, and inspect the event log.
4. Reopen checkout and place a test order. Verify line events and one order event, then verify the cart is empty.
5. Enable the SDK and repeat with new actions; verify receipt in AIQUA.

Illustrations are local inline SVG. Optional Google Fonts fall back to system fonts. Cart persistence falls back to in-memory behavior when browser storage is unavailable. No push notification, service worker, recommendation feed, or identity setup is included.
