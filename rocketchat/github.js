/* Inspired by https://rocket.chat/docs/administrator-guides/integrations/github/.
We update it in https://github.com/graduway/webhook then paste into
Rocket.Chat admin settings. */

String.prototype.capitalizeFirstLetter = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

const getLabelsField = (labels) => {
  let labelsArray = [];
  labels.forEach(function (label) {
    labelsArray.push(label.name);
  });
  labelsArray = labelsArray.join(", ");
  return {
    title: "Labels",
    value: labelsArray,
    short: labelsArray.length <= 40,
  };
};

const githubEvents = {
  ping(request) {
    return {
      content: {
        text:
          `_${request.content.repository.full_name}_\n` +
          `:thumbsup: ${request.content.zen}`,
      },
    };
  },

  /* NEW OR MODIFY ISSUE */
  issues(request) {
    const user = request.content.sender;

    if (
      request.content.action == "opened" ||
      request.content.action == "reopened" ||
      request.content.action == "edited"
    ) {
      var { body } = request.content.issue;
    } else if (
      request.content.action == "assigned" ||
      request.content.action == "unassigned"
    ) {
      // Note that the issues API only gives you one assignee.
      var body = `Current assignee: ${request.content.issue.assignee.login}`;
    } else if (request.content.action == "closed") {
      if (request.content.issue.closed_by) {
        var body = `Closed by: ${request.content.issue.closed_by.login}`;
      } else {
        var body = "Closed.";
      }
    } else {
      return {
        error: {
          success: false,
          message: `Unsupported issue action: ${request.content.action}`,
        },
      };
    }

    const action = request.content.action.capitalizeFirstLetter();

    const text =
      `_${request.content.repository.full_name}_\n` +
      `**[${action} issue ​#${request.content.issue.number} - ${request.content.issue.title}](${request.content.issue.html_url})**\n${body}`;

    return {
      content: {
        attachments: [
          {
            text,
            fields: [],
          },
        ],
      },
    };
  },

  /* COMMENT ON EXISTING ISSUE */
  issue_comment(request) {
    const { user } = request.content.comment;

    if (request.content.action == "edited") {
      var action = "Edited comment ";
    } else {
      var action = "Comment ";
    }

    const body = `${request.content.comment.body} Comment by: ${request.content.comment.user.login}`;

    const text =
      `_${request.content.repository.full_name}_\n` +
      `**[${action} on issue ​#${request.content.issue.number} - ${request.content.issue.title}](${request.content.comment.html_url})**\n${body}`;

    return {
      content: {
        attachments: [
          {
            text,
            fields: [],
          },
        ],
      },
    };
  },

  /* PUSH TO REPO */
  push(request) {
    const { commits } = request.content;
    var multi_commit = "";
    var is_short = true;
    var changeset = "Changeset";
    if (commits.length > 1) {
      var multi_commit = " [Multiple Commits]";
      var is_short = false;
      var changeset = `${changeset}s`;
      var output = [];
    }
    const user = request.content.sender;

    let text = `${"**Pushed to " + "["}${
      request.content.repository.full_name
    }](${request.content.repository.url}):${request.content.ref
      .split("/")
      .pop()}**\n`;

    for (let i = 0; i < commits.length; i++) {
      const commit = commits[i];
      const shortID = commit.id.substring(0, 7);
      const a = `[${shortID}](${commit.url}) - ${commit.message}`;
      if (commits.length > 1) {
        output.push(a);
      } else {
        var output = a;
      }
    }

    if (commits.length > 1) {
      text += output.reverse().join("\n");
    } else {
      text += output;
    }

    return {
      content: {
        attachments: [
          {
            text,
            fields: [],
          },
        ],
      },
    };
  }, // End Github Push

  /* NEW PULL REQUEST */
  pull_request(request) {
    const user = request.content.sender;

    if (
      request.content.action == "opened" ||
      request.content.action == "reopened"
    ) {
      var body = `${request.content.pull_request.body} Opened by: ${request.content.pull_request.user.login}`;
    } else if (request.content.action == "labeled") {
      var body = `Current labels: ${
        getLabelsField(request.content.pull_request.labels).value
      }`;
    } else if (
      request.content.action == "assigned" ||
      request.content.action == "unassigned"
    ) {
      // Note that the issues API only gives you one assignee.
      var body = `Current assignee: ${request.content.pull_request.assignee.login}`;
    } else if (request.content.action == "closed") {
      if (request.content.pull_request.merged) {
        var body = `Merged by: ${request.content.pull_request.merged_by.login}`;
      } else {
        var body = "Closed.";
      }
    } else {
      return {
        error: {
          success: false,
          message: `Unsupported pull request action: ${request.content.action}`,
        },
      };
    }

    const action = request.content.action.capitalizeFirstLetter();

    const text =
      `_${request.content.repository.full_name}_\n` +
      `**[${action} pull request ​#${request.content.pull_request.number} - ${request.content.pull_request.title}](${request.content.pull_request.html_url})**\n${body}`;

    return {
      content: {
        attachments: [
          {
            text,
            fields: [],
          },
        ],
      },
    };
  },

  /* COMMENT ON EXISTING PULL REQUEST REVIEW */
  pull_request_review_comment(request) {
    const { user } = request.content.comment;

    if (request.content.action == "edited") {
      var action = "Edited comment ";
    } else {
      var action = "Comment ";
    }

    const text =
      `_${request.content.repository.full_name}_\n` +
      `**[${action} on pull request ​#${request.content.pull_request.number} - ${request.content.pull_request.title}](${request.content.comment.html_url})**\n${request.content.comment.body}`;

    return {
      content: {
        attachments: [
          {
            text,
            fields: [],
          },
        ],
      },
    };
  }, // End Github Pull Request Review
};

// eslint-disable-next-line no-unused-vars
class Script {
  // eslint-disable-next-line camelcase, class-methods-use-this
  process_incoming_request({ request }) {
    const header = request.headers["x-github-event"];
    if (githubEvents[header]) {
      return githubEvents[header](request);
    }

    return {
      error: {
        success: false,
        message: "Unsupported method",
      },
    };
  }
}
