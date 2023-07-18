'use strict'
const isOdd = (num)=>{
  return num % 2
}
const getRewardTier = (id)=>{
  let tier = 'T'
  tier += id.slice(-1)
  return tier
}
const getFeatType = (id, sector)=>{
  let name = 'S'+sector?.toString()
  if(name && id.includes('BOSS')) name = name.replace('S', 'B')
  if(name === 'S10') name = 'CQ'
  return name
}
const getCrateImg = (id)=>{
  let array = id.split('_')
  if(array.length > 0){
    const lastIndex = +array.length
    return array[lastIndex - 3]+'_'+array[lastIndex - 2]+'_'+array[lastIndex - 1]
  }
}
module.exports = ({ name, updated, totalKeys, credits, keys, feats = [], stars = [], rewards = {}})=>{
  try{
    let oddCount = 0
    const getBkg = ()=>{
      let bkImg = 'row-even'
      if(isOdd(oddCount)){
        bkImg = 'row-odd'
      }else{
        bkImg = 'row-even'
      }
      oddCount++;
      return bkImg
    }
    let html = '<html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
    html += '<link href="https://fonts.googleapis.com/css?family=Antic" rel="stylesheet">'
    html += '<link href="/css/conquestFeat.css" rel="stylesheet">'
    html += '</head>'
    html += '<body>'
    html += '<table class="main-table">'
    //
    html += '<tr class="main-title"><td colspan="4">'+name+'\'s Galactic Conquest</td></tr>'
    html += '<tr class="status"><td align="right"><img class="currency" src="/asset/conquest-currency.png"></td><td class="status-td">  '+credits+'/3500</td><td align="right"><img class="currency" src="/asset/conquest-keys.png"></td><td class="status-td">'+keys+'/'+totalKeys+'</td></tr>'
    /*
    html += '<tr>'
      html += '<td>'
        html += '<table width="100%">'
          html += '<tr class="status"><td align="center"><img class="currency" src="/asset/conquest-currency.png">  '+credits+'/3500</td><td align="center"><img class="currency" src="/asset/conquest-keys.png">'+keys+'/'+totalKeys+'</td></tr>'
        html += '</table>'
      html += '</td>'
    html += '</tr>'
    */
    //feat table
    html += '<tr>'
      html += '<td colspan="4">'
        html += '<table width="100%">'
        html += '<tr class="title"><td>Sector</td><td>Description</td><td>Status</td><td><img class="currency" src="/asset/conquest-keys.png"></td></tr>'
        if(feats.length > 0){
          for(let i in feats){
            html += '<tr class="'+getBkg()+'">'
              html += '<td class="feat-sector">'+getFeatType(feats[i].id, feats[i].sector)+'</td>'
              html += '<td class="feat-desc">'+feats[i].descKey+'</td>'
              html += '<td class="feat-status">'+feats[i].currentValue+'/'+feats[i].completeValue+'</td>'
              html += '<td class="feat-reward">'+feats[i].reward+'</td>'
            html += '</tr>'
          }
        }else{
          html += '<tr class="'+getBkg()+'"><td colspan="4">No uncompleted feats</td></tr>'
        }
        if(stars && stars.length > 0){
          for(let i in stars){
            html += '<tr class="'+getBkg()+'"><td>S'+stars[i].sector+'</td>'
            html += '<td class="feat-desc">Incomplete stars</td>'
            html += '<td class="feat-status">'+(stars[i].totalStars - stars[i].bossCount - stars[i].basicCount)+'/'+stars[i].totalStars+'</td>'
            html += '<td class="feat-reward">'+(stars[i].bossCount + stars[i].basicCount)+'</tr></tr>'
          }
        }else{
          html += '<tr class="'+getBkg()+'"><td colspan="4">Not missing any stars</td></tr>'
        }
        html += '</table>'
      html += '</td>'
    html += '</tr>'
    //reward table
    if(rewards?.current?.primaryReward && rewards.current.primaryReward[0]){
      let colspan = 1
      if(rewards.next) colspan++
      if(rewards.max) colspan++
      html += '<tr><td colspan="4"><table width="100%"><tr class="title"><td'+(colspan > 1 ? ' colspan="'+colspan+'"':'')+'>Reward Status</td></tr>'
      html += '<tr class="'+getBkg()+'"><td>Current</td>'
      if(colspan > 1) html += '<td>Next</td>'
      if(colspan > 2) html += '<td>Max</td>'
      html += '</tr>'
      html += '<tr class="'+getBkg()+'"><td>'+getRewardTier(rewards.current.primaryReward[0].id)+' '+keys+'/'+rewards.current.rankStart+'</td>'
      if(rewards.next?.rankStart) html += '<td>'+getRewardTier(rewards.next.primaryReward[0].id)+' '+keys+'/'+rewards.next.rankStart+'</td>'
      if(rewards.max?.rankStart) html += '<td>'+getRewardTier(rewards.max.primaryReward[0].id)+' '+keys+'/'+rewards.max.rankStart+'</td>'
      html += '</tr>'
      html += '<tr class="'+getBkg()+'"><td><img class="crate-img" src="/asset/'+getCrateImg(rewards.current.primaryReward[0].id)+'.png"></td>'
      if(rewards?.next?.primaryReward && rewards.next?.primaryReward[0]) html += '<td><img class="crate-img" src="/asset/'+getCrateImg(rewards.next.primaryReward[0].id)+'.png"></td>'
      if(rewards?.max?.primaryReward && rewards.max?.primaryReward[0]) html += '<td><img class="crate-img" src="/asset/'+getCrateImg(rewards.max.primaryReward[0].id)+'.png"></td>'
      html += '</tr></table></td></tr>'
    }
    html += '<tr><td colspan="4" class="footer">Data Updated : '+(new Date(updated)).toLocaleString('en-US', {timeZone: 'America/New_York'})+'</td></tr>'
    //
    html += '</table>'
    html += '</body>'
    html += '</html>'
    return html
  }catch(e){
    throw(e);
  }
}
