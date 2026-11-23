/**
 * UniCorn Class Prototype Creator <code>newClass</code>.
 * @version 1.0 
 * @author breeze (breeze@tut.by)
 * @copyright 2010 UniCORN Software All right reserved
 * @url http://www.usys.su
 */
 
/**
 * @class
 * @param {Object} parent
 * @param {Object} prop
*/

function newClass(parent, prop) {
	// parent - объект (класс) от которого мы наследуемся 
	// prop - методы (функции) и свойства (переменные) нового экземпляра класса

	// Создаём новый экземпляр класса MyClass
	/**
 	  * @class
	*/
	var MyClass = function() {
		// Вызывается при уничтожении класса, если есть дети они удаляются
	    if (MyClass.preparing) {
	    	return delete(MyClass.preparing);
	    }
	    
	    // Вызывается при создании нового экземляра через new ClassName()
	    // Сначала родительский, затем конструктор нового класса
	    if (MyClass.constr) {
			this.constructor = MyClass;
			MyClass.constr.apply(this, arguments);
		}
	}

	// Новый экземпляр прототипа
	MyClass.prototype = {};

	// Если задан родительский класс
	if (parent) {
		// Наследуем базовые свойства родительского класса
		parent.preparing = true;
		MyClass.prototype = new parent;
		MyClass.prototype.constructor = parent;
		MyClass.constr = parent;
		// Определеяем вызов метода родительского класса
		MyClass.prototype.superclass = function(params) {
			var pointer = MyClass.prototype.constructor.prototype;
			var methodName = arguments.callee.caller.methodName;
			try {
				eval ("pointer."+methodName+"(params)");
			} catch (e) {
				if (debugMode && confirm ("Exception: "+e+"\nDebug ?")) {
					debugger;
				}
			}
		}
	}
	// Если заданы параметры или методы нового класса
	if (prop) {
    	var cname = "constructor";
		for (var k in prop) {
			// Переопределяем всё кроме метода - конструктор
			if (k != cname) {
				MyClass.prototype[k] = prop[k];
				// Если это метод (функция), указываем его имя (для последующего
				//  вызова в суперклассе
				if (prop[k] instanceof Function){
					MyClass.prototype[k].methodName = k.toString();
				}
			}
		}
		// Создаём конструктор нового класса с указанием на родительский
		if (prop[cname] && prop[cname] != Object) {	MyClass.constr = prop[cname]; }
	}
	return MyClass;
}
