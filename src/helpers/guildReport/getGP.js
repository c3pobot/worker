'use strict'
const numeral = require('numeral')
module.exports = (homeGuild = {}, awayGuild)=>{
  let len = 12
  let res = {
    name: 'GP',
    value: '```autohotkey\n'
  }
  res.value += 'Total : '+numeral(homeGuild.gp || 0).format('0,0').padStart(len, ' ')
  if(awayGuild) res.value += ' vs '+numeral(awayGuild.gp || 0).format('0,0')
  res.value += '\nChar  : '+numeral(homeGuild.gpChar || 0).format('0,0').padStart(len, ' ')
  if(awayGuild) res.value += ' vs '+numeral(awayGuild.gpChar || 0).format('0,0');
  res.value += '\nShip  : '+numeral(homeGuild.gpShip || 0).format('0,0').padStart(len, ' ')
  if(awayGuild) res.value += ' vs '+numeral(awayGuild.gpShip || 0).format('0,0')
  res.value += '\n```'
  return res
}
