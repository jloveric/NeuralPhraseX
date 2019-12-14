[![Build Status](https://travis-ci.org/jloveric/NeuralPhraseX.svg?branch=master)](https://travis-ci.org/jloveric/NeuralPhraseX)


# NeuralPhraseX
Work In Progress

Mixed neural network / fuzzy similarity based phrase database matching.  Uses universal sentence embeddings from Tensorflow combined with KNN and fuzzy similarity to perform slot filling based on a list of potential phrases.  The approach allows for one shot learning and the efficiency will be determined by KNN (or other approximate nearest neighbor).  The name "PhraseX" comes from "Regex", as it is a more flexible way of matching phrases than using regex and better suited for natural language.

The intent here is that this tool can be run in the browser and it will not depend on an external database.  Universal sentence embeddings will make it much better (though possibly slower) than the elasticsearch based version "PhraseX".

## Install

```bash
npm install neural-phrasex
```

## How to use

```javascript
let {Phrasex, UserData, BasicPhrasexDatabase} = require("neural-phrasex");

let pd = require("../BasicPhrasexDatabase.js")

let phrasex = null

let simpleDatabase = {
  data: [
    {
      //The simplest entry has just a phrase and a class name - phraseType
      phrase: ["It is what it is."],
      phraseType: "isWhatIs"
    },
    {
      //A phrase and a response to a phrase can be included.
      phrase: ["what is your name?"],
      response: ["My name is Bot"],
      phraseType: "whatIsName",
      implies: ["whatIsName"]
    }, {
      //You can include just simple phrases with no wildcards
      exampleWildcards: { value: ["pig"], ans: ["animal"] },
      phrase: ["What is a (value)?"],
      response: ["A (value) is an animal."],
      phraseType: "whatIsThing",
    }, {
      //The wildcards are just examples of what could be put in the slots
      //These are necessary so that they can be passed to the neural network
      //to construct a sentence vector.
      exampleWildcards: { value: ["Seattle"], ans: ["Washington"] },
      phrase: ["where is (value)"],
      response: ["(value) is in (ans)"],
      phraseType: "whereIsThing"
    }
  ]
}

let compute = async () => {
  let ans = BasicPhrasexDatabase.generatePhraseDatabase(simpleDatabase)
  let phrasex = new Phrasex(ans)
  let res = await phrasex.initialize()
  
  let userData = new UserData();
  userData.initialize();

  let res1 = await phrasex.getWildcardsAndMatch("Where is Boston", "", userData)
  console.log(res1[0])

  let res2 = await phrasex.getWildcardsAndMatch("What is a coconut", "", userData)
  console.log(res2[0])
})

```
with result
```javascript

    {
      source: {
        exampleWildcards: { value: [Array], ans: [Array] },
        phrase: 'where is (value)',
        response: [ '(value) is in (ans)' ],
        phraseType: 'whereIsThing',
        implies: [ 'whereIsThing', 'whereIsThing' ],
        meta: { groupInex: 6 },
        example: 'where is Seattle',
        storage: null,
        words: 'where is'
      },
      wildcards: { matched: true, value: 'Boston' },
      confidence: 1,
      wcScore: { score: 1, count: 1 },
      score: {
        queryIndex: [ [Object], [Object], [Object] ],
        score: 2,
        order: 1,
        size: 0.5
      }
    }

  
    {
      source: {
        exampleWildcards: { value: [Array], ans: [Array] },
        phrase: 'What is a (value)?',
        response: [ 'A (value) is an animal.' ],
        phraseType: 'whatIsThing',
        implies: [ 'whatIsThing', 'whatIsThing' ],
        meta: { groupInex: 4 },
        example: 'What is a pig',
        storage: null,
        words: 'What is a ?'
      },
      wildcards: { matched: true, value: 'coconut' },
      confidence: 1,
      wcScore: { score: 1, count: 1 },
      score: {
        queryIndex: [ [Object], [Object], [Object], [Object] ],
        score: 3,
        order: 1,
        size: 0.3333333333333333
      }
    }
```
The result is a variation of the original database source plus the wildcards for filling
in the data.