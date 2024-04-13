'use strict'
module.exports = (obj)=>{
  if(obj){
    let res = {
      total: 0
    }
    for(let i in obj){
      if(obj[i].relic.currentTier > 2){
        res.total++;
        let tempRelic = +obj[i].relic.currentTier - 2
        if(tempRelic > 4){
          if(res[tempRelic]){
            res[tempRelic]++;
          }else{
            res[tempRelic] = 1
          }
        }
      }
    }
    return res;
  }
}
