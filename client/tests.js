var app = require('./app.js');
var misc = require('./misc.js');

exports['code-is-seperated-into-pairs'] = function(t){
    var codeEven = 'AGATCA';
    var codeOdd = 'ACA';
    var single = 'A';
    t.deepEqual(app.getPairs(codeEven),
		[{ first: 'A', last: 'G', i: 0, j: 1 },
		 { first: 'A', last: 'T', i: 2, j: 3 },
		 { first: 'C', last: 'A', i: 4, j: 5 }]);
    t.deepEqual(app.getPairs(codeOdd),
		[{ first: 'A', last: 'C', i: 0, j: 1 }]);
    t.strictEqual(app.getPairs(single).length, 0);
    t.done();
};

exports['pairs-are-mapped-to-commands'] = function(t){
    var pairs = [{ first: 'A', last: 'G' },
		 { first: 'A', last: 'T' },
		 { first: 'C', last: 'A' },
		 { first: 'A', last: 'A' }];
    var cmds = app.getCommands(pairs);
    t.strictEqual(cmds[0].name, 'del');
    t.strictEqual(cmds[1].name, 'swi');
    t.strictEqual(cmds[2].name, 'mvr');
    t.strictEqual(cmds[3].name, '   ');
    t.done();
};

exports['enzymes-binding-preference-is-found'] = function(t){
    var cmds = [{ turn: 'r' },
		{ turn: 'l' },
		{ turn: 's' },
	        { turn: 'r' }];
    t.strictEqual(app.getBindingPreference(cmds), 'G');
    cmds = [{ turn: 'l' },
	    { turn: 'l' },
	    { turn: 'l' },
	    { turn: 'l' }];
    t.strictEqual(app.getBindingPreference(cmds), 'A');
    t.done();
};

exports['enzyme-binds-to-preference'] = function(t){
    var state = { code: 'AACGTA',
		  mirror: 'TTG   ',
		  curIndx: 0,
		  bindingPref: 'C' };
    state = app.bindToPreference(state);
    t.strictEqual(state.curIndx, 2);
    t.strictEqual(state.code[state.curIndx], 'C');
    state.code = 'AATAGGT';
    app.bindToPreference(state);
    t.strictEqual(state.curIndx, 3);
    t.strictEqual(state.code[state.curIndx], 'A');
    t.done();
};

exports['gene-is-split-on-punctuation'] = function(t){
    var code = 'AATGCAATTAAA';
    var pairs = [{ first: 'A', last: 'A', i: 0, j: 1},
		 { first: 'T', last: 'G'},
		 { first: 'C', last: 'A'},
		 { first: 'A', last: 'T'},
		 { first: 'T', last: 'A'},
		 { first: 'A', last: 'A', i: 10, j: 11}];
    var genes = app.splitGeneOnPunctuation(code, pairs);
    t.strictEqual(genes.length, 1);
    t.strictEqual(genes[0].code, 'TGCAATTA');
    t.deepEqual(genes[0].pairs, pairs.slice(1, 5));
    code = 'TG';
    pairs = [{ first: 'T', last: 'G', i: 0, j: 1 }];
    genes = app.splitGeneOnPunctuation(code, pairs);
    t.strictEqual(genes.length, 1);
    t.strictEqual(genes[0].code, 'TG');
    t.deepEqual(genes[0].pairs, pairs);
    code = 'TGGCAATAC';
    pairs = [{ first: 'T', last: 'G' },
	     { first: 'G', last: 'C' },
	     { first: 'A', last: 'A', i: 4, j: 5 },
	     { first: 'T', last: 'A', i: 6, j: 7 }];
    genes = app.splitGeneOnPunctuation(code, pairs);
    t.strictEqual(genes.length, 2);
    t.strictEqual(genes[0].code, 'TGGC');
    t.strictEqual(genes[1].code, 'TA');
    t.deepEqual(genes[0].pairs, pairs.slice(0, 2));
    t.deepEqual(genes[1].pairs, pairs.slice(3, 4));
    t.done();
};

exports['code-is-split-on-cut-command'] = function(t){
    var state = { code: 'ACGTACGG', mirror: misc.blanks(8), curIndx: 3, codeSplits: [],
		  command: 'cut' };
    state = app.doCommand(state);
    t.strictEqual(state.code, 'ACGT');
    t.strictEqual(state.codeSplits[0], 'ACGG');
    state.code = 'AGCTACGT';
    state.mirror = 'TCGATG  ';
    state = app.doCommand(state);
    t.strictEqual(state.code, 'AGCT');
    t.strictEqual(state.codeSplits[1], 'ACGT');
    t.strictEqual(state.mirror, 'TCGA');
    t.strictEqual(state.codeSplits[2], 'TG');
    t.done();
};

exports['base-is-blanked-on-del-command'] = function(t){
    var state = { code: 'ACTAG', mirror: 'TGATC', curIndx: 2, command: 'del' };
    state = app.doCommand(state);
    t.strictEqual(state.code, 'AC AG');
    t.strictEqual(state.mirror, 'TGATC');
    state.curIndx = 4;
    app.doCommand(state);
    t.strictEqual(state.code, 'AC A ');
    t.done();
};

exports['move-right-once-on-mvr-command'] = function(t){
    var state = { code: 'ACT G ', mirror: misc.blanks(6), curIndx: 0, command: 'mvr' };
    app.doCommand(state);
    t.strictEqual(app.current(state), 'C');
    app.doCommand(state);
    t.strictEqual(app.current(state), 'T');
    app.doCommand(state);
    t.strictEqual(app.current(state), 'G');
    app.doCommand(state);
    t.strictEqual(app.current(state), ' ');
    state.copyMode = true;
    state.curIndx = 1;
    app.doCommand(state);
    t.strictEqual(app.current(state), 'T');
    t.strictEqual(state.mirror[state.curIndx], 'A');
    app.doCommand(state);
    t.strictEqual(app.current(state), 'G');
    t.strictEqual(state.mirror[state.curIndx], 'C');
    t.done();
};

exports['move-left-once-on-mvl-command'] = function(t){
    var state = { code: 'ACT G ', mirror: misc.blanks(6), curIndx: 4, command: 'mvl' };
    app.doCommand(state);
    t.strictEqual(app.current(state), 'T');
    t.done();
};

exports['turn-on-copy-on-cop-command'] = function(t){
    var state = { code: 'ACT G ', mirror: misc.blanks(6), curIndx: 0, command: 'cop' };
    app.doCommand(state);
    t.strictEqual(state.copyMode, true);
    t.strictEqual(state.mirror[state.curIndx], 'T');
    t.done();
};

exports['insert-A-on-ina-command'] = function(t){
    var state = { code: 'GCT G ', mirror: misc.blanks(6), curIndx: 0, command: 'ina' };
    app.doCommand(state);
    t.strictEqual(state.code.length, 7);
    t.strictEqual(state.code[1], 'A');
    t.strictEqual(state.mirror.length, 7);
    t.strictEqual(state.mirror[1], ' ');
    state.copyMode = true;
    state.curIndx = 6;
    app.doCommand(state);
    t.strictEqual(state.code[7], 'A');
    t.strictEqual(state.mirror.length, 8);
    t.strictEqual(state.mirror[7], 'T');
    t.done();
};

exports['find-pyrimidine-to-right-on-rpy-command'] = function(t){
    var state = { code: 'AGCT G ', mirror: misc.blanks(7), curIndx: 0, command: 'rpy' };
    app.doCommand(state);
    t.strictEqual(state.curIndx, 2);
    app.doCommand(state);
    t.strictEqual(state.curIndx, 3);
    app.doCommand(state);
    t.strictEqual(app.current(state), 'G');
    t.done();
};

exports['find-pyrimidine-to-left-on-lpy-command'] = function(t){
    var state = { code: 'AGCT G ', mirror: misc.blanks(7), curIndx: 5, command: 'lpy' };
    app.doCommand(state);
    t.strictEqual(state.curIndx, 3);
    app.doCommand(state);
    t.strictEqual(state.curIndx, 2);
    app.doCommand(state);
    t.strictEqual(state.curIndx, 0);
    t.done();
};

exports['find-purine-on-rpu-and-lpu-command'] = function(t){
    var state = { code: 'CGTACTA', mirror: misc.blanks(7), curIndx: 3, command: 'lpu' };
    app.doCommand(state);
    t.strictEqual(state.curIndx, 1);
    state.command = 'rpu';
    app.doCommand(state);
    t.strictEqual(state.curIndx, 3);
    state.copyMode = true;
    app.doCommand(state);
    t.strictEqual(state.mirror, misc.blanks(4) + 'GAT');
    t.done();
};

exports['switch-code-and-mirror-on-swi-command'] = function(t){
    var state = { code: 'CGTACTA', mirror: 'GC   AT', curIndx: 3, command: 'swi' };
    app.doCommand(state);
    t.strictEqual(state.code, 'TA   CG');
    t.strictEqual(state.mirror, 'ATCATGC');
    t.strictEqual(state.curIndx, 1);
    app.doCommand(state);
    t.strictEqual(state.code, 'CGTACTA');
    t.strictEqual(state.mirror, 'GC   AT');
    t.strictEqual(state.curIndx, 5);
    t.done();
};
