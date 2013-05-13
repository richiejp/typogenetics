"use strict";

var app = (function(){
    var me = {};
    var r = function(a, am, c, cm, g, gm, t, tm){
	return {'A': {cmd: me.cmd[a], turn: am},
		'C': {cmd: me.cmd[c], turn: cm},
		'G': {cmd: me.cmd[g], turn: gm},
		'T': {cmd: me.cmd[t], turn: tm}};
    };

    var turnMap = {
	's': 0,
	'r': -1,
	'l': 1
    };

    var noop = function(state){ return state; };

    me.getPairs = function(code){
	var pairs = [];
	for(var i = 0, j = 1;;){
	    if(j < code.length){
		pairs.push({ first: code[i], last: code[j] });
	    }else{
		break;
	    }
	    i = j + 1;
	    j = i + 1;
	}
	return pairs;
    };

    me.getCommands = function(pairs){
	var cmds = [];
	util.arrayEach(pairs, function(p){
	    cmds.push(me.codeMap[p.first][p.last]);
	});
	return cmds;
    };

    me.getBindingLetter = function(commands){
	var dir = 0;
	util.arrayEach(commands, function(c){
	    dir += turnMap[c.turn];
	});
	return (['A', 'C', 'T', 'G'])[Math.abs(dir % 3)];
    };

    me.doCommand = function(state){
	return me.cmd[state.command](state);
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
    
    me.codeMap = {
	//       A           C           G           T
	'A': r('   ', ' ', 'cut', 's', 'del', 's', 'swi', 'r'),
	'C': r('mvr', 's', 'mvl', 's', 'cop', 'r', 'off', 'l'),
	'G': r('ina', 's', 'inc', 'r', 'ing', 'r', 'int', 'l'),
	'T': r('rpy', 'r', 'rpu', 'l', 'lpy', 'l', 'lpu', 'l')
    };
})();

