const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const stream = require('stream');
const { promisify } = require('util');

const finished = promisify(stream.finished);

function parseTimestamp(timestamp) {
    const parts = timestamp.split('-').map(part => {
        const [minutes, seconds] = part.split(':').map(parseFloat);
        return minutes * 60 + seconds;
    });
    return { start: parts[0], end: parts[1] };
}

async function segmentAudio(url, timestamp) {
    const { start, end } = parseTimestamp(timestamp);

    const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
        let audioBuffer = Buffer.alloc(0);

        ffmpeg(response.data)
            .setStartTime(start)
            .duration(end - start)
            .format('mp3')
            .audioCodec('libmp3lame')
            .on('error', reject)
            .on('data', (chunk) => {
                audioBuffer = Buffer.concat([audioBuffer, chunk]);
            })
            .on('end', () => {
                resolve(audioBuffer);
            })
            .pipe(new stream.PassThrough(), { end: true });

        finished(response.data).catch(reject);
    });
}

module.exports = segmentAudio;