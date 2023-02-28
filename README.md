# Node.js Phone Shop

A simple phone shop made with Node.js, Express.js, JSX and Bootstrap. The app is deployed to fly.io and is available under [https://phone-shop.fly.dev/](https://phone-shop.fly.dev/). It uses MongoDB Atlas as a database and sessions to store the cart. Concurrent access is handled by blocking the possibility of buying an unavailable product and notifying the user about it.

## Appearance

### Home page

![image](public/img/home_page.png)

### Checkout

![image](public/img/checkout.png)

## Setup

### `npm install`

## Running
### `npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## Areas to improve

- fix alerts to always appear immediately (sometimes they appear only after a refresh)
- add sorting and filtering
- change in_stock from boolean to integer to store quantity of phones in stock
- add payment form and payment processing
- add user authentication and authorization
- add admin panel
- don't refresh the page when adding a phone to the cart
