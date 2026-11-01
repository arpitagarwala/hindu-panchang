const Astronomy = require('astronomy-engine');

const d = new Date('2003-06-26T02:24:00.000Z');
console.log('JS Date:', d.toISOString());
const time = Astronomy.MakeTime(d);
console.log('Astronomy.MakeTime(d):', time);
console.log('Sun position:', Astronomy.SunPosition(time));
console.log('Sun position with JS Date:', Astronomy.SunPosition(d));
