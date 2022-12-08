export default function randomNumber(){
  return Math.floor(((Math.random()*1000000) + (Math.random()*1000000))/(Math.random()*10));
}