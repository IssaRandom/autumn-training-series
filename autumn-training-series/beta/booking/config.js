/* Online booking (beta) settings. The only file to change when the Apps Script is redeployed to a new URL.
   api: the Apps Script web-app URL ending in /exec. While it's blank, booking pages say online booking
   isn't open yet and point to the Google Form. On localhost the pages always use booking/mock.js (nothing
   touches the real sheet) unless you add ?live=1 to the URL to test against this api. */
window.BTS_BOOKING = {
  api: "https://script.google.com/macros/s/AKfycbzNqYWLGQAdU0Hi_5mqaOOegH9W2a8ZtYrN0NTKkC9h8Vr-Aa3lzxcIJsTfetAMBHKZGg/exec",
  fallbackForm: "https://forms.gle/X7offBwNaL24wZ4t7",
  lateFee: 20,
  payDays: 7,
};
