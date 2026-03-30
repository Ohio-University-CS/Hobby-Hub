const bannedWords = [
    "shit",
    "fuck",
    "bitch"
];

export default function containsBannedWords(text: string) {
    const normalized = text.toLowerCase();

    return bannedWords.some(word => normalized.includes(word));
}