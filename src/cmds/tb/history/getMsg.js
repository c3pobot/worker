'use strict'
const mongo = require('mongoclient')

const getPhase = (id)=>{
    if(!id) return
    if(id.includes('_round_1' || id.includes('_phase01'))) return 'P1'
    if(id.includes('_round_2' || id.includes('_phase02'))) return 'P2'
    if(id.includes('_round_3' || id.includes('_phase03'))) return 'P3'
    if(id.includes('_round_4' || id.includes('_phase04'))) return 'P4'
    if(id.includes('_round_5' || id.includes('_phase05'))) return 'P5'
    if(id.includes('_round_6' || id.includes('_phase06'))) return 'P6'
    return 'Total'
}
module.exports = async(obj = {}, opt = {}, data = {})=>{
    let index = 0
    let tbHistory = data.results[index]
    if(!tbHistory?.defId) return { content: 'Error getting TB history for selected date' }

    let tbDef = (await mongo.find('tbDefinition', { _id: tbHistory.defId}))[0]
    if(!tbDef?.conflictZoneDefinition) return { content: 'Error getting TB definitions' }

    let historyDef = (await mongo.find('tbHistoryDef', { _id: tbHistory.defId}))[0]
    if(!historyDef?.id) return { content: 'Error getting TB history definitions' }
    
    for(let i in tbHistory.stats){
        if(!tbHistory.stats[i]?.playerStat || tbHistory.stats[i]?.playerStat?.length === 0) continue
        
        console.log(`${getPhase(tbHistory.stats[i].mapStatId)} ${historyDef.stats[tbHistory.stats[i].mapStatId]?.nameKey}`)
    }
    
    return { content: 'done' }
}