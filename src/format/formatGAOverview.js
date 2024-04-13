'use strict'
const numeral = require('numeral')
const calcGP = require('./calcGP')
module.exports = (pObj, eObj)=>{
  try{
    let tempObj = {
      name: 'Overview',
      value: '```autohotkey\n'
    }
    if(pObj && eObj && pObj.playerRating && eObj.playerRating && pObj.playerRating.playerSkillRating && eObj.playerRating.playerSkillRating){
      tempObj.value += "Skill      :: " + numeral(pObj.playerRating.playerSkillRating.skillRating).format('0,0').padStart(10, ' ') + ' vs ' + numeral(eObj.playerRating.playerSkillRating.skillRating).format('0,0')+'\n'
    }
    tempObj.value += "Total GP   :: " + numeral(pObj.gp).format('0,0').padStart(10, ' ') + " vs " + numeral(eObj.gp).format('0,0') + "\n";
    tempObj.value += "Char GP    :: " + numeral(pObj.gpChar).format('0,0').padStart(10, ' ') + " vs " + numeral(eObj.gpChar).format('0,0') + "\n";
    tempObj.value += "Ship GP    :: " + numeral(pObj.gpShip).format('0,0').padStart(10, ' ') + " vs " + numeral(eObj.gpShip).format('0,0') + "\n";
    tempObj.value += "G13        :: " + pObj.rosterUnit.filter(g => g.currentTier == 13).length.toString().padStart(10, ' ') + " vs " + eObj.rosterUnit.filter(g => g.currentTier == 13).length + "\n";
    tempObj.value += "G12        :: " + pObj.rosterUnit.filter(g => g.currentTier == 12).length.toString().padStart(10, ' ') + " vs " + eObj.rosterUnit.filter(g => g.currentTier == 12).length + "\n";
    tempObj.value += "G11        :: " + pObj.rosterUnit.filter(g => g.currentTier == 11).length.toString().padStart(10, ' ') + " vs " + eObj.rosterUnit.filter(g => g.currentTier == 11).length + "\n";
    tempObj.value += "Zeta's     :: " + pObj.zetaCount.toString().padStart(10, ' ') + " vs " + eObj.zetaCount + "\n"
    tempObj.value += "Char 65 GP :: " + numeral(calcGP(pObj.rosterUnit, 65, 1)).format("0,0").padStart(10, ' ') + " vs " + numeral(calcGP(eObj.rosterUnit, 65, 1)).format("0,0") + "\n"
    tempObj.value += "Char 80 GP :: " + numeral(calcGP(pObj.rosterUnit, 80, 1)).format("0,0").padStart(10, ' ') + " vs " + numeral(calcGP(eObj.rosterUnit, 80, 1)).format("0,0") + "\n"
    tempObj.value += "Ship 32 GP :: " + numeral(calcGP(pObj.rosterUnit, 32, 2)).format("0,0").padStart(10, ' ') + " vs " + numeral(calcGP(eObj.rosterUnit, 32, 2)).format("0,0") + "\n"
    tempObj.value += "```";
    return tempObj
  }catch(e){
    throw(e)
  }
}
