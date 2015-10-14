'use strict';

/**
 * Module dependencies
 */

// Public node modules.
const _ = require('lodash');
const nodemailer = require('nodemailer');

/**
 * Email service.
 */

module.exports = {

  /**
   * Send an e-mail
   *
   * @param {Object} options
   * @param {Function} cb
   *
   * @return {Promise}
   */

  send: function * (options, cb) {

    // Init the Promise.
    const deferred = Promise.defer();

    try {

      // Init the transporter.
      const transporter = nodemailer.createTransport({
        service: strapi.config.smtp.service && strapi.config.smtp.service.name,
        auth: {
          user: strapi.config.smtp.service && strapi.config.smtp.service.user,
          pass: strapi.config.smtp.service && strapi.config.smtp.service.pass
        }
      });

      // Init `variable` email.
      let email;

      // Check the callback type.
      cb = _.isFunction(cb) ? cb : _.noop;

      // Default values.
      options = _.isObject(options) ? options : {};
      options.from = strapi.config.smtp.from || '';
      options.text = options.text || options.html;
      options.html = options.html || options.text;

      // Register the `email` object in the database.
      email = yield Email.create(_.assign({
        sent: false
      }, options));

      // Send the email.
      transporter.sendMail({
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      }, function (err) {
        if (err) {
          cb(err);
          deferred.reject(err);
        } else {
          Email.update(email.id, {
            sent: true
          }).exec(function (err, emailUpdated) {
            email = emailUpdated[0] || email;
            cb(null, email);
            deferred.resolve(email);
          });
        }
      });

    } catch (err) {
      deferred.reject(err);
    }

    return deferred.promise;
  }
};
