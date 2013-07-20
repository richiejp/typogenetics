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
	me2.state = { code: '', mirror: '', curIndx: 0, bindingPref: ''
		    , codeSplits: [''], copyMode: false};
	me2.gameStage = { initialCode: '', initialPairs: [me2.pair],
			  genes: [me2.gene] };
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

    var baseType = {
	'A': 'purine',
	'G': 'purine',
	'C': 'pyrimidine',
	'T': 'pyrimidine',
	' ': 'not a base'
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

    me.substrBefore = function(str, indx){
	return str.substr(0, indx + 1);
    };

    me.substrAfter = function(str, indx){
	return str.substr(indx + 1, str.length - indx - 1);
    };

    me.insert = function(s, c){
	var inn = function(str, chr){
	    return me.substrBefore(str, s.curIndx)
	    + chr + me.substrAfter(str, s.curIndx);
	};
	if(s.copyMode){
	    s.mirror = inn(s.mirror, complement[c]);
	}else{
	    s.mirror = inn(s.mirror, ' ');
	}
	s.code = inn(s.code, c);
	return s;
    };

    //End of strand
    me.eos = function(s){
	return s.curIndx + 1 >= s.code.length;
    };

    //Beginning of strand
    me.bos = function(s){
	return s.curIndx <= 0;
    };

    //Far as possible
    me.fap = function(s, direction){
	return (me.eos(s) && direction > 0) || (me.bos(s) && direction < 0);
    };

    me.oob = function(s){
	return s.curIndx < 0 || s.curIndx >= s.code.length;
    };

    me.mirror = function(s){
	if(!me.oob(s)){
	    s.mirror = s.mirror.substr(0, s.curIndx)
		+ complement[me.current(s)] + s.mirror.substring(s.curIndx + 1);
	}
	return s;
    };
    
    me.skipFiller = function(s, direction){
	while(!me.fap(s, direction) && me.current(s) === ' '){
	    s.curIndx += direction;
	}
	return s;
    };

    me.searchUntil = function(s, direction, bt){
	var lastIndx;
	if(me.fap(s, direction)){
	    return s;
	}
	do{
	    lastIndx = s.curIndx;
	    s.curIndx += direction;
	    me.skipFiller(s, direction);
	    if(me.current(s) === ' '){
		s.curIndx = lastIndx;
		break;
	    }
	    if(s.copyMode){
		me.mirror(s);
	    }
	    if(me.fap(s, direction)){
		break;
	    }
	}while(baseType[me.current(s)] !== bt);
	return s;
    };

    me.nearestNonBlank = function(s){
	var lIndx = s.curIndx;
	var rIndx = s.curIndx;
	if(me.current(s) != ' ') return s;
	do{
	    var lEnd = lIndx <= 0;
	    var rEnd = rIndx >= s.code.length - 1;
	    if(s.code[lIndx] !== ' '){
		s.curIndx = lIndx;
		return s;
	    }
	    if(s.code[rIndx] !== ' '){
	    	s.curIndx = rIndx;
	    	return s;
	    }
	    if(!lEnd) lIndx -= 1;
	    if(!rEnd) rIndx += 1;
	}while(!lEnd && !rEnd);
	return s;
    };

    me.reverse = function(str){
	var chrs = [];
	for(var i = str.length - 1; i >= 0; i--){
	    chrs.push(str[i]);
	}
	return misc.arrToStr(chrs);
    };
    
    me.cmd = {
	'cut': function(s){
	    var mirrorSplit;
	    if(s.curIndx + 2 >= s.code.length) return s;
	    s.codeSplits.push(me.substrAfter(s.code, s.curIndx));
	    s.code = me.substrBefore(s.code, s.curIndx);
	    mirrorSplit = misc.remove(me.substrAfter(s.mirror, s.curIndx), ' ');
	    if(mirrorSplit !== '') s.codeSplits.push(mirrorSplit);
	    s.mirror = me.substrBefore(s.mirror, s.curIndx);
	    return s;
	},
	'del': function(s){
	    var arcd = misc.toArray(s.code);
	    arcd[s.curIndx] = ' ';
	    s.code = misc.arrToStr(arcd);
	    return s;
	},
	'swi': function(s){
	    var temp = s.code;
	    s.code = s.mirror;
	    s.mirror = temp;
	    s.code = me.reverse(s.code);
	    s.mirror = me.reverse(s.mirror);
	    s.curIndx = (s.code.length - 1) - s.curIndx;
	    me.nearestNonBlank(s);
	    return s;
	},
	'mvr': function(s){
	    s.curIndx += 1;
	    me.skipFiller(s, 1);
	    me.mirror(s);
	    return s;
	},
	'mvl': function(s){
	    s.curIndx -= 1;
	    me.skipFiller(s, -1);
	    me.mirror(s);
	    return s;
	},
	'cop': function(s){
	    s.copyMode = true;
	    me.mirror(s);
	    return s;
	},
	'off': function(s){
	    s.copyMode = false;
	    return s;
	},
	'ina': function(s){
	    return me.insert(s, 'A');
	},
	'inc': function(s){
	    return me.insert(s, 'C');
	},
	'ing': function(s){
	    return me.insert(s, 'G');
	},
	'int': function(s){
	    return me.insert(s, 'T');
	},
	'rpy': function(s){
	    return me.searchUntil(s, 1, 'pyrimidine');
	},
	'rpu': function(s){
	    return me.searchUntil(s, 1, 'purine');
	},
	'lpy': function(s){
	    return me.searchUntil(s, -1, 'pyrimidine');
	},
	'lpu': function(s){
	    return me.searchUntil(s, -1, 'purine');
	},
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

    me.publishToLog = function(from, objects){
	misc.log.info('in: ' + from);
	misc.log.info(objects);
    };

    me.nestFrom = function(inner, outer){
	return inner +  '->' + outer;
    };

    me.publishCode = function(from, code){
	me.publishToLog(me.nestFrom(from, 'code'), code);
    };

    me.publishPairs = function(from, pairs){
	me.publishToLog(me.nestFrom(from, 'pairs'), pairs);
    };

    me.publishGene = function(from, gene){
	me.publishCode(me.nestFrom(from, 'gene'), gene.code);
	me.publishPairs(me.nestFrom(from, 'gene'), gene.pairs);
    };

    me.publishGenes = function(from, genes){
	misc.arrayEach(genes, function(gene){
	    me.publishGene(from, gene);
	});
    };

    me.publishCommands = function(from, commands){
	me.publishToLog(from, misc.arrayMap(commands, function(c){
	    return { name: c.name, turn: c.turn };
	}));
    };

    me.publishState = function(from, state){
	me.publishToLog(from, state);
    };

    me.activate = function(gene){
	var cmds = me.getCommands(gene.pairs);
	var state = { code: gene.code,
		      mirror: misc.blanks(gene.code.length),
		      copyMode: false,
		      curIndx: 0 };
	me.publishCommands('activate', cmds);
	state.bindingPref = me.getBindingPreference(cmds);
	state = me.bindToPreference(state);
	me.publishState('activate', state);
	misc.arrayEach(cmds, function(cmd){
	    state.command = cmd;
	    me.publishState('activate', me.doCommand(state));
	}, function(cmd){
	    return state.curIndx >= state.code.length
		|| state.curIndx < 0
		|| me.current(state) === ' ';
	});
    };

    me.go = function(code){
	var genes;
	var pairs = me.getPairs(code);
	me.publishPairs('go-init', pairs);
	genes = me.splitGeneOnPunctuation(code, pairs);
	me.publishGenes('go-init', genes);
	misc.arrayEach(genes, function(gene){
	    me.activate(gene);
	});
    };

    return me;
})();

if(typeof module !== 'undefined'){
    misc.exporter(module, app);
}
