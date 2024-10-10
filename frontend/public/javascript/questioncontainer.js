export default function QuestionContainer(container, containerzes, resultcontainer) {
    // Fisher-Yates shuffle function
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // Random index
            // Swap elements
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    let currentQuestion = 0;
    let score = 0; // Initialize score
    let cnt = 1;
    const answeredQuestions = new Set();  // Keep track of answered questions

    // Create initial UI
    const containerCategory = document.createElement('span');
    containerCategory.classList.add('container-category');
    container.appendChild(containerCategory);

    const countContainer = document.createElement('div');
    countContainer.classList.add('d-flex', 'justify-space-between');

    const qnsCount = document.createElement('span');
    qnsCount.classList.add('qns-count');
    countContainer.appendChild(qnsCount);

    const scoreContainer = document.createElement('span');
    scoreContainer.classList.add('cur-score');
    countContainer.appendChild(scoreContainer);

    // Create question and options UI
    const questionParent = document.createElement('div');
    const optionsParent = document.createElement('div');
    const ctaBtns = document.createElement('div');
    ctaBtns.classList.add('cta-btns', 'd-flex', 'justify-center', 'gap', 'flex-column');

    const navigationBtns = document.createElement('div');
    navigationBtns.classList.add('d-flex', 'justify-center', 'gap');

    const prevBtn = document.createElement('button');
    prevBtn.classList.add('cta', 'prev');
    prevBtn.textContent = 'Previous';
    navigationBtns.appendChild(prevBtn);

    const nextBtn = document.createElement('button');
    nextBtn.classList.add('cta', 'next');
    nextBtn.textContent = 'Next';
    navigationBtns.appendChild(nextBtn);

    ctaBtns.appendChild(navigationBtns);

    const quitBtn = document.createElement('button');
    quitBtn.classList.add('cta', 'quit');
    quitBtn.textContent = 'Quit';
    ctaBtns.appendChild(quitBtn);

    container.appendChild(countContainer);
    container.appendChild(questionParent);
    container.appendChild(optionsParent);
    container.appendChild(ctaBtns);

    // Function to create a question and its options
    function createQuestionAndOptions() {
        const currentData = containerzes[currentQuestion];
        console.log('Current Question Data:', currentData); // Debug current data

        qnsCount.innerText = `Q${currentQuestion + 1}/${containerzes.length}`;
        scoreContainer.innerText = `Score: ${score}`;
        containerCategory.innerText = currentData.category;

        questionParent.innerHTML = `Q${currentQuestion + 1}: ${currentData.question}`;

        const options = [
            currentData.correct_answer,
            ...currentData.incorrect_answers,
        ];
        const shuffledOptions = shuffleArray(options);
        console.log('Shuffled Options:', shuffledOptions);  // Debug shuffled options

        optionsParent.innerHTML = ''; // Clear previous options

        // Create option buttons
        for (let option of shuffledOptions) {
            const optionBtn = document.createElement("button");
            optionBtn.classList.add("button", "circular-btn");
            optionBtn.setAttribute("name", option);
            optionBtn.innerText = option;

            // Disable the button if the question has been answered
            if (answeredQuestions.has(currentQuestion)) {
                optionBtn.setAttribute("disabled", true);
                if (option === currentData.correct_answer) {
                    optionBtn.classList.add("success");
                } else if (option === currentData.selected_answer) {
                    optionBtn.classList.add("error");
                }
            }

            optionsParent.appendChild(optionBtn);
        }

        updateButtonStates();
    }

    // Event listener for the Previous button
    prevBtn.addEventListener("click", () => {
        if (currentQuestion > 0) {
            currentQuestion--;
            createQuestionAndOptions();
            nextBtn.innerText = "Next";
        }
        updateButtonStates();
    });

    // Event listener for the Next button
    nextBtn.addEventListener("click", () => {
        if (nextBtn.innerText === "Next") {
            currentQuestion++;
            if (currentQuestion < containerzes.length) {
                createQuestionAndOptions();
            }
            if (currentQuestion === containerzes.length - 1) {
                nextBtn.innerText = "Submit";
            }
        } else if (nextBtn.innerText === "Submit") {
            container.classList.add("hide");
            resultcontainer.classList.remove("hide");
            resultcontainer.innerText = `YOUR SCORE: ${score}`;
            console.log("Quiz finished!");  // Handle submission logic
            submitScore();
            updateUserRank();
        }
        updateButtonStates();
    });

    // Event listener for the Quit button
    quitBtn.addEventListener("click", () => {
        score = 0;
        container.classList.add("hide");
        resultcontainer.classList.remove("hide");
        resultcontainer.innerText = `YOUR SCORE: ${score}`;
        console.log("Quiz quit. Final score:", score);
    });

    // Event listener for options selection
    optionsParent.addEventListener("click", (e) => {
        if (e.target.classList.contains("button") && !answeredQuestions.has(currentQuestion)) {
            const selectedAnswer = e.target.getAttribute("name");
            const correctAnswer = containerzes[currentQuestion].correct_answer;

            answeredQuestions.add(currentQuestion); // Mark question as answered
            containerzes[currentQuestion].selected_answer = selectedAnswer; // Store selected answer

            if (selectedAnswer === correctAnswer) {
                e.target.classList.add("success");
                score += 5;
                scoreContainer.innerText = `Score: ${score}`;
            } else {
                e.target.classList.add("error");
                score--;
                // Highlight the correct answer
                optionsParent.querySelector(`[name="${correctAnswer}"]`).classList.add("success");
            }

            // Disable all options after selection
            optionsParent.querySelectorAll(".button").forEach(button => {
                button.setAttribute("disabled", true);
            });
        }
    });

    // Function to update button states
    function updateButtonStates() {
        prevBtn.disabled = currentQuestion === 0;
        nextBtn.disabled = currentQuestion === containerzes.length - 1 && nextBtn.innerText !== "Submit";
    }

    // Timer and loading message setup
    const timerElement = document.createElement('div');
    timerElement.classList.add('timer');
    timerElement.style.cssText = `
        font-size: 24px;
        font-weight: bold;
        margin-top: 20px;
        text-align: center;
        display: none;
    `;

    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('loading-message');
    loadingMessage.style.cssText = `
        font-size: 18px;
        margin-top: 10px;
        text-align: center;
        animation: blink 1s infinite;
        display: none;
    `;
    loadingMessage.textContent = 'Please wait, we are fetching your data';

    // Insert elements after the result container
    resultcontainer.insertAdjacentElement('afterend', timerElement);
    resultcontainer.insertAdjacentElement('afterend', loadingMessage);

    const style = document.createElement('style');
    style.textContent = `
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Timer function
    function startTimer() {
        let timeLeft = 10;
        timerElement.textContent = timeLeft;
        timerElement.style.display = 'block';
        loadingMessage.style.display = 'block';

        const countdown = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(countdown);
                timerElement.style.display = 'none';
                loadingMessage.style.display = 'none';
                location.href = '/dashboard';  // Redirect to dashboard
            }
        }, 1000);
    }

    nextBtn.addEventListener("click", () => {
        if (nextBtn.innerText === "Submit") {
            startTimer();
        }
    });

    quitBtn.addEventListener("click", () => {
        startTimer();
    });

    createQuestionAndOptions();  // Initial call to display first question
}

// Function to handle score submission
function submitScore() {
    fetch('/updatescore', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ score: score })  // Submit the score
    })
    .then(response => {
        if (response.ok) {
            console.log('Score submitted successfully');
            window.location.href = '/dashboard';  // Redirect to the dashboard page
        } else {
            throw new Error('Score submission failed');
        }
    })
    .catch(error => {
        console.error('Error submitting score:', error);
    });
}
// Function to update rank in the database
async function updateRank(rank) {
    try {
        const response = await fetch('/updaterank', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rank: rank })
        });

        if (!response.ok) {
            throw new Error('Rank update failed');
        }

        const result = await response.json();
        console.log('Rank updated successfully:', result);
    } catch (error) {
        console.error('Error updating rank:', error);
    }
}

// Function to fetch and update user's rank
async function updateUserRank() {
    try {
        const response = await fetch('/read', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const users = await response.json();
        
        // Sort users by score in descending order
        users.sort((a, b) => b.score - a.score);

        // Find the current user's position (rank)
        const currentUserEmail = await getCurrentUserEmail();
        const userRank = users.findIndex(user => user.userEmail === currentUserEmail) + 1;

        // Update the rank in the database
        await updateRank(userRank);

        return userRank;
    } catch (error) {
        console.error('Error updating user rank:', error);
        return null;
    }
}

// Helper function to get current user's email
async function getCurrentUserEmail() {
    try {
        const response = await fetch('/profile', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user profile');
        }

        const userData = await response.json();
        return userData.userEmail;
    } catch (error) {
        console.error('Error fetching user email:', error);
        return null;
    }
}
