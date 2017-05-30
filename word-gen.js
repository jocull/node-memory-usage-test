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

module.exports = function (input, callback) {
    callback(null, _.sample(textFunctions)());
}
