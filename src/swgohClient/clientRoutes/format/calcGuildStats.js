'use strict'
module.exports = async(gObj = {}, members = [])=>{
  try{
    if(members?.length > 0){
      gObj.gp = 0
      gObj.gpChar = 0
      gObj.gpShip = 0
      gObj.zetaCount = 0
      gObj.sixModCount = 0
      gObj.omiCount = {total: 0, tb: 0, tw: 0, gac: 0, conquest: 0}
      let i = members?.length
      while(i--){
        gObj.gp += members[i].gp || 0
        gObj.gpChar += members[i].gpChar || 0
        gObj.gpShip += members[i].gpShip || 0
        gObj.zetaCount += members[i].zetaCount || 0
        gObj.sixModCount += members[i].sixModCount || 0
        gObj.omiCount.total += members[i].omiCount?.total || 0
        gObj.omiCount.tb += members[i].omiCount?.tb || 0
        gObj.omiCount.tw += members[i].omiCount?.tw || 0
        gObj.omiCount.gac += members[i].omiCount?.gac || 0
        gObj.omiCount.conquest += members[i].omiCount?.conquest || 0
      }
    }
  }catch(e){
    throw(e);
  }
}
