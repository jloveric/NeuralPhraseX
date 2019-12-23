"use strict";

let { Helper } = require("helper-clockmaker");
let Logger = require("helper-clockmaker").Logger("Phrasex");

let reRank = require("./ReRank.js").reRank;
let PhraseMatcher = require("./PhraseMatcher.js");
let PhraseHitsFilterFactory = require("./PhraseHitsFilter.js");
let slotFiller = require("slot-filler");
let {computeSemanticScore} = require('./Util.js')


let debug = require("debug")("Phrasex");
let { NeuralSentenceSearch } = require('neural-sentence-search')

/**
 * This class is the phrase matcher and uses the slotFiller with specific phrases.
 * It also performs various other actions and has phrase filters etc...  In particular,
 * this class can match the phrase "Do you have tacos" with the elastic search match
 * "Do you have (item)" and then resolve {item : 'tacos'}
 */
class Phrasex extends PhraseMatcher {
  constructor(database) {
    super();
    this.hitsFilter = PhraseHitsFilterFactory("NoPhraseFilter");
    this.database = database;
    this.nn = new NeuralSentenceSearch()
  }

  /**
   * Initialize with options
   * options = null or
   * options = {database : something} where database is an alternative to using
   * the phrasedb.
   */
  async initialize() {
    await this.nn.initialize();
    for (let i = 0; i < this.database.phraseTable.length; i++) {
      let val = this.database.phraseTable[i]
      debug('val', val)
      await this.nn.addClass(val, val.example)
    }
  }

  setHitsFilter(val) {
    this.hitsFilter = val;
  }

  filterResults(equalList) {
    //if(!equalList.length) return null;
    try {
      let tellList = [];
      let otherList = [];
      for (let i = 0; i < equalList.length; i++) {
        debug("checking loop", equalList[i].result.key);
        if (equalList[i].result.key.phraseType == "tell") {
          tellList.push(equalList[i]);
        } else {
          otherList.push(equalList[i]);
        }
      }

      //Looks like we are putting the tells at the bottom of the list
      otherList = otherList.concat(tellList);

      return otherList;
    } catch (e) {
      debug("SOMETHING IS WRONG_________________________________");
    }
  }

  /**
   * Find the phrase in the database that best matches searchText
   * @param searchText is the text to match
   * @param userData is a UserData object which contains history and phraseFrequency etc...
   *
   * @return wcDB is the document that best matches searchText
   * @return wcUser is searchText tokenized based on whitespace
   * @return matchScore is the scoring for each word, -3 unmatched stopword
   * 			-1 means unmatched word, -2 means unmatched word immediately
   * 			following another unmatched word
   * @return match is the elasticsearch document, represents the phrase in the
   * 			phrase database.
   * @return returns the list of matched words with associated indexes given
   * in 'bestMatch' and returns unmatched words with the index given as -1.
   */
  async find(searchText, userData) {
    debug("Stepping into phrasex find", searchText);
    Helper.logAndThrowUndefined("Phrasex search text is undefined", searchText);

    Logger.info("searching for text", searchText);

    debug("database", this.database);

    let p = await this.nn.search(searchText,10)
    

    /*if (body.hits.total == 0) {
      Logger.warn("No match for query", searchText);
      return Promise.reject([{ confidence: 0.0 }]);
      //return;
    }*/

    //Logger.error('Hits',body.hits.hits);
    let hits = this.hitsFilter.filter(p);

    //get the phrase from elastic search with the closest match and tokenize*/
    let hitList = reRank(hits, searchText, userData.phraseFrequency);
    let orderedList = this.filterResults(hitList);

    debug('orderedList', orderedList)

    if (!orderedList.length) {
      Logger.warn("No hits match", searchText);
      return Promise.reject([{ confidence: 0.0 }]);
    }

    let pList = [];
    for (let i = 0; i < orderedList.length; i++) {
      debug('orderedList[i]', orderedList[i])
      let hit = orderedList[i].result.key;

      debug("hit", hit);

      let source = hit;
      let highlight = '';

      Logger.debug("Source", hit);
      let bestMatch = source["phrase"].match(Helper.tokenize);

      //tokenize the query
      let query = searchText.match(Helper.tokenize);

      debug('bestMatch1', bestMatch, 'query', query, 'orderList[i].score',orderedList[i].score)

      //We already know the score so we don't need to call alignWords
      let align = slotFiller.computeQueryIndex(
        orderedList[i].score,
        bestMatch,
        query
      );

      //Add back in the semantic score since it's not used in slotfiller right now
      align.semantic = computeSemanticScore(orderedList[i].result.distance)

      let queryIndex = align.queryIndex;

      //Runs through the words and check for stopwords if the index is
      //already -1.  Stopwords will be -3.
      //Also, make sure at least one value matched, i.e., index>=0

      let numMatched = 0;
      for (let i = 0; i < queryIndex.length; i++) {
        if (queryIndex[i].index == -1) {
          let simpleWord = queryIndex[i].word
            .replace(Helper.nonAlphaNumeric, "")
            .toLowerCase();
          let isStop = Helper.isStopWord(simpleWord);
          if (isStop) {
            //Mark as a stopword
            queryIndex[i].index = -3;
          }
        }

        if (queryIndex[i].index >= 0) {
          numMatched = numMatched + 1;
        }
      }

      //Combine all scores, of course this isn't great...
      let score = 0.5*(align.score * align.order * align.size + align.semantic);

      debug("queryIndex", queryIndex);

      //if (numMatched) {
        let ans = {
          wcDB: bestMatch,
          wcUser: query,
          matchScore: queryIndex,
          source: source,
          highlight: highlight.words,
          confidence: score,
          score: align
        };

        //console.log('Phrasex Response', ans)
        //return Promise.resolve(ans);
        debug("adding to plist", ans);
        pList.push(ans);
        //return Promise.resolve([ans])
      /*} else {
        Logger.warn("Wasn't able to match a single word");
        //pList.push({confidence : 0.0})
        //return Promise.reject({ confidence: 0.0 });
      }*/
    }

    //debug('PLIST', pList)
    if (pList.length) {
      return pList;
    }

    return Promise.reject([{ confidence: 0.0 }]);

  }

  /**
   * Get the wildcards for a given phrase
   * @param phrase is the phrase passed in, example "Where are the the hash browns".
   * @param keywords are special words to help differentiate neighboring
   * wildcards where one wildcard is a keyword
   * @param userData is a UserData object for storing information (including statistics and history)
   * for a given user.
   * @return the promise containing the source and the wildcards.
   */
  async getWildcardsAndMatch(phrase, keywords, userData) {
    debug("getWildcardsAndMatch");
    if (!phrase) {
      return Promise.resolve();
    }

    let resArrayList = await this.find(phrase, userData);
    Logger.debug("searching phrase", phrase);

    return this.getWildcardsAndMatchNoSearch(resArrayList, keywords, userData)
  }

  /**
   * Get the wildcards for a given phrase
   * @param resArrayList is a list of matching phrases.
   * @param keywords are special words to help differentiate neighboring
   * wildcards where one wildcard is a keyword
   * @param userData is a UserData object for storing information (including statistics and history)
   * for a given user.
   * @return the promise containing the source and the wildcards.
   */
  getWildcardsAndMatchNoSearch(resArrayList, keywords, userData) {
    //For now deal with the first result
    let pList = [];
    for (let i = 0; i < resArrayList.length; i++) {
      let resArray = resArrayList[i];

      Logger.debug(resArray);
      let bestMatch = resArray.wcDB;
      let query = resArray.wcUser;
      let queryIndex = resArray.matchScore;
      let source = resArray.source;
      let score = resArray.confidence;

      debug('bestMatch', bestMatch, 'query', query, 'queryIndex', queryIndex, 'keywords', keywords)

      //console.log("bestmatch",bestMatch)
      let wcAndScore = slotFiller.computeWildcards(
        bestMatch,
        query,
        queryIndex,
        keywords
      );

      //console.log('source', source, 'wildcards', wildcards, resArray)
      pList.push({
        source: source,
        wildcards: wcAndScore.wildcards,
        confidence: score,
        wcScore: wcAndScore.score,
        score: resArray.score
      });
    }

    return pList;
  }
}

module.exports = Phrasex;
