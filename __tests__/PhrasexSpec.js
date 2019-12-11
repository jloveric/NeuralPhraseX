"use strict";

let Phrasex = require("../Phrasex.js");
let slotFiller = require("slot-filler");
let UserData = require("../UserData.js");
let DefaultDatabase = require("../standardphrasedb/Test.js")
//let DefaultDatabase = require("../standardphrasedb/Standard.js")

let pd = require("../BasicPhrasexDatabase.js")

let phrasex = null

describe("Testing Phrasex", function () {

  beforeAll(async function (done) {
    let ans = pd.generatePhraseDatabase(DefaultDatabase)
    phrasex = new Phrasex(ans)
    let res = await phrasex.initialize()
    done()
  },100000000);

  /*it("Should make guesses with ambiguous data", async function (done) {
    
    let pList = [];
    console.log('phrasex', phrasex)
    
    await  simpleTest(phrasex, "the tacos are in aisle 2", {
        item: "tacos",
        column: "aisle",
        value: "2"
      })
    

    await Promise.all(pList)
    done()

  }, 10000000);*/


  it("This should produce the correct wildcards", async function (done) {

    await simpleTest(
      phrasex,
      "muc duz taco salad cot",
      { item: "taco salad" },
      "How much does the taco salad cost"
    )

    await simpleTest(
      phrasex,
      "What is the true color of the banana",
      { item: "banana" },
      "What is the true color of the banana"
    )

    await simpleTest(
      phrasex,
      "What is true color of banana",
      { value: "true color", item: "banana" },
      "What is the true color of the banana"
    )

    await simpleTest(
      phrasex,
      "What is John Loverich email",
      { name: "John Loverich", item: "email" },
      null,
      ["mail", "address", "email"]
    )

    //Show that we can get an answer when there are more wildcards than
    //holes to fill.  The result is wrong, but it is the best you can do
    //when no keyword is matched and it is better than crashing.
    await simpleTest(
      phrasex,
      "What is John Loverich email",
      { name: "John" },
      null,
      ["mail", "address", "tmail"],
      true
    )

    //With non alphanumeric character in keywords (?).
    await simpleTest(
      phrasex,
      "What is John Loverich email?",
      { item: "John Loverich", item: "email" },
      null,
      ["mail", "address", "email"],
      true
    )

    //check for case sensitivity on the column value.
    await simpleTest(
      phrasex,
      "What is John Loverich Email?",
      { name: "John Loverich", item: "Email" },
      null,
      ["mail", "address", "email"],
      true
    )

    await simpleTest(
      phrasex,
      "What aisle is that taco salad located",
      { item: "taco salad", column: "aisle" },
      "What aisle is that taco salad located"
    )

    await simpleTest(
      phrasex,
      "What aisle is that located",
      { item: null, column: "aisle" },
      null,
      "What (column) is that (item) located"
    )

    await simpleTest(
      phrasex,
      "What is my name",
      { value: "name" },
      null,
      "What is my (name)"
    )

    //Show that we get the correct reconstruction
    let res = slotFiller.reconstructPhrase("The (item) is in (column)", {
      item: "tomato",
      column: "aisle 2"
    });
    expect(res.phrase).toEqual("The tomato is in aisle 2");
    expect(res.success).toEqual(true);

    done();

  }, 10000000);

  /*it("Should produce reasonable scores", function(done) {
    let phrasex = new Phrasex();
  
    let pList = [];
  
    let userData = new UserData();
    phrasex
      .getWildcardsAndMatch("May I speak with hi my name is jake", [], userData)
      .then(ans => {
        console.log(ans);
        expect(ans[0].confidence).toBe(1);
        return phrasex.getWildcardsAndMatch(
          "May I speak with jake",
          [],
          userData
        );
      })
      .then(ans => {
        console.log(ans);
        expect(ans[0].confidence).toBeTruthy(1);
        return phrasex.getWildcardsAndMatch(
          "I may speak with jake",
          [],
          userData
        );
      })
      .then(ans => {
        console.log(ans);
        expect(ans[0].confidence < 1).toBeTruthy();
        return phrasex.getWildcardsAndMatch("Hi my name is jake", [], userData);
      })
      .then(ans => {
        console.log(ans);
        expect(ans[0].confidence).toBe(1);
        return phrasex.getWildcardsAndMatch("my I speeek", [], userData);
      })
      .then(ans => {
        console.log("---------yo-------------", ans);
        expect(ans[0].confidence < 1.0).toBeTruthy();
        done();
      });
  }, 10000);
  
  it("It should be able to fill in wildcards from older data", function() {
    let userData = new UserData();
    userData.initialize(1);
  
    let o1 = { wildcards: { item: "pickles" } };
    let o2 = { wildcards: { name: "john" } };
    let o3 = { wildcards: { column: "store" } };
    let o4 = { wildcards: { item: "tuna" } };
    let o5 = { wildcards: { item: "fish" } };
  
    userData.unshiftHistory(o1);
    userData.unshiftHistory(o2);
    userData.unshiftHistory(o3);
    userData.unshiftHistory(o4);
    userData.unshiftHistory(o5);
  
    let phrasex = new Phrasex();
  
    let ans = slotFiller.getWildcardFromHistory("item", userData.history, 5);
    console.log(ans);
    expect(ans.length).toBe(3);
  
    expect(ans[0]).toBe("fish");
    expect(ans[1]).toBe("tuna");
    expect(ans[2]).toBe("pickles");
  
    ans = slotFiller.getWildcardFromHistory("column", userData.history, 3);
    expect(ans.length).toBe(1);
    expect(ans[0]).toBe("store");
  
    console.log(ans);
  }, 10000);*/
});

var simpleTest = async function (
  phrasex,
  phrase,
  expectedWildcard,
  expectedReconstructedPhrase,
  keywords,
  success,
  expectedPhrase
) {
  let userData = new UserData();
  userData.initialize();

  console.log('phrase', phrase)
  let resArray = await phrasex.find(phrase, userData)
  console.log('resArray', resArray)
  let res = resArray[0];

  console.log(phrase);
  let wcAndScore = slotFiller.computeWildcards(
    res.wcDB,
    res.wcUser,
    res.matchScore,
    keywords
  );
  let wc = wcAndScore.wildcards;
  console.log(res);
  //console.log(wc)

  for (let i in expectedWildcard) {
    expect(wc[i]).toEqual(expectedWildcard[i]);
  }

  if (expectedPhrase) {
    expect(res.source.phrase).toBe(expectedPhrase);
  }

  if (expectedReconstructedPhrase) {
    let ans = slotFiller.reconstructPhrase(res.source.phrase, wc);
    let phrase = ans.phrase;

    expect(phrase).toEqual(expectedReconstructedPhrase);
    console.log(phrase);

    if (success != null) {
      expect(success).toEqual(tSuccess);
      console.log("success", tSuccess);
    }
  }

  console.log("");
};
