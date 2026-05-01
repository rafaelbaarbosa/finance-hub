const mock = () => null;
module.exports = new Proxy({}, { get: () => mock });
