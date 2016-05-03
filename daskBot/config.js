'use strict';

const production = {
  BOT_ID: '28:7a5eb625-40e0-4bef-a972-f2a11a7c9713',
  APP_ID: '08a671a5-8713-470d-b37c-176e12e3e7b8',
  APP_SECRET: process.env.DASK_BOT_APP_SECRET,
  API_ENDPOINT: 'http://www.soulwalrus.club/v1/',
  PUSHER_KEY: 'f35ce6a52f1fc2a358fa'
}

const development = {
  BOT_ID: '28:7a5eb625-40e0-4bef-a972-f2a11a7c9713',
  APP_ID: '08a671a5-8713-470d-b37c-176e12e3e7b8',
  APP_SECRET: process.env.DASK_BOT_APP_SECRET,
  API_ENDPOINT: 'http://localhost:3000/v1/',
  PUSHER_KEY: 'd7bac04aba128fb95645'
}

if (process.env.NODE_ENV === 'production') {
  module.exports = production;
}
else {
  module.exports = development;
}
