'use strict'
const saveCmdOptions = require('./saveCmdOptions')
const sorter = require('json-array-sorter')
const getFaction = require('./getFaction')
const { dataList } = require('./dataList')

module.exports = async(obj = {}, param)=>{
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
      let embedMsg = {
        content: 'There were multiple results for **'+ faction + '**. Please pick desired faction',
        components: [],
        flags: 64
      }
      let x = 0
      for(let i = 0; i < factList.length; i++){
        if(!embedMsg.components[x]) embedMsg.components[x] = { type:1, components: []}
        embedMsg.components[x].components.push({
          type: 2,
          label: factList[i].name,
          style: 1,
          custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, baseId: factList[i].value })
        })
        if(embedMsg.components[x].components.length == 5) x++;
      }
      embedMsg.components[x].components.push({
        type: 2,
        label: 'Cancel',
        style: 4,
        custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, cancel: true })
      })
      await saveCmdOptions(obj)
      return { msg2send: embedMsg };
    }
  }
  if(baseId) return await getFaction(baseId, true)
}
