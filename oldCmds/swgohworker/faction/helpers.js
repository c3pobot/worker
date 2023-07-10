'use strict'
const Cmds = {}
Cmds.GetTopUnits = async (pObj, eObj) => {
  try{
    const obj = {
      player: [],
      enemy: []
    }
    let pArray = pObj ? (pObj.length > 20 ? pObj.slice(0,20):pObj):[];
    for (let i in pArray) {
      obj.player.push(pArray[i])
      obj.enemy.push(eObj.find(x => x.baseId == pArray[i].baseId))
    }
    if(obj.player.length > 15){
      let enemyTop = []
      for(let i = 0;i<10;i++){
        if(eObj[i] && obj.player.filter(x=>x.baseId === eObj[i].baseId).length === 0) enemyTop.push(eObj[i]);
      }
      if(enemyTop.length > 0){
        const end = (enemyTop.length > 4 ? 15:(20 - (+enemyTop.length)));
        obj.player = obj.player.slice(0, end)
        obj.enemy = obj.enemy.slice(0, end)
        for(let i = 0; i<5;i++){
          if(enemyTop[i]){
            obj.enemy.push(enemyTop[i])
            obj.player.push(pObj.find(x=>x.baseId === enemyTop[i].baseId))
          }
        }
      }
    }
    return obj
  }catch(e){
    console.error(e)
  }
}
module.exports = Cmds
