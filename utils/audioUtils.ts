
import { Blob } from '@google/genai';

// ENCODING (Browser -> Gemini)

/**
 * Encodes a raw audio buffer (Float32Array) into a base64 string.
 * This is used to prepare microphone audio for the Gemini Live API.
 */
function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Creates a Gemini API-compatible Blob from a Float32Array of audio data.
 * @param data The raw audio data from the microphone.
 * @returns A Blob object with base64 encoded data and the correct MIME type.
 */
export function createBlob(data: Float32Array): Blob {
    const l = data.length;
    // Convert Float32 to Int16 (the format Gemini expects)
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000', // Must be this exact MIME type
    };
}


// DECODING (Gemini -> Browser)

/**
 * Decodes a base64 string into a Uint8Array.
 * This is the first step in processing audio received from the Gemini Live API.
 */
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}


/**
 * Decodes raw PCM audio data (as a Uint8Array) into an AudioBuffer that can be played in the browser.
 * The browser's native `decodeAudioData` is for file formats (like mp3, wav), not raw streams,
 * so we must do this manually.
 * @param data The raw audio bytes from the API.
 * @param ctx The AudioContext to use for creating the buffer.
 * @param sampleRate The sample rate of the audio (Gemini output is 24000).
 * @param numChannels The number of audio channels (Gemini output is 1).
 * @returns A promise that resolves to a playable AudioBuffer.
 */
export async function decodeAudioData(
    base64: string,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const data = decode(base64);
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            // Convert Int16 back to Float32 for the Web Audio API
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}
