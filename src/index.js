'use strict'

const _ = require('lodash');
const faker = require('faker');
const Promise = require('bluebird');
const workerFarm = require('worker-farm');
const wordWorkers = workerFarm({ autostart: true }, require.resolve('./word-gen'));
const wordGenWorker = Promise.promisify(wordWorkers);

const ITERATIONS = 1000;
let lastMs = Date.now();

Promise.reduce(
  _.map(_.times(ITERATIONS), i => {
    // console.log('map', i);
    return wordGenWorker(null)
      .then(text => {
        // console.log('map => done', i);
        return {
          i,
          text,
        };
      });
  }),
  (acc, r) => {
      const i = r.i;
      const text = r.text;

      // console.log('reduce', i);
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
  },
  {})
  .then(wordAcc => {
    return _.chain(wordAcc)
      .map((val, key) => ({
        word: key,
        count: val,
      }))
      .sortBy(x => x.count)
      .reverse()
      .take(40)
      .value();
  })
  .then(result => {
    let mem = process.memoryUsage();
    console.log();
    console.log('======End======');
    console.log('Resident set', (mem.rss / 1024 / 1024).toLocaleString(), 'MB');
    console.log('Heap usage', (mem.heapUsed / 1024 / 1024).toLocaleString(), 'MB');
    console.log('Heap total', (mem.heapTotal / 1024 / 1024).toLocaleString(), 'MB');

    console.log(result);
  })
  .finally(() => {
    workerFarm.end(wordWorkers);
  });
