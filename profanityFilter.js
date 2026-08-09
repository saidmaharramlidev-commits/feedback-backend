// backend/lib/profanityFilter.js

const bannedWords = {
    en: [
        "nigger", "nigga", "faggot", "retard", "spic", "kike",
        "cunt", "fuck", "fck", "shit", "bitch", "asshole", "cock",
        "vagina", "penis", "squirt", "orgasm",
    ],
    az: [
        "göt", "sik", "amcıq", "orospu", "qəhbə", "döş", "peysər",
        "pesi", "besmantov", "vajina", "orgazm",
    ],
    tr: [
        "amcık", "orul", "kahpe", "yarrak", "piç",
    ],
};

// Words under ~3 characters are too collision-prone across languages
// to safely auto-block on their own — kept separate for now, wired in later.
const highRiskShortWords = {
    az: ["am", "s2", "gey"],
    tr: ["am", "sik"],
};

function normalize(text) {
    return text
        .toLowerCase()
        .replace(/[04]/g, "o")
        .replace(/[1!|]/g, "i")
        .replace(/3/g, "e")
        .replace(/\$/g, "s")
        .replace(/@/g, "a")
        .replace(/\s+/g, " ");
}

function buildWordRegex(word) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, "giu");
}

function containsProfanity(text) {
    if (!text) return false;

    const normalized = normalize(text);
    const allMainWords = [...bannedWords.en, ...bannedWords.az, ...bannedWords.tr];

    return allMainWords.some((word) => buildWordRegex(word).test(normalized));
}

export { bannedWords, buildWordRegex, containsProfanity, highRiskShortWords, normalize };
