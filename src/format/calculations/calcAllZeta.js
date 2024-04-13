'use strict'
module.exports = (obj = [], skills)=>{
	let returnObj = {
		all: 0,
		some: 0
	}
	let unitZetaTotal = Object.values(skills).filter(x=>x.zetaTier).length
	for(let i in obj){
		let zetaCount = 0
		for(let s in skills){
			if(skills[s].zetaTier){
				zetaCount += obj[i].skill.filter(x=>x.id == s && +(x.tier + 2) >= +skills[s].zetaTier).length
			}
		}
		if(zetaCount == unitZetaTotal){
			returnObj.all++
		}else{
			returnObj.some++
		}
	}
	return returnObj
}
