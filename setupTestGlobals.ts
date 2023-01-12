const nodeCrypto = require('crypto');

// @ts-expect-error
global.crypto = {
  getRandomValues: function (buffer) {
    return nodeCrypto.randomFillSync(buffer);
  },
};
