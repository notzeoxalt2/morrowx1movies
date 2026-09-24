const source = require("./movix-1.js");

async function getStreams(...args) {
  const streams = await source.getStreams(...args);
  return streams.map((stream) => {
    const match = stream.name.match(/(2160|1440|1080|720|480|360)p/i);
    return {
      ...stream,
      quality: stream.quality || (match ? `${match[1]}p` : "Auto"),
      provider: "movix"
    };
  });
}

module.exports = { getStreams };
