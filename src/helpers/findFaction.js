'use strict'
const sorter = require('json-array-sorter')
const getFaction = require('./getFaction')
const replyComponent = require('./replyComponent')
const { dataList } = require('./dataList')

module.exports = async(obj = {}, param, getUnits = true)=>{
  let baseId, faction
  if(param) faction = param.toString().trim().toLowerCase()
  if(obj?.confirm?.baseId) baseId = obj.confirm.baseId
  if(!baseId && dataList?.factionList[param]) baseId = param
  if(!baseId){
    if(faction?.endsWith('s')) faction = faction.substring(0, faction.length - 1)
    let factList = Object.values(dataList?.factionList)?.filter(x=>x.name.toString().toLowerCase().includes(faction))
    if(factList?.length == 1) baseId = factList[0].value
    if(!baseId && factList.length > 1 && factList.length < 26){
      factList = sorter([{column: 'name', order: 'ascending'}], factList)
      let msg2send = {
        content: 'There were multiple results for **'+ faction + '**. Please pick desired faction',
        components: [],
        flags: 64
      }
      let x = 0
      for(let i = 0; i < factList.length; i++){
        if(!msg2send.components[x]) msg2send.components[x] = { type:1, components: []}
        msg2send.components[x].components.push({
          type: 2,
          label: factList[i].name,
          style: 1,
          custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, baseId: factList[i].value })
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
  if(baseId) return await getFaction(baseId, getUnits)
}
