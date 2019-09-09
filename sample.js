intent = {
    "interactionModel": {
        "interactionModel": {
            "invocationName": "コイビトーク",
            "intents": [
                {
                    "name": "AMAZON.CancelIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.HelpIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.StopIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.NavigateHomeIntent",
                    "samples": []
                },
                {
                    "name": "TopicIntent",
                    "slots": [
                        {
                            "name": "thema",
                            "type": "thema"
                        }
                    ],
                    "samples": [
                        "{thema} がない",
                        "{thema} を教えて",
                        "{thema}",
                        "{thema} を提供して"
                    ]
                },
                {
                    "name": "RegisterIntent",
                    "slots": [
                        {
                            "name": "name",
                            "type": "name"
                        }
                    ],
                    "samples": [
                        "{name} です",
                        "{name} "
                    ]
                }
            ],
            "types": [
                {
                    "name": "thema",
                    "values": [
                        {
                            "name": {
                                "value": "話題",
                                "synonyms": [
                                    "会話",
                                    "話"
                                ]
                            }
                        }
                    ]
                },
                {
                    "name": "name",
                    "values": [
                        {
                            "name": {
                                "value": "みちこ"
                            }
                        },
                        {
                            "name": {
                                "value": "はなこ"
                            }
                        },
                        {
                            "name": {
                                "value": "たろう"
                            }
                        }
                    ]
                },
                {
                    "name": "prefectures",
                    "values": [
                        {
                            "name": {
                                "value": "広島"
                            }
                        },
                        {
                            "name": {
                                "value": "東京"
                            }
                        },
                        {
                            "name": {
                                "value": "大阪"
                            }
                        }
                    ]
                }
            ]
        }
    }
}

console.log(intent.interactionModel.interactionModel.types[2].values[1].name.value);