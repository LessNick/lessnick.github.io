/* 
    ENGINE: "UNICORN" v.2.0
    MODUL : "UniCorn Events Prototype Creator" v.1.0
    
    Copyright (C)2006,2008 Fishbone CREW All right reserved
    Written by breeze \ fishbone crew | http://twilight.org.ru
    breeze@tut.by
*/

// Binds a function to the given object's scope --------------------------------

// Function.prototype.bind = function (object) {
// 	var method = this;
// 	return function () {
// 		var r;
// 		if (object != undefined) {
// 			try {
// 				r = method.apply(object, arguments);
// 			} catch (e) {
// 				console.log(e);
// 			}
// 		} else {
// 			r = method;
// 		}
// 		return r;
// 	};
// };

Function.prototype.bind = function (object) {
	var method = this;
	return function () {
		try {
			// arguments[1].action != 'sync' && arguments[1].action != 'lockTimeout' && arguments[1].action != undefined && arguments[1].action != 'shift_status' && arguments[1].action != 'repeat' && arguments[1].action != 'numClick' && arguments[1].action != 'sysLogin' && arguments[1].action != 'get_priceUp'
			var obj = method.apply(object, arguments);
			return obj;
		} catch (e) {
			console.log(e);
		}
	};
};

// Create a new instance of Event ----------------------------------------------
function Event() {
	this.events = [];
	this.builtinEvts = [];
}

// Gets the index of the given action for the element --------------------------
Event.prototype.getActionIdx = function (obj,evt,action,binding) {
	if(obj && evt) {
		var curel = this.events[obj][evt];
		if(curel) {
			var len = curel.length;
			for(var i=len-1; i>=0; i--){
				if(curel[i].action == action && curel[i].binding == binding) {
					return i;
				}
			}
		} else {
			return -1;
		}
	}
	return -1;
};

//Init all events -------------------------------------------------------------
Event.prototype.initEvents = function () {
	this.events = [];
	this.builtinEvts = [];
};

// Adds a listener -------------------------------------------------------------
Event.prototype.addListener = function (obj, evt, action, binding) {
	if(this.events[obj]) {
		if(this.events[obj][evt]) {
			if(this.getActionIdx(obj,evt,action,binding) == -1) {
				var curevt = this.events[obj][evt];
				curevt[curevt.length] = {action:action,binding:binding};
			}
		} else {
			this.events[obj][evt] = [];
			this.events[obj][evt][0] = {action:action,binding:binding};
		}
	} else {
		this.events[obj] = [];
		this.events[obj][evt] = [];
		this.events[obj][evt][0] = {action:action,binding:binding};
	}
};

// Removes a listener ----------------------------------------------------------

Event.prototype.removeListener = function (obj,evt,action,binding) {
	if(this.events[obj]) {
		if(this.events[obj][evt]) {
			var idx = 0;
			try {
				if (typeof(this.actionExists) == "function") {
					idx = this.actionExists(obj,evt,action,binding);
				}
			} catch (e) {
				if (debugMode && confirm ("Exception: "+e+"\nDebug ?")) {
					debugger;
				}
			}
			this.events[obj][evt].splice(idx,1);
		}
	}
};

// Fires an event --------------------------------------------------------------

Event.prototype.fireEvent = function (e, obj, evt, args) {
	if (!e) { e = window.event; }
	if(obj && this.events) {
		var evtel = this.events[obj];
		if (evtel) {
			var curel = evtel[evt];
			if(curel) {
				for(var act in curel) {
					var action = curel[act].action;
					if(curel[act].binding) {
						action = action.bind(curel[act].binding);
					}
					action(e,args);
				}
			}
		}
	}
};