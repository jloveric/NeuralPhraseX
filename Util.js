module.exports.computeSemanticScore = (distance)=>{
    return 1.0/(1.0+distance*distance)
}