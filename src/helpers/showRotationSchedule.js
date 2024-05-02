const replyMsg = require('./replyMsg')
const timeTillPayout = require('./timeTillPayout')
const { getRole, getChannel } = require('./discordmsg')

module.exports = async(obj, rObj, shardObj, opt)=>{
  let msg2send, timeTillPO
  let playerArray = []
  if(rObj.players.length > 0){
    if(rObj.order == 'normal'){
      playerArray = rObj.players
    }else{
      for(let i=rObj.players.length;i>0;i--){
        playerArray.push(rObj.players[i - 1])
      }
    }
  }
  let guildRole = await getRole(shardObj.sId, rObj.roleId)
  let guildChannel = await getChannel(rObj.chId)
  if(rObj.poOffSet || rObj.poOffSet == 0) timeTillPO = timeTillPayout(rObj.poOffSet, rObj.type)
  msg2send = '>>> **'+rObj.id+'** Rotation Schedule ('+rObj.players.length+')\n'
  msg2send += '```\n'
  msg2send += 'Start Time   : '+rObj.startTime+'\n'
  if(rObj.chId && opt) msg2send += 'Channel      : '+(guildChannel ? '#'+guildChannel.name:'#'+rObj.chId)+'\n'
  if(rObj.roleId && opt) msg2send += 'Role         : '+(guildRole ? '@'+guildRole.name:'@'+rObj.roleId)+'\n'
  msg2send += 'Order        : '+rObj.order+'\n'
  if(opt) msg2send += 'Notify       : '+rObj.notify+'\n'
  if(rObj.poOffSet || rObj.poOffSet == 0) msg2send += 'Time till PO : '+timeTillPO[0]+'\n'
  msg2send += '```\n'
  if(playerArray.length > 0){
    msg2send += 'Players Next Rotation Order\n'
    msg2send += '```\n'
    let count = 1
    for(let i in playerArray){
      msg2send += count.toString().padStart(2, ' ')+' @'+playerArray[i].name+'\n'
      count++
    }
    msg2send += '```'
  }
  return msg2send
}
