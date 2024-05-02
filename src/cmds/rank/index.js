'use strict'
const numeral = require('numeral')
const { getOptValue, replyError } = require('src/helpers')
const getMaxRankJump = (currentRank) => {
  if (currentRank < 6) {
    return 1;
  } else if (currentRank < 13) {
    return currentRank - 4;
  } else if (currentRank < 19) {
    return currentRank - 5;
  } else if (currentRank < 24) {
    return currentRank - 6;
  } else if (currentRank < 33) {
    return currentRank - 7;
  } else if (currentRank < 39) {
    return currentRank - 8;
  } else if (currentRank < 55) {
    return currentRank - 9;
  } else {
    return numeral((currentRank * 0.85) - 1).format('0');
  }
}
module.exports = async(obj = {})=>{
  try{
    let msg2send = {content: 'You did not provide a starting rank'}
    let startRank = obj.data?.options?.rank?.value
    if(!startRank) return { content: 'You did not provide a starting rank' }

    let rankList = startRank
    if(startRank < 6){
      rankList += ' > 1'
    }else{
      let currentRank = startRank
      let ranks = []
      let i = 0
      while(i < 5){
        let nextRank = getMaxRankJump(currentRank);
        if(nextRank < 6) {
          ranks.push(nextRank)
          if(nextRank == 1){
            i = 5
          }else{
            if( i < 4){
              ranks.push(1)
              i = 5
            }
            i++
          }
        }else{
          ranks.push(nextRank);
          currentRank = nextRank;
          i++;
        }
      }
      for (let j in ranks) {
        rankList += " > " + ranks[j]
      }
    }
    let embedMsg = {
      color: 15844367,
      timestamp: new Date(),
      fields: [{
        name: "From rank " + startRank + " without refreshing",
        value: "You can reach the highest rank fighting **" + rankList + "**"
          }, {
        name: "Warning",
        value: "For some ranks this is an estimate. If it is not correct blame Chewy"
      }]
    }
    return { content: null, embeds: [embedMsg] }
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
