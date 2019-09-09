//mport * as Adapter from 'ask-sdk-s3-persistence-adapter';

const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');


const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {

    const speechText = 'コイビトークへようこそ，お二人の名前を教えてください．まず，一人目の方の名前を教えてください';
    const repromptText = '一人目の方の名前を教えてください';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  },
};

const RegisterIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RegisterIntent';
  },
  handle(handlerInput) {

    const slots = handlerInput.requestEnvelope.request.intent.slots;
    let username = slots.name.value;
    //二人の名前を登録するためにセッションアトリビュートの使用．
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    
    if(attributes.username1===undefined){
      attributes.username1 = username;
      handlerInput.attributesManager.setSessionAttributes(attributes)
      const speechText = `${attributes.username1}さんですね．もう一人の方の名前を教えてください`;
      const repromptText = 'もう一人の方の名前を教えてください';

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(repromptText)
        .getResponse();
    }

    if(attributes.username2===undefined){
      attributes.username2 = username;
      handlerInput.attributesManager.setSessionAttributes(attributes)
      const speechText = `${attributes.username1}さんと${attributes.username2}さんですね．話題を提供してと言ってみてください`;
      const repromptText = '話題を提供してと言ってみてください';

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(repromptText)
        .getResponse();
    }
  },
};

const TopicIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'TopicIntent';
  },
  async handle(handlerInput) {

    // let wadai = handlerInput.requestEnvelope.request.intent.slots.thema.name;
    // console.log('%s', wadai);

    let x = 1;
    let size;

    const speechText = [
        // 未来の話題
        'お二人で旅行に行くならどの都道府県に行きたいですか？',
        'お二人で旅行に行くならどの国に行きたいですか？',
        'お二人で住むならどの国に住みたいですか？',
        'お二人でスポーツするなら何がしたいですか？',
        'お二人で料理するなら何を作りますか？',
        'お二人で映画を観るなら何をみますか？',
        'お二人で遊びに行くならどこに行きたいですか？',
        'お二人でカラオケに行ったら何を歌いますか？',
        'お二人で新しい趣味を始めるなら何を始めますか？',
        'お二人で新しいことを始めるなら何を始めますか？',
        //過去の話題
        'お二人が初めて会った場所を教えてください',
        'お二人の初デートのことを教えてください'
    ];    

    size = speechText.length - 1;
    x = Math.floor(Math.random() * size);

    return handlerInput.responseBuilder
      .speak(speechText[x])
      .withSimpleCard('コイビトーク', speechText[x])
      .getResponse();
  },
};

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
    const speechText = 'バイバイ';

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
    RegisterIntentHandler,
    TopicIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withPersistenceAdapter(
    new persistenceAdapter.S3PersistenceAdapter(
        {bucketName:process.env.S3_PERSISTENCE_BUCKET}))
  .lambda();