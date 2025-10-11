'use strict';

/**
 * remark-instructeur service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::remark-instructeur.remark-instructeur');
