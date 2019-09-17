const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
const Adapter = require('ask-sdk-dynamodb-persistence-adapter');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {

    const speechText = '<prosody pitch="x-low">コイビトークへようこそ．<break time="1s"/>あなたたちの名前を聞かせてもらうわ．<break time="1s"/>ひとりめの名前を教えてちょうだい．</prosody>';
    const repromptText = '<prosody pitch="x-low">ひとりめの名前を教えてちょうだい</prosody>';

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
      const speechText = `<prosody pitch="x-low">${attributes.username1}さんね．もう一人の方の名前を教えてちょうだい</prosody>`;
      const repromptText = '<prosody pitch="x-low">もう一人の方の名前を教えてちょうだい</prosody>';

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(repromptText)
        .getResponse();
    }

    if(attributes.username2===undefined){
      attributes.username2 = username;
      handlerInput.attributesManager.setSessionAttributes(attributes)
      const speechText = `<prosody pitch="x-low">${attributes.username1}さんと${attributes.username2}さんね．話題を提供してと言ってみてちょうだい</prosody>`;
      const repromptText = '<prosody pitch="x-low">話題を提供してと言ってみてちょうだい</prosody>';

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

    let x = 1;
    let size;

    const attributes = handlerInput.attributesManager.getSessionAttributes();
    // attributes.username1 = '松村';
    // attributes.username2 = '佐藤';
    // handlerInput.attributesManager.setSessionAttributes(attributes)

    if(attributes.username1 === undefined || attributes.username2 === undefined){
      speechText = [
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
    }else{
      speechText = [
        `<prosody pitch="x-low">${attributes.username1}さん，答えてちょうだい.二人で旅行に行くならどの都道府県に行きたいの？</prosody>`,
        `<prosody pitch="x-low">${attributes.username2}さん，答えてちょうだい.二人で旅行に行くならどの都道府県に行きたいの？</prosody>`,
        `<prosody pitch="x-low">${attributes.username1}さん，答えてちょうだい.二人で旅行に行くならどの国に行きたいの？</prosody>`,
        `<prosody pitch="x-low">${attributes.username2}さん，答えてちょうだい.二人で旅行に行くならどの国に行きたいの？</prosody>`,
        `<prosody pitch="x-low">${attributes.username1}さん，答えてちょうだい.二人でスポーツするなら何がしたいの？</prosody>`,
        `<prosody pitch="x-low">${attributes.username2}さん，答えてちょうだい.二人でスポーツするなら何がしたいの？</prosody>`
      ];
    };

    //質問をランダムで提示する
    size = speechText.length ;
    x = Math.floor(Math.random() * size);

    attributes.number = x;
    handlerInput.attributesManager.setSessionAttributes(attributes)

    //以前に行った質問を記録する
    // const attr = await handlerInput.attributesManager.getPersistentAttributes();
    // attr.preQuestion = 'お二人で旅行に行くならどの都道府県に行きたいですか？';
    // handlerInput.attributesManager.setPersistentAttributes(attr);
    // await handlerInput.attributesManager.savePersistentAttributes();
    // console.log(attr.prequestion);

    return handlerInput.responseBuilder
      .speak(speechText[x])
      .reprompt(speechText[attributes.number])
      .withSimpleCard('コイビトーク', speechText[x])
      .getResponse();
  },
};

const FacilitateIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'FacilitateIntent';
  },
  handle(handlerInput) {

    const attributes = handlerInput.attributesManager.getSessionAttributes();
    // attributes.username1 = '松村';
    // attributes.username2 = '佐藤';
    // attributes.number = 0;
    // handlerInput.attributesManager.setSessionAttributes(attributes)

    if(attributes.username1 === undefined || attributes.username2 === undefined){
      speechText = [
          // 未来の話題
          'とてもいいですね，そこで何をしたいですか？',
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
    }else{
      speechText = [
        `え〜，本当にそこでいいの？${attributes.username2}さんは行きたい？`,
        `え〜，本当にそこでいいの？${attributes.username1}さんは行きたい？`,
        `え〜，本当にそこでいいの？${attributes.username2}さんは行きたい？`,
        `え〜，本当にそこでいいの？${attributes.username1}さんは行きたい？`,
        `え〜，本当にそれでいいの？${attributes.username2}さんはしたい？`,
        `え〜，本当にそれでいいの？${attributes.username1}さんはしたい？`
      ]
    };

    return handlerInput.responseBuilder
      .speak(speechText[attributes.number])
      .reprompt(speechText[attributes.number])
      .withSimpleCard('コイビトーク', speechText[attributes.number])
      .getResponse();
  },
};

const ContinueIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ContinueIntent';
  },
  handle(handlerInput) {

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
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

//インターセプターの処理
// const responseIntercepter = {
//   process(handlerInput) {
//     console.log("インターセプターの処理はここ");
//   }
// }

// （4）Lambda 関数ハンドラーを定義する
const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    RegisterIntentHandler,
    TopicIntentHandler,
    FacilitateIntentHandler,
    ContinueIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  //インターセプターの処理
  // .addResponseInterceptors(responseIntercepter)
  .addErrorHandlers(ErrorHandler)
  .withPersistenceAdapter(
    new persistenceAdapter.S3PersistenceAdapter(
        {bucketName:process.env.S3_PERSISTENCE_BUCKET}))
  .lambda();