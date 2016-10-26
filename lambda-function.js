var https = require('https')

exports.handler = (event, context) => {

  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION")
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`)
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Welcome to Irish Transit, ask me question such as: when is the next train at Raheny going South", true),
            {}
          )
        )
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`)

        switch(event.request.intent.name) {
          case "GetAllStations":
            context.succeed(
              generateResponse(
                buildSpeechletResponse(`List of stations`, true),
                {}
              )
            )
            break;
            case "GetStationData":
                var req_direction = "";
                if(event.request.intent.slots.Direction.value.toUpperCase() === 'SOUTH' || event.request.intent.slots.Direction.value.toUpperCase() === 'SOUTHBOUND') {
                  req_direction = "SOUTHBOUND"
                } else if (event.request.intent.slots.Direction.value.toUpperCase() === 'NORTH' || event.request.intent.slots.Direction.value.toUpperCase() === 'NORTHBOUND') {
                  req_direction = "NORTHBOUND"
                } else {
                  context.succeed(
                    generateResponse(
                      buildSpeechletResponse(`Please specify a direction. North or South`, true),
                      {}
                    )
                  )
                }
                var endpoint = "https://fintan.io/api/v1/trains/stationByName/" + event.request.intent.slots.Station.value + "/600/" + req_direction// ENDPOINT GOES HERE
                console.log(event.request.intent.slots.Station.value)
                console.log(endpoint)
                var body = ""
                https.get(endpoint, (response) => {
                  response.on('data', (chunk) => { body += chunk })
                  response.on('end', () => {
                    var data = JSON.parse(body)
                    var dueIn = data[0].dueIn
                    var stationFullname = data[0].stationFullname
                    var direction = data[0].direction
                    context.succeed(
                      generateResponse(
                        buildSpeechletResponse(`The next train at ${stationFullname} going ${direction} is due in ${dueIn} minutes`, true),
                        {}
                      )
                    )
                  })
                })
                break;

              case "GetNextTrains":
                var req_direction = "";
                if(event.request.intent.slots.Direction.value.toUpperCase() === 'SOUTH' || event.request.intent.slots.Direction.value.toUpperCase() === 'SOUTHBOUND') {
                  req_direction = "SOUTHBOUND"
                } else if (event.request.intent.slots.Direction.value.toUpperCase() === 'NORTH' || event.request.intent.slots.Direction.value.toUpperCase() === 'NORTHBOUND') {
                  req_direction = "NORTHBOUND"
                } else {
                  context.succeed(
                    generateResponse(
                      buildSpeechletResponse(`Please specify a direction. North or South`, true),
                      {}
                    )
                  )
                }
                var endpoint = "https://fintan.io/api/v1/trains/stationByName/" + event.request.intent.slots.Station.value + "/600/" + req_direction// ENDPOINT GOES HERE
                console.log(event.request.intent.slots.Station.value)
                console.log(endpoint)
                var body = ""
                https.get(endpoint, (response) => {
                  response.on('data', (chunk) => { body += chunk })
                  response.on('end', () => {
                    var data = JSON.parse(body)
                    var times = data.map((elem) => {
                      return  elem.expArrival;
                    })
                    var number = event.request.intent.slots.Number.value
                    var stationFullname = data[0].stationFullname
                    var direction = data[0].direction
                    context.succeed(
                      generateResponse(
                        buildSSML(`<speak>The next ${number} trains at ${stationFullname} going ${direction} are <say-as interpret-as="time">${times[0]}</say-as></speak>`, true),
                        {}
                      )
                    )
                  })
                })
                break;

          default:
            throw "Invalid intent"
        }

        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`)
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)

    }

  } catch(error) { context.fail(`Exception: ${error}`) }

}

// Helpers
buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  }

}

buildSSML = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "SSML",
      ssml: outputText
    },
    shouldEndSession: shouldEndSession
  }

}

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }

}
