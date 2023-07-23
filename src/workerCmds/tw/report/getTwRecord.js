'use strict'
module.exports = (warResults = [])=>{
  try{
    if(warResults.length === 0) return
    let res = {w: 0, l: 0, last: {status: 'W', time: 0}}, i = warResults.length
    while(i--){
      if(+warResults[i].score > +warResults[i].opponentScore){
        ++res.w
        if(+warResults[i].endTimeSeconds > res.last.time){
          res.last.time = +warResults[i].endTimeSeconds
          res.last.status = 'W'
        }
      }else{
        ++res.l
        if(+warResults[i].endTimeSeconds > res.last.time){
          res.last.time = +warResults[i].endTimeSeconds
          res.last.status = 'L'
        }
      }
    }
    return res
  }catch(e){
    throw(e)
  }
}
