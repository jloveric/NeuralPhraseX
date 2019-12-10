"use strict";

let PhraseDatabase = require("../PhraseDatabase.js");
let DefaultDatabase = require("../standardphrasedb/DefaultDatabase.js")
let pd = require("../BasicPhrasexDatabase.js")

let debug = require('debug')('PhraseDatabaseSpec')

describe("Testing the phrase database", function() {
  it("Should tag the parts of speech", function() {

    //console.log('DefaultDatabase', DefaultDatabase)

    let ans = pd.generatePhraseDatabase(DefaultDatabase)

    console.log('ans', ans.phraseTable)
  });
});