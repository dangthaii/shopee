const states = {
   isLogined: false
}
function test() {
   console.log(states['isLogined']);
   return states['isLogined'];
}
console.log(test());
// output: 
// false
// undefined