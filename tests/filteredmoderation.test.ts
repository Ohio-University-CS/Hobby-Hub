// Moderation tests, tests for flagged words violating community guidelines.

import containsBannedWords from "@/lib/banned-words";

const cases = [
    // Contains bad word, plainly
    {input: "shit", expected: true},
    // Does not contain bad word.
    {input: "Hello!", expected: false},
    // Contains bad word, but inconsistent caps.
    {input: "SHit", expected: true},
];

test.each(cases)("Contains banned words: $input", async ({input, expected}) => {
    expect(containsBannedWords(input)).toBe(expected);
});