var util = (function(){
    var me = {};
    me.arrayEach = function(arr, func){
	for(var i = 0; i < arr.length; i++){
	    func(arr[i]);
	}
    };
    
    me.objectEach = function(col, func){
	for(var p in col){
	    if(col.hasOwnProperty(p)){
		func(col[p]);
	    }
	}
    };
})();
