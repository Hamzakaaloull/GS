'use strict';

/**
 * brigade-name service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::brigade-name.brigade-name');
