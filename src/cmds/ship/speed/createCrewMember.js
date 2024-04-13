'use strict'
let fakeMods
const maxModRarity = 6
const CreateFakeMods = ()=>{
  try{
    fakeMods = {}
    for(let i = 1; maxModRarity<7; i++){
      fakeMods[i] = []
      for(let s = 1;s<7; s++){
        fakeMods[i].push({
          definitionId: '1'+i+''+s,
          level: 15
        })
      }
    }
  }catch(e){
    console.error(e)
  }
}
CreateFakeMods()
module.exports = async(uInfo = {})=>{
  try{
    let res = {}, skills = Object.values(uInfo.skills)
    for(let r = 1;r<8;r++){
      let base = {
        definitionId: uInfo.baseId+':'+enumRarity[rarity],
        currentRarity: r,
        currentLevel: 85,
        equipment: [],
        equippedStatMod: [],
        skill: [],
        currentTier: 1,
        relic: {currentTier: 1}
      }
      if(!res[r]) res[r] = {base: [], gear: [], relic: []}

    }
  }catch(e){
    console.error(e);
  }
}
