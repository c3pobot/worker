'use strict'
const getData = require('./getData')
const getHtml = require('webimg').chart
const convertData = require('./convertData')
const swgohClient = require('src/swgohClient')
const { replyButton, replyTokenError, getDiscordAC } = require('src/helpers')

module.exports = async(obj = {}, opt = [])=>{
  let msg2send = {content: 'You do not have your google account linked to your discordId'}
  if(obj.confirm) await replyButton(obj)
  let loginConfirm = obj.confirm?.response
  let dObj = await getDiscordAC(obj.member?.user?.id, opt)
  if(!dObj?.uId || !dObj?.type) return msg2send

  let gObj = await swgohClient.oauth(obj, 'guild', dObj, {}, loginConfirm)
  if(gObj === 'GETTING_CONFIRMATION') return
  if(gObj?.error == 'invalid_grant'){
    await replyTokenError(obj, dObj.allyCode)
    return;
  }
  if(!gObj?.data?.guild?.member || !gObj?.data?.guild?.member?.length === 0) return { content: 'Error getting guild data' }

  let members = [], joined = [], guildData, chartData = [], chartDefense
  if(gObj?.territoryWarStatus?.length > 0 && gObj.territoryWarStatus[0]?.instanceId){
    let instanceId = gObj.data.guild.territoryWarStatus[0].instanceId
    let endTime = gObj.data.guild.territoryWarStatus[0].currentRoundEndTime
    if(!instanceId || !endTime) return { content: 'Error getting tw data'}

    let battleStats = await swgohClient.oauth(obj, 'getMapStats', dObj, {territoryMapId: gObj.data.guild.territoryWarStatus[0]?.instanceId}, loginConfirm)
    if(battleStats === 'GETTING_CONFIRMATION') return
    if(battleStats?.error == 'invalid_grant'){
      await replyTokenError(obj, dObj.allyCode)
      return;
    }
    if(!battleStats?.data?.currentStat) return { content: 'error getting battle stats'}
    let joined = gObj.territoryWarStatus[0]?.optedInMember?.map(m => m.memberId)
    if(joined?.length > 0) members = gObj?.member.filter(x=>joined.includes(x.playerId))
    guildData = await getData(gObj.data.guild.territoryWarStatus[0])
    if(guildData){
      let tempObj = { guildData: guildData }
      convertData(tempObj)
      if(tempObj.chartDefense) chartDefense = tempObj.chartDefense
    }
    if(members?.length > 0){
      for(let i in members){
        let tempObj = {
          name: members[i].playerName,
          total: +mapStats.filter(x=>x.mapStatId === 'stars')[0]?.playerStat?.find(x=>x.memberId === members[i].playerId)?.score || 0,
          attack: +mapStats.filter(x=>x.mapStatId === 'attack_stars')[0]?.playerStat?.find(x=>x.memberId === members[i].playerId)?.score || 0,
          defense: +mapStats.filter(x=>x.mapStatId === 'set_defense_stars')[0]?.playerStat?.find(x=>x.memberId === members[i].playerId)?.score || 0,
          rogue: +mapStats.filter(x=>x.mapStatId === 'disobey')[0]?.playerStat?.find(x=>x.memberId === members[i].playerId)?.score || 0
        }
        chartData.push(tempObj)
      }
    }
    if(chartData?.length > 0 && guildData) await mongo.set('twStats', {_id: gObj.profile?.id+'-'+instanceId}, {chartData: chartData, guildData: guildData, chartDefense: chartDefense, guildId: gObj.profile?.id, instanceId: instanceId, endTime: endTime})
  }
  if(gObj.territoryWarStatus?.length === 0){
    let cacheData = await mongo.find('twStats', {guildId: gObj?.profile?.id})
    if(!cacheData || cacheData?.length === 0) return { content: 'There is not a TW in progress and there is no cached data in the database' }

    let tempObj = cacheData[cacheData?.length - 1]
    if(tempObj?.chartData) chartData = tempObj.chartData
    if(tempObj?.guildData) guildData = tempObj.guildData
    if(tempObj?.endTime) endTime = tempObj.endTime
    if(tempObj?.chartDefense) chartDefense = tempObj.chartDefense
    if(tempObj?.guildData && !tempObj.chartDefense){
      convertData(tempObj)
      if(tempObj.chartDefense){
        chartDefense = tempObj.chartDefense
        await mongo.set('twStats', {_id: tempObj._id}, { chartDefense: tempObj.chartDefense })
      }
    }
  }
  if(!chartDefense || !guildData || chartData?.length === 0 || !chartData) return { content: 'Error calculating data' }

  let webData = []
  let bannerObj = { fileName: 'banners.png' }
  bannerObj.html = await getHtml(chartData, {
    sort: 'total',
    title: 'Total Banners',
    chart: [{name: 'Defense', data: 'defense', type: 'bar', bgcolor: '#0000FF'}, {name: 'Offense', data: 'attack', type: 'bar', bgcolor: '#FFA500'}]
  })
  if(bannerObj?.html) webData.push(bannerObj)
  let raObj = { fileName: 'ra.png'}
  raObj.html = await getHtml(chartData, {
    sort: 'attack',
    title: 'Efficency',
    chart: [{name: 'Rouge Actions', yId: 'rogue', data: 'rogue', type: 'line', bgcolor: '#FFA500'}, {name: 'Offense', data: 'attack', type: 'bar', bgcolor: '#0000FF'}]
  })
  if(raObj?.html) webData.push(raObj)

  let homeObj = { fileName: 'home.png'}
  if(chartDefense.homeDefense?.length > 0) homeObj.html = await getHtml(chartDefense.homeDefense, {
    sort: 'total',
    title: 'Home Defense',
    chart: [{name: 'Total Squads', data: 'total', type: 'bar', bgcolor: '#0000FF'}, {name: 'Extra Battles', data: 'diff', type: 'bar', bgcolor: '#FFA500'}]
  })
  if(homeObj.html) webData.push(homeObj)

  let awayObj = { fileName: 'away.png'}
  if(chartDefense.awayDefense?.length > 0) awayObj.html = await getHtml(chartDefense.awayDefense, {
    sort: 'total',
    title: 'Away Defense',
    chart: [{name: 'Total Squads', data: 'total', type: 'bar', bgcolor: '#0000FF'}, {name: 'Extra Battles', data: 'diff', type: 'bar', bgcolor: '#FFA500'}]
  })
  if(awayObj.html) webData.push(awayObj)


  if(webData?.length === 4){
    msg2send.content = 'error getting images'
    let errorCount = 0
    for(let i in webData){
      webData[i].file = await getImg(webData[i].html, obj.id, 1440, false)
      if(!webData[i].file){
        errorCount++
        break;
      }else{
        delete webData[i].html
      }
    }
    if(errorCount) webData = []
  }
  if(webData?.length === 4){
    let twDate
    if(endTime){
      twDate = new Date(+endTime).toLocaleDateString('en-US', {
        timeZone: 'America/New_York',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      })
    }
    msg2send.files = webData
    msg2send.content = null

    if(twDate){
      if(!msg2send.content) msg2send.content = ''
      msg2send.content += '<'+process.env.WEB_CONFIG_URL+'/tw?guildId='+guildData.home.id+'&date='+twDate+'>\n'
    }
  }
  return msg2send
}
