"use strict";

if(module != null) var misc = require('./misc.js');

var app = (function(){
    var me = {};

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
	misc.arrayEach(pairs, function(p){
	    cmds.push(me.codeMap[p.first][p.last]);
	});
	return cmds;
    };

    me.getBindingLetter = function(commands){
	var dir = 0;
	misc.arrayEach(commands, function(c){
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

    return me;
})();

misc.exporter(module, app);
