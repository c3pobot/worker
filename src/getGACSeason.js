'use strict'
module.exports = async()=>{
  try{
    let events = await mongo.find('gacEvents', {}, {mode: 1, season: 1, _id: 0})
    if(events?.length > 0) events = events.filter(x=>x.season).reverse()
    console.log(events)
    if(events?.length > 0){
      for(let i in events){
        const tempObj = await HP.TestPage('https://swgoh.gg/gac/counters/season/'+events[i].season)
        console.log(tempObj)
      }
    }
  }catch(e){
    console.error(e);
  }
}
