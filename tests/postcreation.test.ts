// Post Creation MOCK tests, since I handle the validation differently.
// The cases and checks I am doing occur in the post creation and update steps, but are not just
// "If title.trim() !== nothing"
// Instead, it just kind-of comes and goes and blocks submission if the form slots are empty.

const cases = [
    // Case 1: Works
    {input: 
        {
            title: "Title",
            body: "Body",
            interests: ["Interest1"]
        },
        expected: true
    },

    // Case 2, fails. Title uninitialized.
    {input: 
        {
            title: "",
            body: "Body",
            interests: ["Interest1"]
        },
        expected: false
    },

    // Case 3, fails. Body uninitialized.
    {input: 
        {
            title: "Title",
            body: "",
            interests: ["Interest1"]
        },
        expected: false
    },

    // Case 4, fails. Interests uninitialized.
    {input: 
        {
            title: "Title",
            body: "Body",
            interests: []
        },
        expected: false
    },
];

test.each(cases)("input: $input", async ({input, expected}) => {
    const titleValid = input.title.trim() !== "";
    const bodyValid = input.body.trim() !== "";
    const interestsValid = input.interests.length !== 0;

    expect(titleValid && bodyValid && interestsValid).toBe(expected);
})