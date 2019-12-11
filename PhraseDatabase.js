"use strict";
let {Helper} = require('helper-clockmaker')
let Logger = require("helper-clockmaker").Logger("PhraseDatabase");
let debug = require("debug")("PhraseDatabase");
let slotFiller = require("slot-filler")


/**
 * PhraseDatabase provides a way to access and generate a phrase database in mongo
 * given a phrase database file.  The phrase database file is a compact form of the
 * actual database stored in mongo.  By default the phrase database assumes you are
 * accessing the collection 'phrase', but this can be changed during initialization
 * through the options parameter.
 */
class PhraseDatabase {
  constructor() {
    this.phraseTableName = "phrase";
    this.count = 0;
    this.groupIndex = 0;
    this.phraseTable = []
  }

  close() {}

  /**
   * Initialize the access to the phrase table
   * @param options is used to change the default parameters.
   * options = {phraseTable : the name of the table in the 'phrasedb' directory one is interested in.}
   */
  initialize(options) {
    return Promise.resolve()
  }

  /**
   * The type is a combination of the imply plus the style of writing, past, present
   * indefinite etc..
   * @param source is the document from the database
   */
  getTypeIdentifier(source) {
    return Helper.getTypeIdentifier(source);
  }

  /**
   * Produce a map with all phrases of a specific type
   * The map is separated into arrays of the different implies
   * @param phraseType is the type of phrase to collect, "tell" for example.
   */
  getPhraseMap(phraseType) {
    Logger.debug("PhraseDatabase inside getPhraseMap");
    let np = new Promise((resolve, reject) => {
      let table = this.db.collection(this.phraseTableName);

      table.find({ phraseType: phraseType }).toArray((err, documents) => {
        if (err) {
          Logger.error(err);
          reject();
        } else {
          //Logger.debug('PhraseDatabase getting documents', documents)
          let tMap = new Map();

          for (let i = 0; i < documents.length; i++) {
            //let words = documents[i].implies.join(',');
            let words = this.getTypeIdentifier(documents[i]);

            if (tMap.get(words)) {
              //console.log(tMap.get(words))
              tMap.get(words).push(documents[i]);
            } else {
              tMap.set(words, [documents[i]]);
            }
          }

          resolve(tMap);
        }
      });
    });

    return np;
  }

  /**
   * Search through the database and retrieve all the entries
   * that match the following search.
   */
  getList(phraseType, implies) {
    //filter list for phraseType and implies, this should actually be
    //be cached.
    this.phraseTable.filter((element)=>{
      return (element.phraseType == phraseType) && element.implies.includes(implies)
    })
  }

  /**
   * Add a list of phrases and list of responses with an associated group
   */
  addGroup(obj, definitions) {
    debug("adding obj", obj);
    Helper.hasProperties(obj, ["meta", "target", "implies", "phraseType"]);
    Helper.hasProperties(obj.meta, ["group"]);

    obj.meta.groupIndex = this.groupIndex;

    let storage = { phrase: null, response: null };

    if (obj.storage) {
      if (typeof obj.storage === "string") {
        debug(obj.storage);
        if (definitions) {
          if (!definitions[obj.storage]) {
            debug("definition", obj.storage, "undefined");
          } else {
            storage.phrase = definitions[obj.storage].phrase;
            storage.response = definitions[obj.storage].response;
          }
        }
      } else if (typeof obj.storage === "object") {
        storage.phrase = obj.storage.phrase;
        storage.response = obj.storage.response;
      }
    }

    let exampleWildcards = null
    //TODO: Just get the first wildcard for now - will implement more in the future
    if(obj.exampleWildcards) {
      exampleWildcards = {}
      for(let key in obj.exampleWildcards) {
        exampleWildcards[key] = obj.exampleWildcards[key][0];
      }
    }

    let pList = [];
    if (obj.phrase) {
      //If it has a phrase block
      for (let i = 0; i < obj.phrase.length; i++) {
        let example = obj.phrase[i]
        
        if(exampleWildcards!=null) {
          debug('obj.phrase',obj.phrase[i], "exampleWildcards", exampleWildcards)
          example = slotFiller.reconstructPhrase(obj.phrase[i], exampleWildcards).phrase
        }

        let no = this.addPhrase({
          exampleWildcards : obj.exampleWildcards,
          example : example,
          phrase: obj.phrase[i],
          phraseType: obj.phraseType,
          implies: obj.implies,
          target: obj.target,
          meta: obj.meta,
          storage: storage.phrase
        });
        pList.push(no);
      }
    }

    //Increment the groupIndex so responses belong to a different group
    this.groupIndex++;

    let newObj = {
      phraseType: "tell",
      implies: obj.implies,
      target: obj.target,
      meta: obj.meta
    };

    if (obj.negative) {
      newObj.negative = obj.negative;
    }

    if (obj.response) {
      for (let i = 0; i < obj.response.length; i++) {
        
        let example = obj.response[i]
        if(exampleWildcards!=null) {
          example = slotFiller.reconstructPhrase(obj.response[i], exampleWildcards).phrase
        }

        newObj.phrase = obj.response[i];
        newObj.example = example
        newObj.continue = obj.continue ? obj.continue : [obj.response[i]];
        newObj.storage = storage.response;
        let no = this.addPhrase(Object.assign({}, newObj));
        pList.push(no);
      }
    }

    //Again, increment groupIndex for the next group
    this.groupIndex++;

    return pList;
  }

  //Create to sentences, one where terms in parentheses are ignored and
  //the other where they remain.
  reducePhrase(phrase) {
    let reducedPhrase = phrase.replace(/\([^)]*\)/g, "").match(/(\S+)/g);
    if (!reducedPhrase) {
      Helper.logAndThrow("It seems your database entry is empty : " + phrase);
    }

    let newPhrase = "";
    for (let i = 0; i < reducedPhrase.length; i++) {
      if (i == 0) {
        newPhrase = newPhrase + reducedPhrase[i];
      } else {
        newPhrase = newPhrase + " " + reducedPhrase[i];
      }
    }

    return newPhrase;
  }

  insertIntoPhraseTable(val) {
    this.phraseTable.push(val)
    return this.phraseTable
  }

  /**
   * Add a new phrase with a continuation phrase.  If the phrase is "We have tacos" the continuation
   * would be "bacon ", " salad" etc instead of "We have bacon".  The idea is if you have multiple
   * items the "We have" only needs to be stated once.
   * @param phrase is the text including wildcards which are in parentheses
   * @param continuation is the what is used if the phrase is continued.
   * @param phraseType is "tell", "query","confirm" since these belong to different classes
   * @param implies suggests the target of the question
   * @param meta is an object containing any additional information you might use
   */
  addPhrase(obj) {
    Helper.hasProperties(obj, ["target", "implies", "phraseType"]);

    if (!obj.meta) {
      obj.meta = {};
    }

    //Create to sentences, one where terms in parentheses are ignored and
    //the other where they remain.
    let newPhrase = this.reducePhrase(obj.phrase);

    let ans = obj.implies.sort();
    obj.words = newPhrase;
    obj.implies = ans;

    return this.insertIntoPhraseTable(obj);
  }
}

module.exports = PhraseDatabase;
