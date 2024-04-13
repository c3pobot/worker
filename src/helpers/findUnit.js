'use strict'
const sorter = require('json-array-sorter')
const getUnit = require('./getUnit')
const { dataList } = require('./dataList')
const buttonPick = require('./buttonPick')

module.exports = async(obj = {}, param)=>{
  if(param){
    let baseId, unit = param.toString().trim().toLowerCase()
    if(obj?.confirm?.baseId) baseId = obj.confirm.baseId
    if(!baseId && dataList?.unitList[param]) baseId = param
    if(!baseId){
      let unitArray = Object.values(dataList?.unitList)?.filter(x=>x.name.toLowerCase().includes(unit))
      if(unitArray.length == 1) baseId = unitArray[0].baseId
      if(!baseId && unitArray.length > 1 && unitArray.length < 21){
        unitArray = sorter([{column: 'name', order: 'ascending'}], unitArray)
        const embedMsg = {
          content: 'There were multiple results for **'+ param + '**. Please pick desired unit',
          components: [],
          flags: 64
        }
        let x = 0
        for(let i = 0; i < unitArray.length; i++){
          if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
          embedMsg.components[x].components.push({
            type: 2,
            label: unitArray[i].name,
            style: 1,
            custom_id: JSON.stringify({id: obj.id, baseId: unitArray[i].baseId})
          })
          if(embedMsg.components[x].components.length == 5) x++;
        }
        await buttonPick(obj, embedMsg)
        return 'GETTING_CONFIRMATION';
      }
    }
    if(baseId) return await getUnit(baseId, true, true)
  }
}
