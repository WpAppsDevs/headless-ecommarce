// The 404 shown inside the storefront, so a missing product keeps the header
// and footer around it. The root `not-found.tsx` stays for URLs that match no
// route at all, which Next renders outside any route-group layout.
export { default } from "../not-found";
