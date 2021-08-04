/* exported Script */
/* globals console, _, s */

/** Global Helpers
 *
 * console - A normal console instance
 * _       - An underscore instance
 * s       - An underscore string instance
 */
// Despite the name (SNS), intended use is for Elastic Beanstalk notifications
// If we ever use SNS for anything else, rename.
// eslint-disable-next-line no-unused-vars
class Script {
  // eslint-disable-next-line camelcase, class-methods-use-this
  process_incoming_request({ request }) {
    // console is a global helper to improve debug
    // eslint-disable-next-line no-console
    console.log(request.content_raw);

    const content = JSON.parse(request.content_raw);
    const full_message = content.Message;

    const captures = /(?<message>Message: .*)\n+(?<env>Environment: .*)\n/;
    const found = full_message.match(captures);
    const { message, env } = found.groups;
    if (env.includes("sidekiq")) {
      return {
        error: {
          success: false,
          message: "Not currently supporting noisy sidekiq alerts",
        },
      };
    }
    let text = `${env}\n${message}`;

    if ("SubscribeURL" in content) {
      text = `${text}\n*Subscribe URL:* ${content.SubscribeURL}`;
    }

    return {
      content: {
        text,
      },
    };

    // return {
    //   error: {
    //     success: false,
    //     message: "Error example",
    //   },
    // };
  }
}
