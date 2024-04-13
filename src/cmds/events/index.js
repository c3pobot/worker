'use strict'
const mongo = require('mongoclient')
const sorter = require('json-array-sorter')
const { replyMsg, replyError } = require('src/helpers')

module.exports = async(obj = {})=>{
  try{
    let msg2send = {content: 'Error getting events'}
    let currentEvents = await mongo.find('events', {})
    if (currentEvents.length > 0) {
      let count = 0
      let sortedEvents = sorter([{ column: 'startTime', order: 'ascending' }], currentEvents)
      let embedMsg = {
        color: 15844367,
        timestamp: new Date(),
        title: 'SWGoH current Events (',
        description: '```autohotkey\n'
      }
      let currentTime = (new Date()).getTime()
      let checkTime = +currentTime - 604800000
      for (let i in sortedEvents) {
        if (sortedEvents[i].endTime > checkTime) {
          embedMsg.description += sortedEvents[i].formatedTime + ' : ' + sortedEvents[i].nameKey + '\n'
          count++
        }
      }
      embedMsg.description += '```'
      embedMsg.title += count + ')'
      msg2send.content = null
      msg2send.embeds = [embedMsg]
    }
    await replyMsg(obj, msg2send)
  }catch(e){
    replyError(obj)
    throw(e)
  }
}
