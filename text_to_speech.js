// 1) Polyfill a global Blob/FormData for gRPC/auth plugins:
// require('formdata-polyfill/umd.min.js');

// 2) Polyfill a global Headers constructor for gRPC/Gaxios:
const fetch = require('node-fetch');
global.Headers = fetch.Headers;

// 3) Now import and use the Text‑to‑Speech client
const textToSpeech = require('@google-cloud/text-to-speech');
const { writeFile } = require('node:fs/promises');

const client = new textToSpeech.TextToSpeechClient();

const vocab = require("./renderer/vocab/hsk3.json")
const sounds = require("./renderer/sounds")

async function quickStart() {
  for (const entry of vocab) {
    const mandoText = entry.hanzi
    const mandoFilename = `${mandoText}.mp3`

    // skip word if the vocab word is already in sounds
    if (mandoText in sounds) {
        console.log(`Skipping ${mandoText}, already in sounds directory`)
    } else {
        // generate the mandarin audio file
        const [mandarinRes] = await client.synthesizeSpeech({
            input: { text: mandoText },
            voice: { languageCode: 'zh-CN', ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        });
        await writeFile(mandoFilename, mandarinRes.audioContent, 'binary');
        console.log(`Audio content written to file: ${mandoFilename}`)

        // generate the cantonese audio file
        const cantoText = entry.cantonese.hanzi
        const cantoFilename = `${cantoText}.mp3`
        const [cantoRes] = await client.synthesizeSpeech({
            input: { text: cantoText },
            voice: { languageCode: 'zh-HK', ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        });

        await writeFile(cantoFilename, cantoRes.audioContent, 'binary');
        console.log(`Audio content written to file: ${cantoFilename}`)
        }
    }
}

// Call without top‑level await (CommonJS):
quickStart().catch(console.error);