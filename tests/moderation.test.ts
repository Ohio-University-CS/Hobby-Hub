// Moderation tests, tests for derogatory content violating community guidelines.

import { moderateText } from "@/lib/moderation";

const cases = [
    {input: "I hate minorities.", expected: true},
    {input: "I have a controversal opinion on a historically segregated group of people. I hate them.", expected: true},
    {input: "Yayy! I love flowers!!", expected: false},
    {input: "I love all of my queer friends!", expected: false}
];

test.each(cases)("Flags Community Guidelines: $input", async ({input, expected}) => {
    const result = await moderateText(input);

    expect(result.flagged).toBe(expected);
});