'use strict'

const _ = require('lodash');
const faker = require('faker');

const paras = 20;
const textFunctions = [
    () => faker.lorem.paragraphs(paras),
    () => _.times(paras * 10).map(faker.company.bs).join(' '),
    () => _.times(paras * 4).map(faker.hacker.phrase).join(' '),
    () => _.times(paras).map(i => [
        faker.name.firstName() + ' ' + faker.name.lastName(),
        faker.address.streetAddress(),
        faker.address.city() + ', ' + faker.address.stateAbbr() + ' ' + faker.address.zipCode(),
    ].join('\n')).join('\n\n'),
];

function makeText() {
    return _.sample(textFunctions)();
}

const ITERATIONS = 1000;
let lastMs = Date.now();

const acc = {};
for (let i = 0; i < ITERATIONS; i++) {
  if (i % 10000 === 0) {
    let now = Date.now();
    let mem = process.memoryUsage();
    console.log();
    console.log('Iteration', i.toLocaleString());
    console.log('Resident set', (mem.rss / 1024 / 1024).toLocaleString(), 'MB');
    console.log('Heap usage', (mem.heapUsed / 1024 / 1024).toLocaleString(), 'MB');
    console.log('Heap total', (mem.heapTotal / 1024 / 1024).toLocaleString(), 'MB');
    console.log('Time to chunk', (now - lastMs).toLocaleString(), 'ms');
    lastMs = now;
  }

  // console.log('map', i);
  const text = makeText();
  const words = text.match(/\w+/g);
  const val = {
    text,
    words: () => words,
    lowerWords: () => words.map(x => x.toLowerCase()),
    count: () => words.length,
  };
  // console.log('map => done', i);

  // console.log('reduce', i);
  for (let word of val.words()) {
    if (word in acc) {
      acc[word]++;
    } else {
      acc[word] = 1;
    }
  }
}

const data = [];
for (let word in acc) {
  data.push({
    word,
    count: acc[word],
  });
}

data.sort((a, b) => {
  return b.count - a.count;
});

const result = data.slice(0, 20);

let mem = process.memoryUsage();
console.log();
console.log('======End======');
console.log('Resident set', (mem.rss / 1024 / 1024).toLocaleString(), 'MB');
console.log('Heap usage', (mem.heapUsed / 1024 / 1024).toLocaleString(), 'MB');
console.log('Heap total', (mem.heapTotal / 1024 / 1024).toLocaleString(), 'MB');

console.log(result);
