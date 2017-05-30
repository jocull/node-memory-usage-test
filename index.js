const _ = require('lodash');
const faker = require('faker');

const makeText = (() => {
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

  return () => _.sample(textFunctions)();
})();

const ITERATIONS = 100000;
let lastMs = Date.now();
const result =
  _.chain(_.range(0, ITERATIONS))
    .tap(() => console.log('Mapping!'))
    .reduce((acc, i) => {
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

      const text = makeText();
      const words = text.match(/\w+/g);
      const val = {
        text,
        words: () => words,
        lowerWords: () => words.map(x => x.toLowerCase()),
        count: () => words.length,
      };

      for (let word of val.words()) {
        if (word in acc) {
          acc[word]++;
        } else {
          acc[word] = 1;
        }
      }
      return acc;
    }, {})
    .tap(() => console.log('Sorting!'))
    .map((val, key) => ({
      word: key,
      count: val,
    }))
    .sortBy(x => x.count)
    .tap(() => console.log('Reversing!'))
    .reverse()
    .take(20)
    .value();

console.log(result);
