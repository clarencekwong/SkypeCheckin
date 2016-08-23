'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./environments/production');
}
else {
  module.exports = require('./environments/development');;
}
