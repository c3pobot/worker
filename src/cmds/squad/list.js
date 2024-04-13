'use strict'
const getComponentOptions = (array, type, start = 0, end)=>{
  try{
    const res = []
    if(start !== 0) res.push({
      label: end+' previous '+type.toLowerCase()+' squads..',
      value: JSON.stringify({type: type.toLowerCase(), index: (start - end)}),
      description: 'show previous squads'
    })
    end = start + end
    if(end > +array.length) end = +array.length
    for(let i = start;i < end;i++) res.push({
      label: array[i].nameKey+' ('+(array[i].units? array[i].units.length+' units':array[i].squads.length+' squads')+')',
      value: JSON.stringify([{name: 'squadId', value: array[i]._id}]),
      description: type+' Squad '+array[i].nameKey
    })
    if(array.length > end) res.push({
      label: (+array.length - end)+' more '+type.toLowerCase()+' squads..',
      value: JSON.stringify({type: type.toLowerCase(), index: end}),
      description: 'Show more squads'
    })
    return res
  }catch(e){
    console.error(e);
  }
}
const CheckOption = (string)=>{
  try{
    return JSON.parse(string)
  }catch(e){

  }
}
const CheckSquad = require('src/cmds/squad/check')
module.exports = async(obj, opt = [])=>{
  try{
    let msg2send = {content: 'Error getting squads', components: []}, guildSquads = [], startIndex = {global: 0, player: 0, server: 0, guild: 0}, parentId
    let dId = HP.GetOptValue(opt, 'user')
    if(botSettings?.squadLink) parentId = botSettings?.squadLink[obj?.guild_id]
    if(!dId) dId = obj.member.user.id
    let usr = obj.member.user.username
    if(obj.member.nick) usr = obj.member.nick
    if(obj.data?.resolved?.users[dId].username) usr = obj.data.resolved.users[dId].username
    if(obj.data?.resolved?.members[dId]?.nick) usr = obj.data.resolved.members[dId].nick
    let tempIndex = await CheckOption(obj?.select?.data[0])
    let search = HP.GetOptValue(opt, 'search')
    if(search) search = search.toString().toLowerCase().trim()
    if(tempIndex){
      if(tempIndex.type){
        if(startIndex[tempIndex.type] >= 0) startIndex[tempIndex.type] = +tempIndex.index;
      }else{
        if(Array.isArray(tempIndex)){
          await HP.ReplyButton(obj, 'Getting Squad **'+tempIndex[0]?.value+'**...')
          for(let i in opt) tempIndex.push(opt[i]);
          await CheckSquad(obj, tempIndex)
          return
        }
      }
    }
    let globalSquads = await mongo.find('squadTemplate', {id: 'global'})
    let playerSquads = await mongo.find('squadTemplate', {id: dId})
    let serverSquads = await mongo.find('squadTemplate', {id: obj.guild_id})
    const gObj = await HP.GetGuildId({dId: dId})
    if(gObj && gObj.guildId){
      guildSquads = await mongo.find('squadTemplate', {id: gObj.guildId})
    }
    if(parentId){
      let parentSquads = await mongo.find('squadTemplate', {id: parentId})
      if(parentSquads?.length > 0){
        if(!serverSquads) serverSquads = []
        serverSquads = serverSquads.concat(parentSquads)
      }
    }
    if(playerSquads?.length > 0){
      if(search) playerSquads = playerSquads.filter(x=>x.nameKey.includes(search))
      playerSquads = await sorter([{column: 'nameKey', order: 'ascending'}], playerSquads)
      const component = {type: 1, components: [{type: 3, custom_id: JSON.stringify({id: obj.id, type: 'p'}), options: [], placeholder: 'Choose a player squad ('+playerSquads.length+')'}]}
      component.components[0].options = await getComponentOptions(playerSquads, 'Player', +startIndex.player, 23)
      if(component.components[0].options?.length > 0) msg2send.components.push(component)
    }

    if(serverSquads?.length > 0){
      if(search) serverSquads = serverSquads.filter(x=>x.nameKey.includes(search))
      serverSquads = await sorter([{column: 'nameKey', order: 'ascending'}], serverSquads)
      const component = {type: 1, components: [{type: 3, custom_id: JSON.stringify({id: obj.id, type: 's'}), options: [], placeholder: 'Choose a server squad ('+serverSquads.length+')'}]}
      component.components[0].options = await getComponentOptions(serverSquads, 'Server', +startIndex.server, 23)
      if(component.components[0].options?.length > 0) msg2send.components.push(component)
    }
    if(guildSquads?.length > 0){
      if(search) guildSquads = guildSquads.filter(x=>x.nameKey.includes(search))
      guildSquads = await sorter([{column: 'nameKey', order: 'ascending'}], guildSquads)
      const component = {type: 1, components: [{type: 3, custom_id: JSON.stringify({id: obj.id, type: 'g'}), options: [], placeholder: 'Choose a guild squad ('+guildSquads.length+')'}]}
      component.components[0].options = await getComponentOptions(guildSquads, 'Guild', +startIndex.guild, 23)
      if(component.components[0].options?.length > 0) msg2send.components.push(component)
    }
    if(globalSquads?.length > 0){
      if(search) globalSquads = globalSquads.filter(x=>x.nameKey.includes(search))
      globalSquads = await sorter([{column: 'nameKey', order: 'ascending'}], globalSquads)
      const component = {type: 1, components: [{type: 3, custom_id: JSON.stringify({id: obj.id, type: 'gl'}), options: [], placeholder: 'Choose a global squad ('+globalSquads.length+')'}]}
      component.components[0].options = await getComponentOptions(globalSquads, 'Global', +startIndex.global, 23)
      if(component.components[0].options?.length > 0) msg2send.components.push(component)
    }
    if(msg2send.components.length > 0){
      msg2send.content = 'Squad List Results'
      if(search) msg2send.content += ' for search **'+search+'**'
      if(usr) msg2send.content += ' for member **'+usr+'**'
      HP.ReplyComponent(obj, msg2send)
    }else{
      msg2send.components = null
      if(search){
        msg2send.content = 'no squads where found for search **'+search+'**'
        if(usr) msg2send.content += ' for member **'+usr+'**'
      }
      HP.ReplyMsg(obj, msg2send)
    }
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
