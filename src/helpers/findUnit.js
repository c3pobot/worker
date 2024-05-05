'use strict'
const replyComponent = require('./replyComponent')
const sorter = require('json-array-sorter')
const getUnit = require('./getUnit')
const { dataList } = require('./dataList')

module.exports = async(obj = {}, param)=>{
  if(param){
    let baseId, unit = param.toString().trim().toLowerCase()
    if(obj?.confirm?.baseId) return await getUnit(obj?.confirm?.baseId, true, true)
    if(!baseId && dataList?.unitList[param]) baseId = param
    if(!baseId){
      let unitArray = Object.values(dataList?.unitList)?.filter(x=>x.name.toLowerCase().includes(unit))
      if(unitArray.length == 1) baseId = unitArray[0].baseId
      if(!baseId && unitArray.length > 1 && unitArray.length < 21){
        unitArray = sorter([{column: 'name', order: 'ascending'}], unitArray)
        let msg2send = {
          content: 'There were multiple results for **'+ param + '**. Please pick desired unit',
          components: [],
          flags: 64
        }
        let x = 0
        for(let i = 0; i < unitArray.length; i++){
          if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: []}
          msg2send.components[x].components.push({
            type: 2,
            label: unitArray[i].name,
            style: 1,
            custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, baseId: unitArray[i].baseId })
          })
          if(msg2send.components[x].components.length == 5) x++;
        }
        msg2send.components[x].components.push({
          type: 2,
          label: 'Cancel',
          style: 4,
          custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, cancel: true })
        })
        return await replyComponent(obj, msg2send)
      }
    }
    if(baseId) return await getUnit(baseId, true, true)
  }
}
