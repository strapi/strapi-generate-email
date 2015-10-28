'use strict';

module.exports = {

  /**
   * Send an email.
   */

  send: function * () {
    try {
      const email = yield strapi.api.email.services.email.send(this.request.body);
      this.body = email;
    } catch (err) {
      strapi.log.error();
      this.status = err && err.status || 500;
      this.body = err;
    }
  }
};
