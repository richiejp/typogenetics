"use strict";

if(typeof module !== 'undefined'){
    var misc = require('./misc.js');
}

var app = (function(){
    var me = {};
    var typeReference = function(){
	var me2 = {};
	me2.pair = { first: '', last: '' };
	me2.gene = { code: '', pairs: [me2.pair] };
	me2.state = {};
	return me2;
    }();

    //make row
    var r = function(a, am, c, cm, g, gm, t, tm){
	return {'A': {cmd: me.cmd[a], turn: am, name: a},
		'C': {cmd: me.cmd[c], turn: cm, name: c},
		'G': {cmd: me.cmd[g], turn: gm, name: g},
		'T': {cmd: me.cmd[t], turn: tm, name: t}};
    };

    var turnMap = {
	's': 0, //straight 
	'r': -1,//right
	'l': 1  //left
    };

    var complement = {
	'A': 'T',
	'T': 'A',
	'G': 'C',
	'C': 'G'
    };

    var noop = function(state){ return state; };

    me.getPairs = function(code){
	var pairs = [];
	for(var i = 0, j = 1;;){
	    if(j < code.length){
		pairs.push({ first: code[i], last: code[j], i: i, j: j });
	    }else{
		break;
	    }
	    i = j + 1;
	    j = i + 1;
	}
	return pairs;
    };

    me.getCmd = function(pair){
	return me.codeMap[pair.first][pair.last];
    };

    me.splitGeneOnPunctuation = function(code, pairs){
	var genes = [];
	var cj = 0, pi = 0, pj = 0;
	for(; pi < pairs.length; pi++){
	    if(me.getCmd(pairs[pi]).name === '   '){
		if(pi !== pj){
		    genes.push({
			pairs: pairs.slice(pj, pi),
			code: code.slice(cj, pairs[pi].i)
		    });
		}
		pj = pi + 1; 
		cj = pairs[pi].j + 1;
	    }
	}
	if(pj < pi){
	    genes.push({
		pairs: pairs.slice(pj, pi),
		code: code.slice(cj, pairs[pi - 1].j + 1)
	    });
	}
	return genes;
    };

    me.getCommands = function(pairs){
	var cmds = [];
	misc.arrayEach(pairs, function(p){
	    cmds.push(me.getCmd(p));
	});
	return cmds;
    };

    me.getBindingPreference = function(commands){
	var dir = 0;
	misc.arrayEach(commands, function(c){
	    dir += turnMap[c.turn];
	});
	return (['A', 'C', 'T', 'G'])[(4 + (dir % 4)) % 4];
    };
    
    me.current = function(state){
	return state.code[state.curIndx];
    };

    me.onPreference = function(state){
	return me.current(state) === state.bindingPref;
    };
    
    me.bindToPreference = function(state){
	state.curIndx = 0;
	while(!me.onPreference(state)
	     && state.curIndx < state.code.length){
	    state.curIndx += 1;
	}
	if(!me.onPreference(state)){
	    state.curIndx = Math.round(state.code.length / 2) - 1;
	}
	return state;
    };
    
    me.cmd = {
	'cut': noop,
	'del': noop,
	'swi': noop,
	'mvr': noop,
	'mvl': noop,
	'cop': noop,
	'off': noop,
	'ina': noop,
	'inc': noop,
	'ing': noop,
	'int': noop,
	'rpy': noop,
	'rpu': noop,
	'lpy': noop,
	'lpu': noop,
	'   ': noop
    };
    
    me.doCommand = function(state){
	return me.cmd[state.command](state);
    };
    
    me.codeMap = {
	//       A           C           G           T
	'A': r('   ', ' ', 'cut', 's', 'del', 's', 'swi', 'r'),
	'C': r('mvr', 's', 'mvl', 's', 'cop', 'r', 'off', 'l'),
	'G': r('ina', 's', 'inc', 'r', 'ing', 'r', 'int', 'l'),
	'T': r('rpy', 'r', 'rpu', 'l', 'lpy', 'l', 'lpu', 'l')
    };

    return me;
})();

if(typeof module !== 'undefined'){
    misc.exporter(module, app);
}
