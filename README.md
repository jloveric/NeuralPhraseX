[![Build Status](https://travis-ci.org/jloveric/NeuralPhraseX.svg?branch=master)](https://travis-ci.org/jloveric/NeuralPhraseX)


# NeuralPhraseX
Work In Progress

Mixed neural network / fuzzy similarity based phrase database matching.  Uses universal sentence embeddings from Tensorflow combined with KNN and fuzzy similarity to perform slot filling based on a list of potential phrases.  The approach allows for one shot learning and the efficiency will be determined by KNN (or other approximate nearest neighbor).  The name "PhraseX" comes from "Regex", as it is a more flexible way of matching phrases than using regex and better suited for natural language.

The intent here is that this tool can be run in the browser and it will not depend on an external database.  Universal sentence embeddings will make it much better (though possibly slower) than the elasticsearch based version "PhraseX".
