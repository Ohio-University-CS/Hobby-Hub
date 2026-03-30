// Moderation tests, tests for flagged words violating community guidelines.

import containsBannedWords from "@/lib/banned-words";

const cases = [
    {input: "shit", expected: true},
    {input: "Hello!", expected: false},
    {input: "SHit", expected: true},
];

test.each(cases)("Contains banned words: $input", async ({input, expected}) => {
    expect(containsBannedWords(input)).toBe(expected);
});