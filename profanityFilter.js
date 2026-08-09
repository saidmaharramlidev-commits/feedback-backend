const forbiddenWords = [
    // English
    "nigger", "faggot", "retard", "spic", "kike", "nigga", "fck",
    "cunt", "fuck", "shit", "ass", "bitch", "asshole", "cock", "suck",
    "vagina", "penis", "squirt", "orgasm", "dildo", "vibrator",

    // Azerbaijani
    "göt", "sik", "amcıq", "orospu", "qəhbə", "döş", "peysər", "pesi", "besmantov", "s2", "gey", "vajina", "orgazm",

    // Turkish
    "amcık", "orul", "kahpe",
];

function normalize(text) {
    let t = text.toLowerCase();

    t = t.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "");

    t = t.replace(/(.)\1{2,}/g, "$1");

    t = t.replace(/[\s\-_.*]+(?=[a-zçğıöşü])/g, "");

    t = t
        .replace(/[04]/g, "o")
        .replace(/[1!|íìî]/g, "i")
        .replace(/[3€éèê]/g, "e")
        .replace(/\$/g, "s")
        .replace(/[5]/g, "s")
        .replace(/[@]/g, "a")
        .replace(/[7+]/g, "t")
        .replace(/[8]/g, "b")
        .replace(/[9]/g, "g")
        .replace(/[ç]/g, "c")
        .replace(/[ğ]/g, "g")
        .replace(/[ı]/g, "i")
        .replace(/[ö]/g, "o")
        .replace(/[ş]/g, "s")
        .replace(/[ü]/g, "u")
        .replace(/[ə]/g, "e");

    return t.replace(/\s+/g, " ").trim();
}

function buildWordRegex(word) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, "giu");
}

export const containsProfanity = (text) => {
    if (!text) return false;
    const normalizedText = normalize(text);
    return forbiddenWords.some((word) => buildWordRegex(normalize(word)).test(normalizedText));
};