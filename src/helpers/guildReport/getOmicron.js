'use strict'
module.exports = async(omiCount = {})=>{
  let res = {
    name: 'Omicron',
    value: '```autohotkey\n'
  }
  res.value += 'Total    : '+(omiCount.total || 0)+'\n'
  res.value += 'TW       : '+(omiCount.tw || 0)+'\n'
  res.value += 'TB       : '+(omiCount.tb || 0)+'\n'
  res.value += 'GAC      : '+(omiCount.gac || 0)+'\n'
  res.value += 'Conquest : '+(omiCount.conquest || 0)+'\n'
  res.value += '```'
  return res
}
