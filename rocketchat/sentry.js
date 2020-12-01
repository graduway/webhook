class Script {

process_incoming_request({ request }) {
    // console is a global helper to improve debug
    console.log(request.content);

    return {
      content: {
        text: "Error in project *" + request.content.project_name + "* (" + request.content.project + ").\n*Message:* " + request.content.message + "\n*Culprit:* " + request.content.culprit + ".\n*Check url:* " + request.content.url,
       }
    };

     return {
       error: {
         success: false,
         message: 'Error example'
       }
     };
  }
}
