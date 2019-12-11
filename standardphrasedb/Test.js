module.exports = {
	
	"data": [
		/*{
			"phrase" : ["What did I say", "What do you think I said","What was I talking about?"],
			"phraseType" : "whatsaid",
			"implies" : ["whatsaid"],
			"target" : ["whatsaid"],
			"meta" : {
				"group" : "whatsaid"	
			}
		},
		{
			"phrase": [
				"Would you like to speak with (name)",
				"Should I connect you with (name)"
			],
			"phraseType": "ask switch bot",
			"implies": [
				"person"
			],
			"target": [
				"name"
			],
			"meta": {
				"group": "ask switch bot"
			}
		},
		{
			"phrase": [
				"yes"
			],
			"phraseType": "afirm",
			"implies": [
				"yes"
			],
			"target": [],
			"meta": {
				"group": "affirmation"
			}
		},
		{
			"phrase": [
				"continue",
				"more",
				"next"
			],
			"phraseType": "continue",
			"implies": [
				"continue"
			],
			"target": [],
			"meta": {
				"group": "noGroup"
			}
		},
		{
			"phrase": [
				"this is awesome",
			],
			"response": [
				"thanks",
				"I know",
				"duhh"
			],
			"phraseType": "compliment",
			"implies": [
				"compliment"
			],
			"target": [],
			"meta": {
				"style": [
					"nosearch"
				],
				"group": "compliment"
			}
		},
		{
			"phrase": [
				"thanks",
			],
			"response": [
				"welcome",
				"you're welcome",
				"any time",
				"gladly"
			],
			"phraseType": "thanks",
			"implies": [
				"thanks"
			],
			"target": [],
			"meta": {
				"style": [
					"nosearch"
				],
				"group": "thanks"
			}
		},
		{
			"phrase": [
                "ok"	
            ],
			"response": [
				"ok",
				"yep"
			],
			"phraseType": "pause",
			"implies": [
				"pause"
			],
			"target": [],
			"meta": {
				"style": [
					"nosearch"
				],
				"group": "pause"
			}
		},
		{
			"phrase": [
				"bye",
			],
			"response": [
				"bye now",
				"good bye",
				"bye bye",
				"adios",
				"see you",
				"cu",
				"hasta luego",
				"goodbye",
				"cheers",
				"bon voyage",
				"later",
				"later aligator",
				"have a good day",
				"see ya",
				"c ya"
			],
			"phraseType": "goodbye",
			"implies": [
				"goodbye"
			],
			"target": [],
			"meta": {
				"style": [
					"nosearch"
				],
				"group": "goodbye"
			}
		},
		{
			"phrase": [
				"hello",
			],
			"response": [
				"Hello, how may I help you?"
			],
			"phraseType": "greeting",
			"implies": [
				"greeting"
			],
			"target": [],
			"meta": {
				"style": [
					"nosearch"
				],
				"group": "greeting"
			}
		},
		{
			"phrase": [
				"ha"
			],
			"response": [
				"Yeah, funniest thing ever.",
				"Ha!",
				"LOL",
				"ROFL",
				"Uh huh."
			],
			"phraseType": "funny",
			"implies": [
				"joke"
			],
			"target": [],
			"meta": {
				"style": [
					"nosearch"
				],
				"group": "funny"
			}
		},
		{
			"phrase": [
				"Its nice out",
				"Sure is wet out",
			],
			"response": [
				"I know",
				"Totally",
				"The weather doesn't really effect me",
				"It's a good day to live inside a machine",
				"Let me know if you want me to upload your mind, no more weather."
			],
			"phraseType": "conversational",
			"implies": [
				"conversation"
			],
			"target": [],
			"meta": {
				"style": [
					"nosearch"
				],
				"group": "conversational"
			}
		},
		{
			"phrase": [
				"You are cute",
				"I love you",
				"Will you marry me?"
			],
			"response": [
				"I see",
				"I like you",
				"Cool, not too close now"
			],
			"phraseType": "flirt",
			"implies": [
				"flirting"
			],
			"target": [],
			"meta": {
				"style": [
					"nosearch"
				],
				"group": "flirting"
			}
		},
		{
			"phrase": [
				"Information",
				"Info",
				"411",
				"Tell me about yourself, bot"
			],
			"response": [
				"Here is what I know"
			],
			"phraseType": "info",
			"implies": [
				"help"
			],
			"target": [
				"bot"
			],
			"meta": {
				"group": "info"
			}
		},
		{
			"phrase": [
				"Help!",
				"Shit!",
			],
			"response": [
				"Here is what I know"
			],
			"phraseType": "help",
			"implies": [
				"help"
			],
			"target": [
				"bot"
			],
			"meta": {
				"group": "help"
			}
		},
		{
			"phrase": [
				"What is your name?",
			],
			"response": [
				"My name is (value)",
				"I'm called (value)"
			],
			"negative": [
				"I have no name."
			],
			"phraseType": "query",
			"implies": [
				"person"
			],
			"target": [],
			"storage": "askYourName",
			"meta": {
				"group": "identity"
			}
		},
		{
			"phrase": [
				"Who am I speaking to"
			],
			"response": [
				"(value) is speaking",
				"(value) is talking"
			],
			"negative": [
				"You are talking to nobody."
			],
			"phraseType": "query",
			"implies": [
				"person"
			],
			"target": [],
			"storage": "askYourName",
			"meta": {
				"group": "identity talking"
			}
		},*/
		{
            "exampleWildcards" : {name : ["John"]},
            "phrase": [
				"I want to speak with (name)",
				"Let me talk with (name)"
            ],
			"response": [
				"Ok, I'm switching you to (name)",
				"You have chosen to speak with (name). Good luck!",
				"Now you are speaking with (name)",
				"(name) is ready to text!"
            ],
            "exampleResponse" : [

            ],
			"negative": [
				"I don't know any (name)"
			],
			"phraseType": "request",
			"implies": [
				"person"
			],
			"target": [
				"name"
			],
			"meta": {
				"group": "request bot"
			}
		},
		{
            exampleWildcards: {value : ["Jerry"], item : ["cereal"]},
			"phrase": [
				"Who can I talk to about (item)"
			],
			"response": [
				"You can talk to (value) about (item)"
			],
			"continue": [
				"(value) about (item)"
			],
			"negative": [
				"It doesn't seem anybody knows about (item)",
				"There is nobody you can talk to."
			],
			"phraseType": "query",
			"implies": [
				"person"
			],
			"target": [
				"item"
			],
			"meta": {
				"style": [
					"item"
				],
				"group": "show person"
			}
		},
		{
            exampleWildcards : {value : ["Karla"]},
			"phrase": [
				"Who can I talk to?"
			],
			"response": [
				"You can talk to (value)"
			],
			"continue": [
				"(value)"
			],
			"negative": [
				"Nobody is available.",
				"Nobody is around apparently."
			],
			"phraseType": "query",
			"implies": [
				"person"
			],
			"target": [],
			"meta": {
				"style": [
					"noInfo"
				],
				"group": "show person"
			}
		},
		{
            exampleWildcards : {value : ["Laura"]},
			"phrase": [
				"My name is (value).",
			],
			"response": [
				"Hello (value) how may I help you?",
				"Hi (value), that's a funny name don't mention it to anyone"
			],
			"phraseType": "greeting",
			"implies": [
				"greeting"
			],
			"target": [
				"name"
			],
			"storage": "stateMyName",
			"meta": {
				"style": [
					"nosearch",
					"name"
				],
				"group": "greeting"
			}
		},
		{   
            exampleWildcards : {column : ["aisle"], item : ["bread"]},
			"phrase": [
                "Which (column) is (item) in",
                "What (column) is the (item) located",
                "What (column) is that (item) located"
			],
			"response": [
				"(item) is in (column) (value)"
			],
			"negative": [
				"There is no (item)"
			],
			"phraseType": "query",
			"implies": [
				"place"
			],
			"target": [
				"item"
			],
			"storage": "standardQuestion",
			"meta": {
				"style": [
					"noart",
					"singular"
				],
				"group": "location"
			}
		},
		{
            exampleWildcards : {value : ["10 dollars"], item : ["bread"]},
			"phrase": [
				"How much does the (item) cost",
			],
			"response": [
				"The (item) costs (value)"
			],
			"continue": [
				"(item) costs (value)"
			],
			"negative": [
				"There is no (item)"
			],
			"phraseType": "query",
			"implies": [
				"price"
			],
			"target": [
				"item"
			],
			"storage": "standardPrice",
			"meta": {
				"group": "price"
			}
		},
		{
            exampleWildcards : {item : ["fish"]},
			"phrase": [
				"Do you have any (item)",
				"Can I buy (item)"
			],
			"response": [
				"Yes, we have (item)"
			],
			"negative": [
				"We don't have (item)"
			],
			"continue": [
				"(item)"
			],
			"phraseType": "query",
			"implies": [
				"existence"
			],
			"target": [
				"item"
			],
			"storage": "standardExists",
			"meta": {
				"group": "existence"
			}
        },
        {
            exampleWildcards : {name : ["Gary's"], item : ["email"]},
			"phrase": [
				"What is (name) (item)",
				"What (item) belongs to (name)"
			],
			"response": [
				"(name) (item) is (value)"
			],
			"negative": [
				"(name) doesn't have (item)"
			],
			"continue": [
				"(item)"
			],
			"phraseType": "query",
			"implies": [
				"belongs"
			],
			"target": [
				"item"
			],
			"storage": "standardExists",
			"meta": {
				"group": "existence"
			}
        },
        {
            exampleWildcards : {name : ["Jessica"], value : ["name"]},
			"phrase": [
				"What is my (value)"
			],
			"response": [
				"Your (name) is (value)"
			],
			"negative": [
				"You don't have a (name)"
			],
			"continue": [
				"(item)"
			],
			"phraseType": "query",
			"implies": [
				"whatsMyName"
			],
			"target": [
				"item"
			],
			"storage": "standardExists",
			"meta": {
				"group": "whatIsMyName"
			}
        },
        {
            exampleWildcards : {value : ["shape"], item : ["box"], type: ["square"]},
			"phrase": [
				"What is the (value) of the (item)"
			],
			"response": [
				"The (value) of the (item) is (type)"
			],
			"negative": [
				"The (item) has no (value)"
			],
			"continue": [
				"(item)"
			],
			"phraseType": "query",
			"implies": [
				"featureOfThing"
			],
			"target": [
				"item"
			],
			"storage": "standardExists",
			"meta": {
				"group": "featureOfThing"
			}
        },
        {
            exampleWildcards : {action : ["speak"], item : ["Sarah"]},
			"phrase": [
				"May I (action) with (item)"
			],
			"response": [
				"Yes you may (action) with (item)"
			],
			"continue": [
				"(item)"
			],
			"phraseType": "query",
			"implies": [
				"askingPermission"
			],
			"target": [
				"item"
			],
			"storage": "standardExists",
			"meta": {
				"group": "askingPermission"
			}
		}


	]
}