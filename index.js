// （1）Alexa Skills Kit SDK を読み込む
const Alexa = require('ask-sdk-core');

// （2）リクエストハンドラーを定義する
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('こんにちは，話題を提供してと言ってみてください')
      .reprompt('こんにちは，話題を提供してと言ってみてください')
      .getResponse();
  },
};

const TopicIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'TopicIntent';
  },
  handle(handlerInput) {
    // const speechText = '私の好きな食べ物は鯖ですが，お二人の好きな食べ物はなんですか？';

    let x = 1;
    let size;

    const speechText = [
        'お二人で旅行に行くならどこに行きたいですか？',
        'お二人で住むならどこに住みたいですか？',
        'お二人でスポーツするなら何がしたいですか？',
        'お二人で料理するなら何を作りますか？',
        'お二人で映画を観るなら何をみますか？',
        'お二人で遊びに行くならどこに行きたいですか？'
    ];

    size = speechText.length - 1;
    x = Math.floor(Math.random() * size);

    return handlerInput.responseBuilder
      .speak(speechText[x])
      .withSimpleCard('コイビトーク', speechText[x])
      .getResponse();
  },
};

// const GreetingIntentHandler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'IntentRequest'
//       && handlerInput.requestEnvelope.request.intent.name === 'GreetingIntent';
//   },
//   handle(handlerInput) {
//     const speechText = 'こんにちは';

//     return handlerInput.responseBuilder
//       .speak(speechText)
//       .withSimpleCard('あいさつスキル', speechText)
//       .getResponse();
//   },
// };

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

// （3）エラーハンドラーを定義する
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('うまく聞き取れませんでした。')
      .reprompt('もういちどお願いします。')
      .getResponse();
  },
};

// （4）Lambda 関数ハンドラーを定義する
const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    TopicIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();