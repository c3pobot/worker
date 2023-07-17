'use strict'
const { configMaps } = require('helpers/configMaps')
const GetOptValue = require('./getOptValue')
const ButtonPick = require('./buttonPick')
const ReplyMsg = require('./replyMsg')
const sorter = require('json-array-sorter')
module.exports = async(obj = {}, opt = [], unitKey)=>{
  try{
    let baseId = GetOptValue(opt, unitKey)
    if(!baseId) return
    if(baseId && configMaps?.UnitMap[baseId]) return baseId
    let units = configMaps?.UnitArray.filter(x=>x.nameKey.toLowerCase().includes(baseId.toLowerCase()))
    if(units?.length === 0) return units[0].baseId
    if(units?.length < 6){
      units = sorter([{column: 'nameKey', order: 'descending'}], units)
      let msg2send = {
        content: 'There were multiple results for **'+ baseId + '**. Please pick desired unit',
        components: [],
        flags: 64
      }
      let i = units.length
      let component = { type: 1, components: []}
      while(i--){
        component.components.push({
          type: 2,
          label: units[i].nameKey,
          style: 1,
          custom_id: JSON.stringify({ id: obj.id, baseId: units[i].baseId })
        })
      }
      msg2send.components.push(component)
      await ButtonPick(obj, msg2send)
      return 'GETTING_CONFIRMATION'
    }else{
      if(units?.length > 6) await ReplyMsg(obj, { content: 'There was '+units.length+' results for '+baseId+' please be more specific...'})
    }
  }catch(e){
    throw(e)
  }
}
