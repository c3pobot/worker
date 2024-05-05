'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const { botSettings } = require('src/helpers/botSettings')

const getComponentOptions = (array, type, start = 0, end)=>{
  let res = []
  if(start !== 0) res.push({
    label: end+' previous '+type.toLowerCase()+' squads..',
    value: JSON.stringify({type: type.toLowerCase(), index: (start - end)}),
    description: 'show previous squads'
  })
  end = start + end
  if(end > +array.length) end = +array.length
  for(let i = start;i < end;i++) res.push({
    label: array[i].nameKey+' ('+(array[i].units? array[i].units.length+' units':array[i].squads.length+' squads')+')',
    value: JSON.stringify({ squadId: array[i]._id }),
    description: type+' Squad '+array[i].nameKey
  })
  if(array.length > end) res.push({
    label: (+array.length - end)+' more '+type.toLowerCase()+' squads..',
    value: JSON.stringify({type: type.toLowerCase(), index: end}),
    description: 'Show more squads'
  })
  return res
}
const checkOption = (string)=>{
  if(string) return JSON.parse(string)
}

const checkSquad = require('./check')
const { replyComponent, getGuildId } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  let dId = opt.user?.value || obj.member?.user?.id, parentId, startIndex = { global: 0, player: 0, server: 0, guild: 0 }, guildSquads = []
  if(botSettings?.squadLink) parentId = botSettings?.squadLink[obj?.guild_id]
  let usr = opt.user?.data || obj.member, search = opt.search?.value?.toString()?.trim()?.toLowerCase(), tempIndex = checkOption(obj.selectValues[0]) || {}

  if(tempIndex?.type && startIndex[tempIndex.type] >= 0) startIndex[tempIndex.type] = +tempIndex.index
  if(tempIndex.squadId) return await checkSquad(obj, { ...opt,...tempIndex })

  let globalSquads = await mongo.find('squadTemplate', { id: 'global' })
  let playerSquads = await mongo.find('squadTemplate', { id: dId })
  let serverSquads = await mongo.find('squadTemplate', { id: obj.guild_id })
  let gObj = await getGuildId( {dId: dId} )
  if(gObj?.guildId) guildSquads = await mongo.find('squadTemplate', { id: gObj.guildId })
  if(parentId){
    let parentSquads = await mongo.find('squadTemplate', { id: parentId })
    if(parentSquads?.length > 0){
      if(!serverSquads) serverSquads = []
      serverSquads = serverSquads.concat(parentSquads)
    }
  }
  if(playerSquads?.length > 0){
    if(search) playerSquads = playerSquads.filter(x=>x.nameKey.includes(search))
    playerSquads = sorter([{column: 'nameKey', order: 'ascending'}], playerSquads)
    let component = { type: 1, components: [{type: 3, custom_id: JSON.stringify({id: obj.id, type: 'p'}), options: [], placeholder: 'Choose a player squad ('+playerSquads.length+')'}]}
    component.components[0].options = getComponentOptions(playerSquads, 'Player', +startIndex.player, 23)
    if(component.components[0].options?.length > 0) msg2send.components.push(component)
  }

  if(serverSquads?.length > 0){
    if(search) serverSquads = serverSquads.filter(x=>x.nameKey.includes(search))
    serverSquads = sorter([{column: 'nameKey', order: 'ascending'}], serverSquads)
    let component = {type: 1, components: [{type: 3, custom_id: JSON.stringify({id: obj.id, type: 's'}), options: [], placeholder: 'Choose a server squad ('+serverSquads.length+')'}]}
    component.components[0].options = getComponentOptions(serverSquads, 'Server', +startIndex.server, 23)
    if(component.components[0].options?.length > 0) msg2send.components.push(component)
  }
  if(guildSquads?.length > 0){
    if(search) guildSquads = guildSquads.filter(x=>x.nameKey.includes(search))
    guildSquads = sorter([{column: 'nameKey', order: 'ascending'}], guildSquads)
    let component = {type: 1, components: [{type: 3, custom_id: JSON.stringify({id: obj.id, type: 'g'}), options: [], placeholder: 'Choose a guild squad ('+guildSquads.length+')'}]}
    component.components[0].options = getComponentOptions(guildSquads, 'Guild', +startIndex.guild, 23)
    if(component.components[0].options?.length > 0) msg2send.components.push(component)
  }
  if(globalSquads?.length > 0){
    if(search) globalSquads = globalSquads.filter(x=>x.nameKey.includes(search))
    globalSquads = sorter([{column: 'nameKey', order: 'ascending'}], globalSquads)
    let component = {type: 1, components: [{type: 3, custom_id: JSON.stringify({id: obj.id, type: 'gl'}), options: [], placeholder: 'Choose a global squad ('+globalSquads.length+')'}]}
    component.components[0].options = getComponentOptions(globalSquads, 'Global', +startIndex.global, 23)
    if(component.components[0].options?.length > 0) msg2send.components.push(component)
  }
  if(msg2send.components.length > 0){
    msg2send.content = 'Squad List Results'
    if(search) msg2send.content += ' for search **'+search+'**'
    if(usr) msg2send.content += ' for member **'+usr+'**'
    await replyComponent(obj, msg2send)
    return
  }
  msg2send.components = null
  if(search){
    msg2send.content = 'no squads where found for search **'+search+'**'
    if(usr) msg2send.content += ' for member **'+usr+'**'
  }
  return msg2send
}
