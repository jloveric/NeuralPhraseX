"use strict";

let Phrasex = require("../Phrasex.js");
let slotFiller = require("slot-filler");
let UserData = require("../UserData.js");

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

describe("Testing Phrasex", function () {

  beforeAll(async function (done) {
    let ans = pd.generatePhraseDatabase(simpleDatabase)
    phrasex = new Phrasex(ans)
    let res = await phrasex.initialize()
    done()
  }, 100000000);

  //TODO: Fix this by adding a new class to the Test.js
  it("Should make guesses with ambiguous data", async function (done) {

    let userData = new UserData();
    userData.initialize();

    let res1 = await phrasex.getWildcardsAndMatch("Where is Boston", "", userData)
    console.log('res', res1[0])

    let res2 = await phrasex.getWildcardsAndMatch("What is a coconut", "", userData)
    console.log('res', res2[0])

    done()

  }, 10000000);

})
