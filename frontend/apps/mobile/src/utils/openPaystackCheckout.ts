import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

// The hand-off from Taskly's Checkout to Paystack's own payment page.
//
// Paystack's page opens in the in-app browser (a sheet over the app on
// phones, a popup on web). When the user finishes, Paystack sends them to
// the return link below, which closes the page and brings them back here.
//
// Ready for the backend: Checkout will call
//   1. payments.initialize(taskId, paymentReturnUrl()) → { checkoutUrl }
//   2. openPaystackCheckout(checkoutUrl)
//   3. payments.status(taskId) to learn what actually happened.

const RETURN_PATH = 'payment-complete';

// Where Paystack sends the user back to. In a real build this is
// taskly://payment-complete; in Expo Go it's Expo's own exp://… link, and on
// web the site's /payment-complete page. The backend passes it to Paystack
// as the callback_url.
export function paymentReturnUrl(): string {
  return Linking.createURL(RETURN_PATH);
}

// 'returned': Paystack sent them back (they finished on the page).
// 'closed': they closed the page themselves.
// Neither one proves payment: always ask the backend (payments.status) next,
// because someone can pay and then close the page before it redirects.
export type CheckoutPageResult = 'returned' | 'closed';

export async function openPaystackCheckout(checkoutUrl: string): Promise<CheckoutPageResult> {
  const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, paymentReturnUrl());
  return result.type === 'success' ? 'returned' : 'closed';
}
