// Comments purposely left in, as a guide to what options are available.

class Script {
  /**
   * @params {object} request
   */
  process_incoming_request({ request }) {
    // request.url.hash
    // request.url.search
    // request.url.query
    // request.url.pathname
    // request.url.path
    // request.url_raw
    // request.url_params
    // request.headers
    // request.user._id
    // request.user.name
    // request.user.username
    // request.content_raw
    // request.content

    // console is a global helper to improve debug
    console.log(request.content);

    // Set default variables then overwrite if we know the state
    var colour = "#FFFF00";
    var state = "Unknown state";
    if (request.content.incident.state == "open") {
      colour = "#FF0000";
      state = "Open";
    } else if (request.content.incident.state == "closed") {
      colour = "#00FF00";
      state = "Closed";
    };

    var title = state + ' ' + request.content.incident.condition_name +
      ' alert for ' + request.content.incident.policy_name + ' ' +
      request.content.incident.condition_name;

    return {
      content:{
        //text: request.content.text
        "attachments": [{
        "color": colour,
        //  "author_name": "Rocket.Cat",
        //  "author_link": "https://demo.rocket.chat/direct/rocket.cat",
        //  "author_icon": "https://demo.rocket.chat/avatar/rocket.cat.jpg",
          "title": title,
          "title_link": request.content.incident.url,
          "text": '@all ' + request.content.incident.summary,
        //  "fields": [{
        //    "title": "Priority",
        //    "value": "High",
        //    "short": false
        //  }],
        //  "image_url": "https://rocket.chat/images/mockup.png",
        //  "thumb_url": "https://rocket.chat/images/mockup.png"
        }]
       }
    };

    // return {
    //   error: {
    //     success: false,
    //     message: 'Error example'
    //   }
    // };
  }
}
