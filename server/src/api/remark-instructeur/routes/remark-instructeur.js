'use strict';

/**
 * remark-instructeur router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::remark-instructeur.remark-instructeur');
