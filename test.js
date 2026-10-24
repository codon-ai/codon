// Task 9
let hours = Number.parseInt(Math.random() * 23);
let minutes = Number.parseInt(Math.random() * 59);
let seconds = Number.parseInt(Math.random() * 59);
if (hours < 10) {
    hours = "0" + hours;
}
if (minutes < 10) {
    minutes = "0" + minutes;
}
if (seconds < 10) {
    seconds = "0" + seconds;
}
const time = `${hours}:${minutes}:${seconds}`;
console.log("Time is: ", time);
