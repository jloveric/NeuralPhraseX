"use strict";
//Eric Brill's transformational algorithm. Transformation rules are specified in external files.

//possibly use tensorflow here, but this is fine and fast.
let pos = require("pos")

class PartsOfSpeech {
  constructor() {
    this.lexer = new pos.Lexer()
    this.tagger = new pos.Tagger()
  }

  getPartsOfSpeech(sentence) {
    //let tokens = this.tokenizer.tokenize(sentence);
    //return this.tagger.tag(tokens);
    let words = this.lexer.lex(sentence)
    let taggedWords = this.tagger.tag(words)
    return taggedWords
  }

  getNounScore(a) {
    let length = a.length;
    let nounCount = 0;
    for (let i = 0; i < a.length; i++) {
      //JJ is an adjective
      if (
        a[i][1] == "NN" ||
        a[i][1] == "N" ||
        a[i][1] == "JJ" ||
        a[i][1] == "NNP"
      ) {
        nounCount++;
      }
    }
    return nounCount / length;
  }
}

module.exports = PartsOfSpeech;
