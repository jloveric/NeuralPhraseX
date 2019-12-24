"use strict";
let Helper = require("helper-clockmaker").Helper;
let debug = require("debug")("ReRank");
let {computeSemanticScore} = require('./Util.js')

let sentenceSimilarity = require("sentence-similarity");
let similarityScore = require('similarity-score')
let similarity = sentenceSimilarity
let deepcopy = require("clone");

//Compare the complete score
function compare(a, b) {
  let scoreA = a.score.score * a.score.order * a.score.size * a.score.semantic;
  let scoreB = b.score.score * b.score.order * b.score.size * a.score.semantic;

  if (scoreA < scoreB) {
    return 1;
  } else if (scoreA > scoreB) {
    return -1;
  }
  return 0;
}

//Compare the matchScore only
function compareScore(a, b) {
  let scoreA = a.score.score;
  let scoreB = b.score.score;

  if (scoreA < scoreB) {
    return 1;
  } else if (scoreA > scoreB) {
    return -1;
  }
  return 0;
}

//Compare the matchScore only
function compareExactScore(a, b) {
  let scoreA = a.score.exact;
  let scoreB = b.score.exact;

  if (scoreA < scoreB) {
    return 1;
  } else if (scoreA > scoreB) {
    return -1;
  }
  return 0;
}

//Compare the semantic score only
function compareSemanticScore(a, b) {
  let scoreA = a.score.semantic;
  let scoreB = b.score.semantic;

  if (scoreA < scoreB) {
    return 1;
  } else if (scoreA > scoreB) {
    return -1;
  }
  return 0;
}

//Take an elasticsearch input and resort based on some measure
let reSort = function(esResult) {
  return esResult.sort(compareScore);
};

/**
 *
 */
let alignmentRank = function(rSet, searchText) {
  //Otherwise we need to compare!
  let searchArray = searchText.match(Helper.tokenize);

  debug('rSet', rSet)

  let ansList = [];

  let phraseOld = null;
  let scoreOld = null;
  for (let i = 0; i < rSet.length; i++) {
    let phrase = rSet[i].key.phrase;

    if (phrase == phraseOld) {
      //There can be 1000's of identical phrases so don't re-calculate the score in this case
      let ans = scoreOld;
      ansList.push({
        result: rSet[i],
        confidence: ans.score * ans.order * ans.size,
        score: deepcopy(ans)
      });
    } else {
      let wordArray = rSet[i].key.phrase.match(Helper.tokenize);
      //let ans = similarity(searchArray, wordArray, { f: similarityScore.metaphoneDl, options: { threshold: 0.3 } })
      let ans = similarity(searchArray, wordArray, similarityScore.commonScore);
      //debug('ans', ans)

      ansList.push({
        result: rSet[i],
        confidence: ans.score * ans.order * ans.size,
        score: ans
      });

      scoreOld = ans;
      phraseOld = phrase;
    }
    //ansList.push({ result: rSet[i], confidence: ans.score })
  }

  return ansList;
};

/**
 * Rank top results by frequency of occurence.  If wildcards are missing
 * then they need to be recovered from previous statements.
 * TODO: investigate this because I don't think I'm actually using it.
 */
let frequencyRank = function(rSet, phraseFrequency) {
  //Now if there is more than one, how do we differentiate?
  //Absolute probability
  let pSum = 0.0;
  let ansList = [];
  for (let i = 0; i < rSet.length; i++) {
    let gId = rSet[i].key.meta.groupIndex;
    let tp = phraseFrequency.getProbability(gId);
    ansList.push({ result: rSet[i], confidence: tp });
  }

  return ansList;
};

let combineRank = function(hits, searchText, phraseFrequency) {
  let ans1 = alignmentRank(hits, searchText);
  let ans2 = frequencyRank(hits, phraseFrequency);


  //TODO: This does not belong in here, bot OK
  //align.semantic = 1.0/(1.0+orderedList[i].result.distance)
  let ans3 = hits.map((val) => {
    debug('val', val)
    return {confidence : computeSemanticScore(val.distance)}
  })

  let newAns = [];
  for (let i = 0; i < hits.length; i++) {
    //let newConf = ans1[i].confidence;
    //if (ans1[i].confidence == bestAns.confidence) {
    let newConf = ans1[i].confidence + ans2[i].confidence + ans3[i].confidence;
    //}

    let combinedScore = ans1[i].score
    combinedScore.semantic = ans3[i].confidence

    debug("newConf", newConf);
    newAns.push({ result: hits[i], confidence: newConf, score : combinedScore });
  }

  return newAns;
};

/**
 * After you use elasticsearch (or something else) to return
 * a rough estimate of the best score, run through ReRank to
 * produce the final ranking.
 *
 * First filter on best semantic score
 * 
 * Then find the best exact score and accept all scores
 * where the exact score or partial score is better than
 * the best exact score.
 *
 * After that, filter based on the best overall score,
 * score*order*length.  If anything remains with the identical
 * score, then choose the one that is not a "tell" as sometimes
 * tells are identical to phrases.  Case in point is
 * "My name is john" can be both a greeting and a response - however,
 * we generally search on phrases and simply respond with response, there
 * is no search involved in the response.
 */
let reRank = function(hits, searchText, phraseFrequency) {
  //let rSet = Helper.topScores(hits);
  let rSet = hits;

  let newAns = combineRank(rSet, searchText, phraseFrequency);

  //Best semantic score
  newAns.sort(compareSemanticScore)
  let topSemantic = newAns[0].score.semantic
  let bestList = newAns.filter((val)=>{
    return val.score.semantic>=topSemantic
  })

  //Then based on the exact score
  newAns.sort(compareExactScore);
  debug(newAns);
  let bestScore = newAns[0].score.exact;
  //let bestList = [];
  if (bestScore > 0) {
    for (let i = 0; i < newAns.length; i++) {
      if (newAns[i].score.exact == bestScore) {
        bestList.push(newAns[i]);
      } else {
        break;
      }
    }
  }

  //Then add the ones with partial matches greater than the best score
  newAns.sort(compareScore);
  let otherScore = newAns[0].score.score;
  if (bestScore == 0) bestScore = otherScore;

  //Select results with the same number of matches
  for (let i = 0; i < newAns.length; i++) {
    if (newAns[i].score.score >= bestScore) {
      bestList.push(newAns[i]);
    } else {
      break;
    }
  }

  //Then use order an length normalization to disambiguate
  let bestAns = Helper.objectWithBestValue(bestList, (a, b) => {
    //What if two objects have the same score?
    //return a.score.order < b.score.order
    return (
      a.score.score * a.score.order * a.score.size + a.score.semantic<
      b.score.score * b.score.order * b.score.size + a.score.semantic
    );
    //return a.score.score < b.score.score
  });

  let bs = bestAns.score.score * bestAns.score.order * bestAns.score.size + bestAns.score.semantic;
  debug("bestAns", bestAns, "bs", bs);

  //Create an array where the scores are the highest and identical
  let equalList = [];
  for (let i = 0; i < bestList.length; i++) {
    let score = bestList[i].score;
    let a = score.score * score.order * score.size + score.semantic;
    debug("bestList", bestList[i]);
    debug("a", a, "bs", bs);
    if (a >= bs) {
      equalList.push(bestList[i]);
    }
  }

  if (equalList.length) {
    return equalList;
  }

  return null;
};

module.exports.combineRank = combineRank;
module.exports.reRank = reRank;
module.exports.alignmentRank = alignmentRank;
module.exports.frequencyRank = frequencyRank;
module.exports.reSort = reSort;
