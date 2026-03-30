// Registration MOCK tests, since prisma and betterauth handle validation, not me.
// Trying my best to replicate it.

import { moderateText } from "@/lib/moderation";

const cases = [
    // Sanitizes into empty name.
    {
        input: 
        {
            name: " ",
            email: "email@gmail.com",
            password: "11224"
        },
        expected: false
    },
    // does not include @
    {
        input: 
        {
            name: "Name",
            email: "email.gmail.com",
            password: "1212sasda8"
        },
        expected: false
    },
    // Works!
    {
        input: 
        {
            name: "Name",
            email: "email@gmail.com",
            password: "1212sasda8"
        },
        expected: true
    },
];

test.each(cases)("Registration Mock Tests: $input", async ({input, expected}) => {
    const nameValid = input.name.trim() !== "";

    const emailValid = input.email.trim() !== "" && input.email.includes("@");

    const passwordValid = input.password.length >= 8;

    expect(nameValid && emailValid && passwordValid).toBe(expected);
});