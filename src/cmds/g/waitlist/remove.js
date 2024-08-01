'use strict'
const mongo = require('mongoclient')
const numPlayers = 5

const { replyComponent } = require('src/helpers')
module.exports = async(obj = {}, opt = {}, pObj = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled' }

  let waitList = (await mongo.find('guildWaitList', { _id: pObj.guildId }))[0]
  if(!waitList?.players || waitList?.players?.length === 0) return { content: `${pObj.guildName} has no players on the guild waitlist` }

  let allyCode = obj.confirm?.allyCode
  if(allyCode){
    let player = waitList.players?.find(x=>x.allyCode === +allyCode)
    if(!player?.name) return { content: `${allyCode} is not on ${waitList.name} guild waitlist `}
    await mongo.set('guildWaitList', { _id: pObj.guildId }, { players: waitList.players.filter(x=>x.allyCode !== +allyCode)})
    return { content: `${player.name} with allyCode **${player.allyCode}** was removed from ${waitList.name} guild waitlist` }
  }

  let index = +(obj.confirm?.index || 0)

  let buttons = { type: 1, components: [] }, navigation = { type: 1, components: [] }
  if(index > 0) navigation.components.push({ type: 2, label: 'Previous', style: 1, custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, index: index - 1})})
  let players = []
  if(numPlayers >= waitList?.players?.length){
    players = waitList.players
  }else{
    let start = index * numPlayers, end = (index * numPlayers) + numPlayers
    for(let x = start;x<end;x++){
        if(waitList.players[x]) players.push(waitList.players[x])
    }

  }
  if(players?.length === 0) return { content: 'Error getting players' }
  for(let i in players){
    buttons.components.push({ type: 2, label: `${players[i].name} (${players[i].allyCode})`, style: 3, custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, allyCode: players[i].allyCode })})
  }
  if(waitList.players.length > ((index * numPlayers) + numPlayers)) navigation.components.push({ type: 2, label: 'Next', style: 1, custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, index: index + 1})})
  navigation.components.push({ type: 2, label: 'Cancel', style: 4, custom_id: JSON.stringify({ id: obj.id, dId: obj.member?.user?.id, cancel: true})})
  await replyComponent(obj, { content: `Please select the player to remove from ${waitList.name} guild waitlist (${waitList.players.length})`, components: [buttons, navigation] })
  return
}
