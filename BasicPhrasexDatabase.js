"use strict";

let PhraseDatabase = require("./PhraseDatabase.js");
let debug = require("debug")("BasicPhrasexDatabase");
let {Helper, Logger} = require("helper-clockmaker");

module.exports = {
  
  subSet(a, index, definitions, pdb) {

    if (index < a.length) {
      //let p = Promise.resolve();
      let pList = [];
      for (let i = 0; i < a[index].length; i++) {
        pList.push(pdb.addGroup(a[index][i], definitions));
      }
      return pList;
    }

  },

  tQ(a, index, definitions, pdb) {
    if (index < a.length) {
      debug("Stepping into index")
      this.subSet(a, index, definitions, pdb)
      return this.tQ(a, index + 1, definitions, pdb);
    }
  },

  /**
   * Generate a phrase database file from the filename, if fileAsText
   * is supplied then just translate the text into the database
   * @param filename is the name of the file
   * @param fileAsText is a jsonObject that can be used instead of
   * reading from the hard drive.
   */
  generatePhraseDatabase: function (fileAsText) {
    let pdb = new PhraseDatabase();

    let pList = [];
    let jsFile = fileAsText;

    debug("jsFile phrases", jsFile.data.length);

    let a = [];
    let count = 0;
    while (count < jsFile.data.length) {
      let b = [];

      for (let j = 0; j < 10; j++) {
        if (jsFile.data[count]) {
          b.push(jsFile.data[count]);
          count++;
        }
      }

      a.push(b);
    }

    let definitions = jsFile.definitions;

    let p = this.tQ(a, 0, definitions, pdb);

    return pdb

  }
};

//module.exports.generatePhraseDatabase();
