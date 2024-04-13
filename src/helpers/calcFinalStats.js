'use strict'
module.exports = (stats = {})=>{
  if(!stats.base)
  stats.final = {}
  let statList = Object.keys(stats.base);
  let addStats = statID => { if (!statList.includes(statID)) statList.push(statID); }
  if(stats.gear){
    Object.keys(stats.gear).forEach(addStats);
    if (stats.mods) Object.keys(stats.mods).forEach(addStats);
    statList.forEach( statID => {
      let flatStatID = statID;
      switch (~~statID) {
          // stats with both Percent Stats get added to the ID for their flat stat (which was converted to % above)
        case 21: // Ph. Crit Chance
        case 22: // Sp. Crit Chance
          flatStatID = statID - 7; // 21-14 = 7 = 22-15 ==> subtracting 7 from statID gets the correct flat stat
          break;
        case 35: // Ph. Crit Avoid
        case 36: // Sp. Crit Avoid
          flatStatID = ~~statID + 4; // 39-35 = 4 = 40-36 ==> adding 4 to statID gets the correct flat stat
          break;
        default:
      }
      stats.final[flatStatID] = stats.final[flatStatID] || 0; // ensure stat already exists
      stats.final[flatStatID] += (stats.base[statID] || 0) + (stats.gear[statID] || 0) + (stats.mods && stats.mods[statID] ? stats.mods[statID] : 0);
    });
  }else{
    Object.keys(stats.crew).forEach(addStats); // add stats from crew to list
    statList.forEach( statID => {
      stats.final[statID] = (stats.base[statID] || 0) + (stats.crew[statID] || 0);
    });
  }
}
