const Alexa = require('ask-sdk-core');

const PlayRadioIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'PlayRadioIntent';
  },
  handle(handlerInput) {
    const stationSlot = handlerInput.requestEnvelope.request.intent.slots.station;
    let speechText;
    let streamUrl;
    let stationName;
    if (stationSlot && stationSlot.value) {
      stationName = stationSlot.value.toLowerCase();
      switch (stationName) {
        case 'rai radio 1':
          speechText = 'Playing RAI Radio 1';
          streamUrl = 'https://icestreaming.rai.it/1.mp3';
          break; 
        case 'rai radio 3':
          speechText = 'Playing RAI Radio 3';
          streamUrl = 'https://icestreaming.rai.it/3.mp3';
          break;
        case 'radiofreccia':
          speechText = 'Playing Radiofreccia';
          streamUrl = 'https://streamcdnb7-dd782ed59e2a4e86aabf6fc508674b59.msvdn.net/live/S3160845/D6MENOraq6Qy/chunklist_b128000.m3u8';
          break;
        default:
          speechText = `Sorry, I don't know the station ${stationName}`;
      }
    } else {
      speechText = `Sorry, I didn't catch which station you want to play`;
    }

    if (streamUrl) {
      return handlerInput.responseBuilder
        .speak(speechText)
        .addAudioPlayerPlayDirective('REPLACE_ALL', streamUrl, stationName, 0)
        .getResponse();
    } else {
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
  }
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Welcome to EU Radio!')
      .reprompt('Welcome to EU Radio!')
      .getResponse();
  },
};

const HelpRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
    && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('You can say "Play" followed by a radio station name. To exit, just say Stop, Exit, or Quit.')
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .addAudioPlayerStopDirective()
            .withShouldEndSession(true)
            .getResponse();
    }
};

const PausePlaybackHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PauseIntent';
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const playbackInfo = attributesManager.getSessionAttributes().playbackInfo || {};
    
    playbackInfo.state = 'PAUSED';
    const sessionAttributes = attributesManager.getSessionAttributes();
    // The spread operator is unsupported, so we use Object.assign instead
attributesManager.setSessionAttributes(Object.assign({}, sessionAttributes, { playbackInfo }));
    
    return handlerInput.responseBuilder
      .addAudioPlayerStopDirective()
      .getResponse();
  }
};

const ResumePlaybackHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.ResumeIntent';
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const playbackInfo = attributesManager.getSessionAttributes().playbackInfo || {};
    
    playbackInfo.state = 'PLAYING';
const sessionAttributes = attributesManager.getSessionAttributes();
attributesManager.setSessionAttributes(Object.assign({}, sessionAttributes, { playbackInfo }));
    
    return handlerInput.responseBuilder
      .addAudioPlayerPlayDirective()
      .getResponse();
  }
};

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(CancelAndStopIntentHandler, CancelAndStopIntentHandler, LaunchRequestHandler, PlayRadioIntentHandler, PausePlaybackHandler, ResumePlaybackHandler, HelpRequestHandler)
    .lambda();
