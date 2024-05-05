'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const { replyComponent } = require('src/helpers')

module.exports = async(obj = {}, shard = {}, opt = {})=>{
  if(!shard.alias || shard.alias?.length === 0) return { content: 'There are no squad lead aliases for this server', components: [] }
  let alias = sorter([{column: 'alias', order: 'ascending'}], shard.alias)
  let embedMsg = {
    color: 15844367,
    title: 'Squad Lead Alias List',
    description: '```'
  }
  let msg2send = {content: null, embeds: [], components: [] }, aliasCount = 0, startIndex = obj.confirm?.index || 0
  for(let i = startIndex;i<alias.length;i++){
    if(aliasCount < 25){
      embedMsg.description += alias[i].alias+' : '+alias[i].nameKey+'\n'
      aliasCount++
    }else{
      break;
    }
  }
  embedMsg.title += ' ('+(aliasCount)+'/'+alias.length+')'
  embedMsg.description += '```'
  msg2send.embeds = [embedMsg]
  if(startIndex){
    msg2send.components.push({
      type: 1,
      components: [
        {
          type: 2,
          label: 'Previous',
          style: 1,
          custom_id: JSON.stringify({id: obj.id, index: startIndex - 25})
        }
      ]
    })
  }
  if(+alias.length > (startIndex + aliasCount)){
    if(msg2send.components.length == 0) msg2send.components.push({type: 1, components: []})
    msg2send.components[0].components.push({
      type: 2,
      label: 'Next',
      style: 1,
      custom_id: JSON.stringify({id: obj.id, index: (aliasCount + startIndex)})
    })
  }

  if(msg2send.components.length > 0){
    await replyComponent(obj, msg2send)
    return
  }
  return msg2send
}
