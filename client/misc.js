var misc = (function(){
    var me = { log: {}};
    me.arrayEach = function(arr, func, opt_break){
	if(typeof opt_break !== 'function'){
	    for(var i = 0; i < arr.length; i++){
		func(arr[i]);
	    }
	}else{
	    for(var i = 0; i < arr.length && !opt_break(arr[i]); i++){
		func(arr[i]);
	    }
	}
    };
    
    me.objectEach = function(col, func){
	for(var p in col){
	    if(col.hasOwnProperty(p)){
		func(col[p], p);
	    }
	}
    };

    me.arrayMap = function(col, func){
	var mapped = [];
	me.arrayEach(col, function(e){
	    mapped.push(func(e));
	});
	return mapped;
    };

    me.toArray = function(str){
	var arr = [];
	me.arrayEach(str, function(c){
	    arr.push(c);
	});
	return arr;
    };

    me.arrToStr = function(arr){
	return arr.join('');
    };

    me.blanks = function(num){
	if(num > 1){
	    return ' ' + me.blanks(num - 1);
	}else{
	    return ' ';
	}
    };

    me.remove = function(str, chr){
	var splits = str.split(chr);
	return splits.join('');
    };

    me.exporter = function(mod, obj){
	if(mod != null){
	    me.objectEach(obj, function(value, name){
		mod.exports[name] = value;
	    });
	}
    };

    me.clone = function(obj){
	var c = {};
	me.objectEach(obj, function(p, n){
	    c[n] = p;
	});
	return c;
    };

    me.log.info = function(msg){
	window.console.log(msg);
    };

    return me;
})();

if(typeof module !== 'undefined'){
    misc.exporter(module, misc);
}
