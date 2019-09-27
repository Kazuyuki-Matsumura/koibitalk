const Alexa = require('ask-sdk-core');
// const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');
const { DynamoDbPersistenceAdapter } = require('ask-sdk-dynamodb-persistence-adapter');
const dynamoDbPersistenceAdapter = new DynamoDbPersistenceAdapter({
  tableName: 'QuestionTable'
});
const aws = require('aws-sdk');
const dynamoDB = new aws.DynamoDB()

const SKILL_NAME = 'コイビトーク';

//永続アトリビュートの取得
function getAttributes(attributesManager) {
  return new Promise((resolve, reject) => {
    attributesManager.getPersistentAttributes()
      .then((attributes) => {
        if (attributes.id == undefined) {
          attributes.id = 0;
        }
        resolve(attributes);
      })
      .catch((error) => {
        resolve({ id: 0 });
      });
  });
}

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

    // return getAttributes(handlerInput.attributesManager)
    //   .then((attributes) => {
    //     const speechText = '<prosody pitch="x-low">コイビトークへようこそ．<break time="1s"/>あなたたちの名前を聞かせてもらうわ．<break time="1s"/>ひとりめの名前を教えてちょうだい．</prosody>';
    //     const repromptText = '<prosody pitch="x-low">ひとりめの名前を教えてちょうだい</prosody>';

    //     attributes.userName1 = "松村";
    //     attributes.userName2 = "佐藤";

    //     handlerInput.attributesManager.setPersistentAttributes(attributes);
    //     return handlerInput.attributesManager.savePersistentAttributes()
    //       .then(() => {
    //         return handlerInput.responseBuilder
    //           .speak(speechText)
    //           .reprompt(repromptText)
    //           .getResponse();
    //       });    
    //   })
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
    // //二人の名前を登録するためにセッションアトリビュートの使用．
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    // let userName1 = '松村';
    // let userName2 = '佐藤';

    if(sessionAttributes.username1===undefined){
      sessionAttributes.username1 = username;
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes)
      const speechText = `<prosody pitch="x-low">${sessionAttributes.username1}さんね．もう一人の方の名前を教えてちょうだい</prosody>`;
      const repromptText = '<prosody pitch="x-low">もう一人の方の名前を教えてちょうだい</prosody>';

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(repromptText)
        .getResponse();
    }

    if(sessionAttributes.username2===undefined){
      return getAttributes(handlerInput.attributesManager)
        .then((attributes) => {

          sessionAttributes.username2 = username;
          let speechText = `<prosody pitch="x-low">${sessionAttributes.username1}さんと${sessionAttributes.username2}さんね．話題を提供してと言ってみてちょうだい</prosody>`;
          const repromptText = '<prosody pitch="x-low">話題を提供してと言ってみてちょうだい</prosody>';
  
          //前回も同じユーザなら言葉変える
          if(attributes.pastquestions.username1 === sessionAttributes.username1 && attributes.pastquestions.username2 === sessionAttributes.username2){
            speechText = '<prosody pitch="x-low">あらあなたたちまた来たのね．話題を提供してと言ってみてちょうだい</prosody>';
            sessionAttributes.lastquestionnumber = attributes.pastquestions.lastquestionnumber;
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes)
          }
          return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(repromptText)
            .getResponse();
        })       
    }
    // return handlerInput.responseBuilder
    //   .speak(speechText)
    //   .reprompt(repromptText)
    //   .getResponse();
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

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    // sessionAttributes.username1 = '松村';
    // sessionAttributes.username2 = '佐藤';
    // handlerInput.attributesManager.setSessionAttributes(sessionAttributes)

    let userName1 = sessionAttributes.username1;
    let userName2 = sessionAttributes.username2;
    let lastQuestionNumber = sessionAttributes.lastquestionnumber;

    // let userName1 = '松村';
    // let userName2 = '佐藤';

    if(userName1 === undefined || userName2 === undefined){
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
        `<prosody pitch="x-low">${userName1}さん，答えてちょうだい.二人で旅行に行くならどの都道府県に行きたい？</prosody>`,
        `<prosody pitch="x-low">${userName2}さん，答えてちょうだい.二人で旅行に行くならどの都道府県に行きたい？</prosody>`,
        `<prosody pitch="x-low">${userName1}さん，答えてちょうだい.二人で旅行に行くならどの国に行きたい？</prosody>`,
        `<prosody pitch="x-low">${userName2}さん，答えてちょうだい.二人で旅行に行くならどの国に行きたい？</prosody>`,
        `<prosody pitch="x-low">${userName1}さん，答えてちょうだい.二人でスポーツするなら何がしたい？</prosody>`,
        `<prosody pitch="x-low">${userName2}さん，答えてちょうだい.二人でスポーツするなら何がしたい？</prosody>`,
        `<prosody pitch="x-low">${userName1}さん，答えてちょうだい.${userName2}さんの一番好きなところは次のうちどれ？1番,顔,2番,性格,3番,服装,4番，経済力</prosody>`,
        `<prosody pitch="x-low">${userName2}さん，答えてちょうだい.${userName1}さんの一番好きなところは次のうちどれ？1番,顔,2番,性格,3番,服装,4番，経済力</prosody>`,
        `<prosody pitch="x-low">${userName1}さん，答えてちょうだい.${userName2}さんとデートに行くなら次のうちどこ？1番,遊園地,2番,海,3番,ショッピングモール,4番，映画館</prosody>`,
        `<prosody pitch="x-low">${userName2}さん，答えてちょうだい.${userName1}さんとデートに行くなら次のうちどこ？1番,遊園地,2番,海,3番,ショッピングモール,4番，映画館</prosody>`,
        `<prosody pitch="x-low">${userName1}さん，答えてちょうだい.${userName2}さんと映画を観るなら次のうちどれ？1番,アクション映画,2番,コメディ映画,3番,ミステリー映画,4番，アニメ映画</prosody>`,
        `<prosody pitch="x-low">${userName2}さん，答えてちょうだい.${userName1}さんと映画を観るなら次のうちどれ？1番,アクション映画,2番,コメディ映画,3番,ミステリー映画,4番，アニメ映画</prosody>`
      ];
    };

    //質問をランダムで提示する
    size = speechText.length ;
    x = Math.floor(Math.random() * size);

    if(lastQuestionNumber === x){
      x = Math.floor(Math.random() * size);
    }

    sessionAttributes.number = x;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes)

    //今回の質問を記録する
    return getAttributes(handlerInput.attributesManager)
      .then((attributes) => {

        attributes.pastquestions = {
          id: 0,
          username1: userName1,
          username2: userName2,
          question: speechText[x],
          lastquestionnumber: x
        };

        handlerInput.attributesManager.setPersistentAttributes(attributes);
        return handlerInput.attributesManager.savePersistentAttributes()
          .then(() => {
            return handlerInput.responseBuilder
            .speak(speechText[x])
            .reprompt(speechText[x])
            .withSimpleCard('コイビトーク', speechText[x])
            .getResponse();
          });    
      })

    // return handlerInput.responseBuilder
    //   .speak(speechText[x])
    //   .reprompt(speechText[x])
    //   .withSimpleCard('コイビトーク', speechText[x])
    //   .getResponse();
  },
};

const FacilitateIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'FacilitateIntent';
  },
  handle(handlerInput) {

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    // attributes.username1 = '松村';
    // attributes.username2 = '佐藤';
    // attributes.number = 7;
    // handlerInput.attributesManager.setSessionAttributes(attributes)

    let userName1 = sessionAttributes.username1;
    let userName2 = sessionAttributes.username2;
    let number = sessionAttributes.number;

    // let userName1 = '松村';
    // let userName2 = '佐藤';
    // let number = 7;

    if(userName1 === undefined || userName2 === undefined){
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
        `<prosody pitch="x-low">え〜，本当にそこでいいの？${userName2}さんは行きたい？</prosody>`,
        `<prosody pitch="x-low">え〜，本当にそこでいいの？${userName1}さんは行きたい？</prosody>`,
        `<prosody pitch="x-low">え〜，本当にそこでいいの？${userName2}さんは行きたい？</prosody>`,
        `<prosody pitch="x-low">え〜，本当にそこでいいの？${userName1}さんは行きたい？</prosody>`,
        `<prosody pitch="x-low">え〜，本当にそれでいいの？${userName2}さんはしたい？</prosody>`,
        `<prosody pitch="x-low">え〜，本当にそれでいいの？${userName1}さんはしたい？</prosody>`,
        `<prosody pitch="x-low">え〜，本当にそうなの？${userName2}さんは納得した？</prosody>`,
        `<prosody pitch="x-low">え〜，本当にそうなの？${userName1}さんは納得した？</prosody>`,
        `<prosody pitch="x-low">え〜，本当にそこでいいの？${userName2}さんは行きたい？</prosody>`,
        `<prosody pitch="x-low">え〜，本当にそこでいいの？${userName1}さんは行きたい？</prosody>`,
        `<prosody pitch="x-low">え〜，本当にそれでいいの？${userName2}さんは観たい？</prosody>`,
        `<prosody pitch="x-low">え〜，本当にそれでいいの？${userName1}さんは観たい？</prosody>`
      ]
    };

    // handlerInput.attributesManager.setPersistentAttributes(attributes);
    // return handlerInput.attributesManager.savePersistentAttributes()
    //   .then(() => {
    //   return handlerInput.responseBuilder
    //       .speak(speechOutput)
    //       .withSimpleCard(SKILL_NAME, cardString)
    //       .reprompt(repromptSpeech)
    //       .getResponse();
    //   });

    return handlerInput.responseBuilder
      .speak(speechText[number])
      .reprompt(speechText[number])
      .withSimpleCard('コイビトーク', speechText[number])
      .getResponse();
  },
};

const ContinueIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ContinueIntent';
  },
  handle(handlerInput) {

    if(handlerInput.requestEnvelope.request.intent.slots.answer.resolutions.resolutionsPerAuthority[0].values[0].value.name === "はい"){
      speechText = `<prosody pitch="x-low">よかったじゃない．会話は盛り上がったかしら？また話題が欲しかったら呼んでちょうだい</prosody>`;
    }else if(handlerInput.requestEnvelope.request.intent.slots.answer.resolutions.resolutionsPerAuthority[0].values[0].value.name === "いいえ"){
      speechText = `<prosody pitch="x-low">あらそう．残念ね．会話は盛り上がったかしら？また話題が欲しかったら呼んでちょうだい</prosody>`;
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      // .reprompt(speechText)
      .withSimpleCard('コイビトーク', speechText)
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
  .withPersistenceAdapter(dynamoDbPersistenceAdapter)
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
  // .withPersistenceAdapter(
  //   new persistenceAdapter.S3PersistenceAdapter(
  //       {bucketName:process.env.S3_PERSISTENCE_BUCKET}))
  .lambda();