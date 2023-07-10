'use strict'
module.exports = async(obj)=>{
  try{
    let msg2send = {content: 'Error getting events'}
    const currentEvents = await mongo.find('events', {})
    if (currentEvents.length > 0) {
      let count = 0
      const sortedEvents = await sorter([{ column: 'startTime', order: 'ascending' }], currentEvents)
      const embedMsg = {
        color: 15844367,
        timestamp: new Date(),
        title: 'SWGoH current Events (',
        description: '```autohotkey\n'
      }
      const currentTime = (new Date()).getTime()
      const checkTime = +currentTime - 604800000
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
    HP.ReplyMsg(obj, msg2send)
  }catch(e){
    console.log(e)
    HP.ReplyError(obj)
  }
}
