/*
 * Javascript calculator object to encapsulate the behavior
 * of a hand-held calculator. This is intended
 * to be used with a front end, and developed with some 
 * unit test coverage.
 * 
 */


/* Implementation of Calculator object */
function calculator(configs)
{
  
  this.MAX_CHAR = 17;                   // maximum number of characters that fits in the front end's display
  this.ROUND_TO = this.MAX_CHAR - 2;    // round to '13' digits after decimal
  this.CHAR_ERR = "CHAR. OVERFLOW!";
  this.DIV_ZERO = "DIVISION BY ZERO!";
  this.NEG_SQRT = "SQRT OF NEGATIVE!"
  this.NEG_INF = "NEGATIVE INFINITY";
  this.NO_OPR = "OPERAND MISSING!";
  this.NAN = "NOT DEFINED!"
  this.SYN_ERR = "SYNTAX ERROR!";
  
  var that = this;          // TODO: REMOVE this if needed by only a very few private methods?

  this.display = '0';
  this.curOperand = 0;
  this.operator = null;
  this.lastCharType = 'num';
  this.errored = false;     	// set to true when error occured
  this.cache = 0;		// to store when pressing '=' repetatively

  // config attributes such as cookies passed by front end
  this.config = configs;
  
  // binding button values to types for method delegation later
  this.map = {
      '0'       : 'num',
      '1'       : 'num',
      '2'       : 'num',
      '3'       : 'num',
      '4'       : 'num',
      '5'       : 'num',
      '6'       : 'num',
      '7'       : 'num',
      '8'       : 'num',
      '9'       : 'num',
      
      '.'       : 'decimal',
      'pm'      : 'plusMinus',
      
      '+' : 'binary',
      '-' : 'binary',
      '*' : 'binary',       // multiplication
      '/' : 'binary',       // division
      '%' : 'binary',       // modulo
      '^' : 'binary',       // power
      'exp' : 'binary',     // exponent
      
      'sqrt'    : 'unary',  // square root
      '**2'     : 'unary',  // x^2 
      'euler'   : 'unary',  // e^1 = 2.718281..
      'inv'     : 'unary',  // 1/x
      'log'     : 'unary',
      
      '='       : 'equal',
      
      'c'       : 'clear',
      'ce'      : 'clearEntry',
      'ba'      : 'backArrow'
      
  }
  

  /* cookie/config related methods */
  this.comma = function(){
      return this.config['comma'];
  }
  
  this.logbase = function(){
      return this.config['logbase'];
  }
  
  this.isCommaOn = function(){
      return ((this.comma() == '1') ? true : false);
  }

  this.isLog10 = function(){
      return ((this.logbase() == '10') ? true : false);
  }
  
  this.setCookie = function(name, val){
      this.config[name] = val;
  }
  
  this.allReset = function()
  {
      this.display = '0';
      this.curOperand = 0;
      this.operator = null;
      this.lastCharType = 'num';
      this.errored = false;
      this.cache = 0;
  };
  
  /* private methods (simple enough to ignore unit testing, given time constraint) */

  var round = function(x, y) {          // private helper function: not unit-tested
    var p = Math.pow(10, y);            // round to arbitrary decimal
    x *= p;
    x = Math.round(x);
    x /= p;
    return x;
  }
  
  var log10 = function(val) {       // private helper function: not unit-tested
    return Math.log(val) / Math.log(10);
  }
  
  var isNumber = function(str){     // private helper function: not unit-tested
      return (/num/.test(str));
  }

  var isUnary = function(str){      // private helper function: not unit-tested
      return (/unary/.test(str));
  }
  
  var isBinary = function(str){     // private helper function: not unit-tested
      return (/binary/.test(str));
  }
  
  var isEqual = function(str){      // private helper function: not unit-tested
      return (/equal/.test(str));
  }

  var isPlusMinus = function(str){  // private helper function: not unit-tested
      return (/plusMinus/.test(str));
  }
  
  var justZero = function(str){     // private helper function: not unit-tested
      return (/^0$/.test(str));
  }
  
  var justMinus = function(str){     // private helper function: not unit-tested
      return (/^-$/.test(str));
  }
  
  var hasOneChar = function(str){   // private helper function: not unit-tested
      return (/^\.$/.test(str));
  }
  
  var hasDecimal = function(str){   // private helper function: not unit-tested
      return (/\./.test(str));
  }
  
  var hasMinus = function(str){     // private helper function: not unit-tested
      return (/-.+/.test(str)); // check at least one digit with minus sign in front
  }
  
  var removeMinus = function(str){  // private helper function: not unit-tested
      return str.replace(/^-/, '');
  }
  
  var addMinus = function(str){     // private helper function: not unit-tested
      return '-' + str;
  }
  

  /* Error handling methods */
  var handleCharacterOverflow = function(){             // TODO: unit-test. Expose this as public?
      if (that.display.length >= that.MAX_CHAR){
          that.errored = true;
          that.display = that.CHAR_ERR;
          return true;
      }
      return false;
  }
  
  this.handleError = function(err){                     // TODO: unit-test
      this.display = err;
      this.errored = true;
  }
  
  /* Methods that handles input */
  
  this.decimalHandler = function(str){                  // TODO: unit-test
      if (!hasDecimal(this.display)){ // only if there's no decimal already
          this.charAppend('.');
      }
      
      this.lastCharType = this.map[str];
  }
  
  this.plusMinusHandler = function(str){                // TODO: unit-test

      if (!handleCharacterOverflow()){
          if (justZero(this.display)){  // beginning '0' => set display to '-'
              this.display = '-';
          }
          else if (justMinus(this.display)){    // '-' then change to '0'
              this.display = '0';
          }
          else if (hasMinus(this.display)){
              this.display = removeMinus(this.display);
          }
          else if (isBinary(this.lastCharType)){    // '2', '+', '3', '+', '+/-', '4' = 1
              this.curOperand = parseDisplay();
              this.display = '-';
          }
          else{
              this.display = addMinus(this.display);
          }
      }

      this.lastCharType = this.map[str];      
  }

  this.charAppend = function(str){
      // Should I let I user continue with what they've typed in ?
      if (!handleCharacterOverflow()){
          
          this.display = justZero(this.display) ? (hasDecimal(str) ? '0.' : str)
                                                        : (this.display+str);
      }
      
      this.lastCharType = this.map[str];
  }
    
  this.numericHandler = function(str){              // TODO: unit-test
      if (isUnary(this.lastCharType)) {
        this.allReset();                // case 1: '2' + 'log' => reset everything
      }
      else if (isBinary(this.lastCharType) || isEqual(this.lastCharType)) {
        this.clearEntry();              // case: '2' + '+' => add '2'
      }

      this.charAppend(str);
  }

  this.performBinaryOp = function(operator){
      try{
          var temp = this.curOperand;
          this.curOperand = parseDisplay();
          temp = this.eval_binary(operator, this.curOperand, temp);
          this.display = temp.toString();
      }
      catch(err){
          this.handleError(err);
          return;
      }
  }
  
  var isOperatorBinary = function(operator){
      var operator_type = that.map[operator];
      return (/binary/.test(operator_type));
  }
  
  var parseDisplay = function(){                        // TODO: unit-test
      var a = parseFloat(that.display);
      
      if (isNaN(a)){
          throw that.SYN_ERR;
      }
      return a;     
  }
  
  this.equalHandler = function(str){                // TODO: unit-test (refactor as well)
        
      if (justMinus(this.display) || (this.display == '0.')){ //'-', '=' OR '0.' => '0'
          this.display = '0';
      }
      else if (isOperatorBinary(this.operator)){
          
          try{
              if (!isEqual(this.lastCharType)){     // case: 1+2=
                  var oldOperand = this.curOperand;
                  this.cache = parseDisplay();	    // cache for next press of '='
                  //this.curOperand = parseDisplay();
                  // IMPORTANT: ordering argument is critical below
                  this.curOperand = this.eval_binary(this.operator, oldOperand, this.cache);
                  this.display = this.curOperand; //round(this.curOperand, this.ROUND_TO);
              }
              else{     // case: 1 + 2 = =
                  var temp = parseDisplay();
                  this.curOperand = this.eval_binary(this.operator, temp, this.cache);
                  this.display = this.curOperand; //round(this.curOperand, this.ROUND_TO);
              }
          }
          catch(err){
              this.handleError(err);
              return;
          }
      }
      
      this.lastCharType = this.map[str];
  } 
  
  this.eval_binary = function(operation, x, y){         // TODO: unit-test; use 'raises' to catch exceptions thrown
      var result = 0;
      
      switch (operation) {
        case '+':
            result = x + y;
            break;
        case '-':
            result = x - y;
            break;
        case '*':
            result = x * y;
            break;
        case '/':
            if (y == 0)
                throw this.DIV_ZERO;
            result = x / y;
            break;
        case '%':
            result = x % y;
            break;
        case '^':
            result = Math.pow(x,y);
            break;
        case 'exp':
            result = x * Math.pow(10,y);
            break;
      }
      
      return result;
  }
  
  this.binaryHandler = function(str){               // TODO: unit-test
      
      if (this.operator == null){   // first time loading operand => 'Num', '+'
          try{
              this.curOperand = parseDisplay();
          }
          catch(err){
              this.handleError(err);
              return;
          }
      }
      else{  // binary acting like it's EQUAL e.g., '1', '+', '2', '+', '1', '+','1'
          if (isNumber(this.lastCharType)){ // NOT '1', '+', '2', '+', '+', '+'
              try{
                  var temp = parseDisplay();
                  this.curOperand = this.eval_binary(this.operator, this.curOperand, temp);
                  //this.curOperand = round(this.curOperand, this.ROUND_TO);
                  this.display = this.curOperand;                  
              }
              catch(err){
                  this.handleError(err);
                  return;
              }
          }
      }

      this.operator = str;      // ALWAYS update old opeartor with the new one
      this.lastCharType = this.map[str];
  }
  
  this.eval_unary = function(operation, x){     // TODO: not unit-tested YET
      var result = 0;
      
      switch (operation) {
        case 'sqrt':
            if (x < 0)
                throw this.NEG_SQRT;                
            result = Math.sqrt(x);
            break;
        case '**2':
            result = Math.pow(x,2);
            break;
        case 'euler':
            result = Math.pow(Math.E, x);
            break;
        case 'inv':
            if (x == 0)
                throw this.DIV_ZERO;
            result = 1 / x;
            break;
        case 'log':
            if (x == 0)
                throw this.NEG_INF;
            else if (x < 0)
                throw this.NAN;
            
            if (this.isLog10())
                result = log10(x);
            else
                result = Math.log(x);
            break;
      }

      return result;
  }  
  
  this.unaryHandler = function(str){                    // TODO: unit-test
      
      try{
          var temp = parseDisplay();
          temp = this.eval_unary(str, temp);
          //temp = round(temp, this.ROUND_TO);
          this.display = temp.toString();
      }
      catch(err){
          this.handleError(err);
          return;
      }
      
      // in case of '1', '+', '2', '1/x', '=' => we want to remember 
      // '+' and get 1.5; so no longer store the unary operator
      //this.operator = str;
      this.lastCharType = this.map[str];
  }
  
  this.clearEntry = function(){
      this.display = '0';
  }
  
  this.backArrow = function(){                      // TODO: unit-test
      if (hasOneChar(this.display)){
          this.display = '0';
      }
      else{
          var str = this.display;
          this.display = str.substr(0,str.length-1);
      }
  }

  /* Source: https://github.com/skorecky/JavaScript-Calculator/blob/master/application.js */
  this.addCommas = function(nStr) {
      nStr += '';
      var x = nStr.split('.');
      var x1 = x[0];
      var x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
          x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }

    return x1 + x2;
  }

  /* 
   * The following two methods are the only two 
   * that should strictly be public methods.
   *
   */
  // front end should access the calculator's output ONLY via this method
  this.getDisplay = function(){                     // TODO: unit-test
      if (this.isCommaOn() && (!this.errored)){
          return this.addCommas(this.display);
      }
      else{
          return this.display;
      }
  }

  // front end should push digits to the calculator ONLY via this method
  this.push = function(str){
      // PLEASE DO NOT REMOVE 'code': this is a hack for unit testing 
      // because I don't know how to mock the function calls in javascript
      var code = null;
      
      switch(this.map[str]){
          case 'num':
              this.numericHandler(str);
              code = 'num';
              break;
          case 'decimal':
              this.decimalHandler(str);
              code = 'decimal';
              break;
          case 'binary':
              this.binaryHandler(str);
              code = 'binary';
              break;
          case 'unary':
              this.unaryHandler(str);
              code = 'unary';
              break;
          case 'clear':
              this.allReset();
              code = 'clear';
              break;
          case 'clearEntry':
              this.clearEntry();
              code = 'clearEntry';
              break;
          case 'backArrow':
              this.backArrow();
              code = 'backArrow';
              break;
          case 'plusMinus':
              this.plusMinusHandler(str);
              code = 'plusMinus';
              break;
          case 'equal':
              this.equalHandler(str);
              code = 'equal';
              break;
      }
      
      return code;
  }
  
  /*
   * TODO: 
   *        - change 'ln' to 'log' in front end vice versa (done Hacking)
   *        - ignore the overflow of digits sometimes; arbitrary precision is 
   *          needed (use Big.js and rounding function that saved in "test.html"
   *        - key mapping are not quite useful due to lack of visual feedback 
   *          when buttons are pressed, fix that
   *        - Mem store 'M+'
   *        - natural way of typing (log->4 instead of 4->log)
   *        - give user valuable feedback about digit limit? warn about PEMDAS ordering?
   *        - parentheses
   *        - show history in above row in display
   *        
   */
  
  return true;
}
