//& GLOBAL
const MAX_CHARS = 150;
const BASE_API_URL = "https://bytegrad.com/course-assets/js/1/api";

const counterEl = document.querySelector(".counter");
const textareaEl = document.querySelector(".form__textarea");
const formEl = document.querySelector(".form");
const feedbackListEl = document.querySelector(".feedbacks");
const submitBtnEl = document.querySelector(".submit-btn");
const spinnerEl = document.querySelector(".spinner");

const renderFeedbackItem = (feedbackItem) => {
    // new feedback item HTML
    const feedbackItemHTML = `
        <li class="feedback">
            <button class="upvote">
                <i class="fa-solid fa-caret-up upvote__icon"></i>
                <span class="upvote__count">${feedbackItem.upvoteCount}</span>
            </button>
            <section class="feedback__badge">
                <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
            </section>
            <div class="feedback__content">
                <p class="feedback__company">${feedbackItem.company}</p>
                <p class="feedback__text">${feedbackItem.text}</p>
            </div>
            <p class="feedback__date">${
                feedbackItem.daysAgo === 0 ? "New" : feedbackItem.daysAgo + "d"
            }</p>
        </li>
    `;

    // Insert into HTMl
    feedbackListEl.insertAdjacentHTML("beforeend", feedbackItemHTML);
};

//& COUNTER COMPONENT
const inputHandler = () => {
    // Determine characters typed
    const charTyped = textareaEl.value.length;

    // Determine characters left
    const charLeft = MAX_CHARS - charTyped;

    // Display characters left
    counterEl.textContent = charLeft;
};

textareaEl.addEventListener("input", inputHandler);

//& FORM COMPONENT
const showVisualIndicator = (validity) => {
    // Show valid indicator
    formEl.classList.add(validity);

    // Remove valid indicator
    setTimeout(() => {
        formEl.classList.remove(validity);
    }, 1500);
};

const submitHandler = (event) => {
    // Prevent default form behaviour
    event.preventDefault();

    // Get user typed text
    const text = textareaEl.value;

    // Validate the text (eg. check if #hashtag is present and text is long enough)
    if (text.includes("#") && text.length >= 5) {
        showVisualIndicator("form--valid");
    } else {
        showVisualIndicator("form--invalid");

        // Get focus back onto textarea
        textareaEl.focus();

        // Stop function
        return;
    }

    // Extract info from text
    const hashtag = text.split(" ").find((word) => word.includes("#"));
    const company = hashtag.substring(1);
    const badgeLetter = company[0].toUpperCase();
    const upvoteCount = 0;
    const daysAgo = 0;

    // Create Feedback Item
    const feedbackItem = {
        upvoteCount,
        company,
        badgeLetter,
        text,
        daysAgo,
    };

    // Render Feedback Item in list
    renderFeedbackItem(feedbackItem);

    // Send feedback Item to Server
    fetch(`${BASE_API_URL}/feedbacks`, {
        method: "POST",
        body: JSON.stringify(feedbackItem),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (!response.ok) {
                alert("Failed to Submit");
                return;
            }
            alert("Succesfully Submitted");
        })
        .catch((error) => alert(error));

    // Clear Text area
    textareaEl.value = "";

    // Blur submit button
    submitBtnEl.blur();

    // Reset counter
    counterEl.textContent = MAX_CHARS;
};

formEl.addEventListener("submit", submitHandler);

//& FEEDBACK LIST COMPONENT --

const clickHandler = (event) => {
    // Get clicked HTML element
    const clickedEl = event.target;

    // User wanted to upvote
    const upvoteIntention = clickedEl.className.includes("upvote");
    if (upvoteIntention) {
        // disbable upvote button (Prevent double clikc or spam)
        const upvoteBtnEl = clickedEl.closest(".upvote")
        upvoteBtnEl.disabled = true

        // Update the upvote number
        const upvoteCountEl = upvoteBtnEl.querySelector('.upvote__count')

        // Get current upvote count
        let upvoteCount = +upvoteCountEl.textContent
        upvoteCountEl.textContent = ++upvoteCount

    } else {
        // User wanted to expand clicked feedback item
        clickedEl.closest(".feedback").classList.toggle("feedback--expand");
    }
};

feedbackListEl.addEventListener("click", clickHandler);

const fetchData = () => {
    fetch(`${BASE_API_URL}/feedbacks`)
        .then((response) => response.json())
        .then((data) => {
            // Remove Spinner
            spinnerEl.remove();

            // Iterate over the feedbacks from the server and output each item into HTML
            data.feedbacks.forEach((feedbackItem) =>
                renderFeedbackItem(feedbackItem)
            );
        })
        .catch((error) => {
            feedbackListEl.textContent = `Failed to fetch items. Error Message: ${error.message}`;
        });
};
fetchData();
