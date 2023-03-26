const Alexa = require('ask-sdk-core');

const PlayRadioIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'PlayRadioIntent';
  },
  handle(handlerInput) {
    const locale = Alexa.getLocale(handlerInput.requestEnvelope);
    const languageStrings = require(`./locales/${locale}.json`);
    const stationSlot = handlerInput.requestEnvelope.request.intent.slots.station;
    let speechText;
    let streamUrl;
    let stationName;
    if (stationSlot && stationSlot.value) {
      stationName = stationSlot.value.toLowerCase();
      switch (stationName) {
        case 'rai radio 1':
          speechText = languageStrings[locale].PLAY_RAI1;
          streamUrl = 'https://icestreaming.rai.it/1.mp3';
          break;
        case 'rai radio 2':
          speechText = languageStrings[locale].PLAY_RAI2;
          streamUrl = 'https://icestreaming.rai.it/2.mp3';
          break;
        case 'rai radio 3':
          speechText = languageStrings[locale].PLAY_RAI3;
          streamUrl = 'https://icestreaming.rai.it/3.mp3';
          break;
        case 'radiofreccia':
          speechText = languageStrings[locale].PLAY_RADIOFRECCIA;
          streamUrl = 'https://streamcdnb7-dd782ed59e2a4e86aabf6fc508674b59.msvdn.net/live/S3160845/D6MENOraq6Qy/chunklist_b128000.m3u8';
          break;
        default:
          speechText = languageStrings[locale].STATIONNAME_UNSURE;
      }
    } else {
      speechText = languageStrings[locale].STATIONNAME_UNSURE;
    }

    if (streamUrl) {
      return handlerInput.responseBuilder
        .speak(speechText)
        .addAudioPlayerPlayDirective('REPLACE_ALL', streamUrl, stationName, 0, null, {
          skill: 'eu-radio'
        })
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
    const locale = Alexa.getLocale(handlerInput.requestEnvelope);
    const languageStrings = require(`./locales/${locale}.json`);
    const speechText = languageStrings[locale].WELCOME_MSG;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const HelpRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const locale = Alexa.getLocale(handlerInput.requestEnvelope);
    const languageStrings = require(`./locales/${locale}.json`);
    const speechText = languageStrings[locale].HELP;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const playbackInfo = attributesManager.getSessionAttributes().playbackInfo || {};

    playbackInfo.state = 'STOPPED';
    const sessionAttributes = attributesManager.getSessionAttributes();
    // The spread operator is unsupported, so we use Object.assign instead
    attributesManager.setSessionAttributes(Object.assign({}, sessionAttributes, { playbackInfo }));
    return handlerInput.responseBuilder
      .addAudioPlayerStopDirective()
      .withShouldEndSession(true)
      .getResponse();
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    console.log(JSON.stringify(handlerInput.requestEnvelope));
    const requestType = Alexa.getRequestType(handlerInput.requestEnvelope);
    const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
    return requestType === 'IntentRequest' && (
      intentName === 'AMAZON.CancelIntent' ||
      intentName === 'AMAZON.StopIntent'
    );
  },
  handle(handlerInput) {
    const { attributesManager } = handlerInput;
    const playbackInfo = attributesManager.getSessionAttributes().playbackInfo || {};

    playbackInfo.state = 'STOPPED';
    const sessionAttributes = attributesManager.getSessionAttributes();
    // The spread operator is unsupported, so we use Object.assign instead
    attributesManager.setSessionAttributes(Object.assign({}, sessionAttributes, { playbackInfo }));
    return handlerInput.responseBuilder
      .addAudioPlayerStopDirective()
      .withShouldEndSession(true)
      .getResponse();
  }
};

const UnsupportedIntentsHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.PreviousIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NextIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StartOverIntent');
  },
  handle(handlerInput) {
    const locale = Alexa.getLocale(handlerInput.requestEnvelope);
    const languageStrings = require(`./locales/${locale}.json`);
    const speechText = languageStrings[locale].UNSUPPORTED_CMD;
    return handlerInput.responseBuilder
      .speak(speechText)
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
  .addRequestHandlers(
    LaunchRequestHandler,
    PlayRadioIntentHandler,
    SessionEndedRequestHandler,
    CancelAndStopIntentHandler,
    HelpRequestHandler,
    PausePlaybackHandler,
    ResumePlaybackHandler,
    UnsupportedIntentsHandler
  )
  .lambda();
