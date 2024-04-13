'use strict'
module.exports = (obj = {})=>{
  let tempObj = {
    total: 0
  }
  for(let i in obj){
    if(obj[i].relic.currentTier > 2){
      tempObj.total++;
      let tempRelic = +obj[i].relic.currentTier - 2
      if(tempRelic > 4){
        if(tempObj[tempRelic]){
          tempObj[tempRelic]++;
        }else{
          tempObj[tempRelic] = 1
        }
      }
    }
  }
  return tempObj;
}
