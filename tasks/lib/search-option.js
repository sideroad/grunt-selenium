
var options = arguments[0].getElementsByTagName('option') || [],
    text = String( arguments[1] ),
    i,
    option,
    len = options.length;

for(i = 0; i<len; i++){
  option = options[i];
  if(option.innerHTML === text){
      return option;
  }
}
throw new Error("option element was not found");

