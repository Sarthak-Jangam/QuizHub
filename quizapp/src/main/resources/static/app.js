// Base URL for API calls
const API_BASE_URL = 'http://localhost:8080';

// DOM Elements
const loginSection = document.getElementById('loginSection');
const homeSection = document.getElementById('homeSection');
const questionsSection = document.getElementById('questionsSection');
const addQuestionSection = document.getElementById('addQuestionSection');
const quizSection = document.getElementById('quizSection');
const resultSection = document.getElementById('resultSection');
const questionsList = document.getElementById('questionsList');
const quizQuestions = document.getElementById('quizQuestions');
const submitQuizBtn = document.getElementById('submitQuiz');
const createQuizForm = document.getElementById('createQuizForm');
const addQuestionForm = document.getElementById('addQuestionForm');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const userDisplay = document.getElementById('userDisplay');
const navLinks = document.getElementById('navLinks');
const adminSection = document.getElementById('adminSection');
const quizList = document.getElementById('quizList');
const addQuestionsSection = document.getElementById('addQuestionsSection');
const addQuestionToQuizForm = document.getElementById('addQuestionToQuizForm');
const finishQuizBtn = document.getElementById('finishQuizBtn');

// Current state
let currentQuizId = null;
let currentQuizTitle = '';
let userResponses = [];
let currentUser = null;

// User roles
const ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER'
};

// Show different sections
function showLogin() {
    loginSection.style.display = 'block';
    homeSection.style.display = 'none';
    questionsSection.style.display = 'none';
    addQuestionSection.style.display = 'none';
    quizSection.style.display = 'none';
    resultSection.style.display = 'none';
}

function showHome() {
    loginSection.style.display = 'none';
    homeSection.style.display = 'block';
    questionsSection.style.display = 'none';
    addQuestionSection.style.display = 'none';
    quizSection.style.display = 'none';
    resultSection.style.display = 'none';
    fetchAvailableQuizzes();
}

function showQuestions() {
    loginSection.style.display = 'none';
    homeSection.style.display = 'none';
    questionsSection.style.display = 'block';
    addQuestionSection.style.display = 'none';
    quizSection.style.display = 'none';
    resultSection.style.display = 'none';
    fetchAllQuestions();
}

function showAddQuestion() {
    loginSection.style.display = 'none';
    homeSection.style.display = 'none';
    questionsSection.style.display = 'none';
    addQuestionSection.style.display = 'block';
    quizSection.style.display = 'none';
    resultSection.style.display = 'none';
}

// Update navigation based on user role
function updateNavigation() {
    navLinks.innerHTML = '';
    
    // Add Home link for all users
    const homeLink = document.createElement('li');
    homeLink.className = 'nav-item';
    homeLink.innerHTML = '<a class="nav-link" href="#" onclick="showHome()">Home</a>';
    navLinks.appendChild(homeLink);

    // Add admin-specific links
    if (currentUser && currentUser.role === ROLES.ADMIN) {
        const questionsLink = document.createElement('li');
        questionsLink.className = 'nav-item';
        questionsLink.innerHTML = '<a class="nav-link" href="#" onclick="showQuestions()">Questions</a>';
        navLinks.appendChild(questionsLink);

        const addQuestionLink = document.createElement('li');
        addQuestionLink.className = 'nav-item';
        addQuestionLink.innerHTML = '<a class="nav-link" href="#" onclick="showAddQuestion()">Add Question</a>';
        navLinks.appendChild(addQuestionLink);
    }
}

// Event Listeners
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // In a real application, this would be an API call to authenticate
        // For demo purposes, we'll use hardcoded credentials
        if (username === 'admin' && password === 'admin') {
            currentUser = { username, role: ROLES.ADMIN };
        } else if (username === 'user' && password === 'user') {
            currentUser = { username, role: ROLES.USER };
        } else {
            alert('Invalid credentials');
            return;
        }

        userDisplay.textContent = `Welcome, ${currentUser.username}`;
        logoutBtn.style.display = 'block';
        adminSection.style.display = currentUser.role === ROLES.ADMIN ? 'block' : 'none';
        updateNavigation();
        showHome();
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
});

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    userDisplay.textContent = '';
    logoutBtn.style.display = 'none';
    showLogin();
});

createQuizForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (currentUser.role !== ROLES.ADMIN) {
        alert('Only admins can create quizzes');
        return;
    }

    const title = document.getElementById('quizTitle').value;

    try {
        const response = await fetch(`${API_BASE_URL}/quiz/create?title=${title}`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Failed to create quiz');
        }

        const quiz = await response.json();
        currentQuizId = quiz.id;
        
        // Hide create form and show add questions section
        createQuizForm.parentElement.style.display = 'none';
        addQuestionsSection.style.display = 'block';
        
    } catch (error) {
        console.error('Error creating quiz:', error);
        alert('Error creating quiz. Please try again.');
    }
});

addQuestionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (currentUser.role !== ROLES.ADMIN) {
        alert('Only admins can add questions');
        return;
    }

    // Get form elements
    const titleInput = document.getElementById('addQuestionTitle');
    const option1Input = document.getElementById('addOption1');
    const option2Input = document.getElementById('addOption2');
    const option3Input = document.getElementById('addOption3');
    const option4Input = document.getElementById('addOption4');
    const correctAnswerInput = document.getElementById('addCorrectAnswer');
    const categoryInput = document.getElementById('addQuestionCategory');

    // Check if all form elements exist
    if (!titleInput || !option1Input || !option2Input || !option3Input || 
        !option4Input || !correctAnswerInput || !categoryInput) {
        console.error('Form elements not found');
        alert('Error: Form elements not found. Please try again.');
        return;
    }

    // Get form values
    const formData = {
        questionTitle: titleInput.value,
        option1: option1Input.value,
        option2: option2Input.value,
        option3: option3Input.value,
        option4: option4Input.value,
        rightAnswer: correctAnswerInput.value,
        category: categoryInput.value
    };

    // Log form data for debugging
    console.log('Form Data:', formData);

    // Check if any field is empty or only whitespace
    const emptyFields = Object.entries(formData)
        .filter(([key, value]) => !value || value.trim() === '')
        .map(([key]) => key);

    if (emptyFields.length > 0) {
        console.log('Empty fields:', emptyFields);
        alert('All fields are required. Please fill in all the fields.');
        return;
    }

    const question = {
        questionTitle: formData.questionTitle.trim(),
        option1: formData.option1.trim(),
        option2: formData.option2.trim(),
        option3: formData.option3.trim(),
        option4: formData.option4.trim(),
        rightAnswer: formData.rightAnswer.trim(),
        category: formData.category.trim(),
        difficultyLevel: "Easy"
    };

    try {
        const response = await fetch(`${API_BASE_URL}/question/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(question)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', errorText);
            throw new Error('Failed to add question');
        }

        alert('Question added successfully!');
        addQuestionForm.reset();
        // After successful addition, fetch and display all questions
        await fetchAllQuestions();
        showQuestions();
    } catch (error) {
        console.error('Error adding question:', error);
        alert('Error adding question. Please try again.');
    }
});

submitQuizBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/quiz/submit/${currentQuizId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userResponses)
        });
        const score = await response.json();
        showResult(score);
    } catch (error) {
        console.error('Error submitting quiz:', error);
        alert('Error submitting quiz. Please try again.');
    }
});

// Add event listener for adding questions to quiz
addQuestionToQuizForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const question = {
        questionTitle: document.getElementById('questionTitle').value,
        option1: document.getElementById('option1').value,
        option2: document.getElementById('option2').value,
        option3: document.getElementById('option3').value,
        option4: document.getElementById('option4').value,
        rightAnswer: document.getElementById('correctAnswer').value,
        category: "Custom", // You can modify this based on your needs
        difficultyLevel: "Easy"
    };

    try {
        const response = await fetch(`${API_BASE_URL}/quiz/${currentQuizId}/add-question`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(question)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add question');
        }

        // Clear the form
        addQuestionToQuizForm.reset();
        
        // Show success message
        alert('Question added successfully!');
    } catch (error) {
        console.error('Error adding question:', error);
        alert('Error adding question. Please try again.');
    }
});

// Add event listener for finishing quiz creation
finishQuizBtn.addEventListener('click', async () => {
    try {
        // After finishing, refresh the quiz list and return to home
        await fetchAvailableQuizzes();
        showHome();
    } catch (error) {
        console.error('Error finishing quiz creation:', error);
        alert('Error finishing quiz creation. Please try again.');
    }
});

// Helper Functions
async function fetchAvailableQuizzes() {
    try {
        const response = await fetch(`${API_BASE_URL}/quiz/all`);
        if (!response.ok) {
            throw new Error('Failed to fetch quizzes');
        }
        const quizzes = await response.json();
        displayQuizzes(quizzes);
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        alert('Error fetching quizzes. Please try again.');
    }
}

function displayQuizzes(quizzes) {
    quizList.innerHTML = '';
    quizzes.forEach(quiz => {
        const quizElement = document.createElement('div');
        quizElement.className = 'col-md-4 mb-4';
        quizElement.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">${quiz.title}</h5>
                    <p class="card-text">Category: ${quiz.category}</p>
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-primary" onclick="startQuiz(${quiz.id}, '${quiz.title}')">Start Quiz</button>
                        ${currentUser && currentUser.role === ROLES.ADMIN ? `
                            <div>
                                <button class="btn btn-warning btn-sm me-2" onclick="showUpdateQuizForm(${quiz.id}, '${quiz.title}')">Update</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteQuiz(${quiz.id})">Delete</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        quizList.appendChild(quizElement);
    });
}

async function startQuiz(quizId, title) {
    currentQuizId = quizId;
    currentQuizTitle = title;
    await loadQuizQuestions();
}

async function fetchAllQuestions() {
    try {
        const response = await fetch(`${API_BASE_URL}/question/allQuestions`);
        const questions = await response.json();
        displayQuestions(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Error fetching questions. Please try again.');
    }
}

function displayQuestions(questions) {
    questionsList.innerHTML = '';
    questions.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.className = 'list-group-item mb-3';
        
        questionElement.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-12">
                            <h5 class="card-title mb-3">${question.questionTitle || ''}</h5>
                            <div class="mb-3">
                                <strong>Category:</strong> ${question.category || ''}
                            </div>
                            <div class="mb-3">
                                <strong>Options:</strong>
                                <div class="ms-3 mt-2">
                                    <div>1. ${question.option1 || ''}</div>
                                    <div>2. ${question.option2 || ''}</div>
                                    <div>3. ${question.option3 || ''}</div>
                                    <div>4. ${question.option4 || ''}</div>
                                </div>
                            </div>
                            <div>
                                <strong>Correct Answer:</strong> ${question.rightAnswer || ''}
                            </div>
                        </div>
                        <div class="col-12 mt-3">
                            <div class="d-flex justify-content-end">
                                <button class="btn btn-warning btn-sm me-2" onclick="showUpdateQuestionForm(${question.id})">Update</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteQuestion(${question.id})">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Store question data as attributes for update functionality
        questionElement.dataset.questionId = question.id;
        questionElement.dataset.title = question.questionTitle;
        questionElement.dataset.option1 = question.option1;
        questionElement.dataset.option2 = question.option2;
        questionElement.dataset.option3 = question.option3;
        questionElement.dataset.option4 = question.option4;
        questionElement.dataset.rightAnswer = question.rightAnswer;
        questionElement.dataset.category = question.category;
        
        questionsList.appendChild(questionElement);
    });
}

async function loadQuizQuestions() {
    try {
        const response = await fetch(`${API_BASE_URL}/quiz/get/${currentQuizId}`);
        
        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage || 'Failed to load quiz questions');
        }

        const questions = await response.json();
        
        if (!Array.isArray(questions)) {
            throw new Error('Invalid response format from server');
        }

        if (questions.length === 0) {
            throw new Error('No questions found for this quiz');
        }

        displayQuizQuestions(questions);
    } catch (error) {
        console.error('Error loading quiz questions:', error);
        alert(error.message || 'Error loading quiz questions. Please try again.');
        showHome(); // Return to home page on error
    }
}

function displayQuizQuestions(questions) {
    homeSection.style.display = 'none';
    questionsSection.style.display = 'none';
    addQuestionSection.style.display = 'none';
    quizSection.style.display = 'block';
    resultSection.style.display = 'none';

    document.getElementById('quizTitleDisplay').textContent = currentQuizTitle;
    quizQuestions.innerHTML = '';
    userResponses = [];

    questions.forEach((question, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'quiz-question';
        questionElement.innerHTML = `
            <h4>Question ${index + 1}</h4>
            <p>${question.questionTitle}</p>
            <div class="quiz-options">
                <div class="quiz-option" onclick="selectOption(${index}, 1)">${question.option1}</div>
                <div class="quiz-option" onclick="selectOption(${index}, 2)">${question.option2}</div>
                <div class="quiz-option" onclick="selectOption(${index}, 3)">${question.option3}</div>
                <div class="quiz-option" onclick="selectOption(${index}, 4)">${question.option4}</div>
            </div>
        `;
        quizQuestions.appendChild(questionElement);
        userResponses.push({ id: question.id, response: null });
    });

    submitQuizBtn.style.display = 'block';
}

function selectOption(questionIndex, optionIndex) {
    const options = document.querySelectorAll(`.quiz-question:nth-child(${questionIndex + 1}) .quiz-option`);
    options.forEach(option => option.classList.remove('selected'));
    options[optionIndex - 1].classList.add('selected');
    
    userResponses[questionIndex].response = optionIndex;
}

function showResult(score) {
    homeSection.style.display = 'none';
    questionsSection.style.display = 'none';
    addQuestionSection.style.display = 'none';
    quizSection.style.display = 'none';
    resultSection.style.display = 'block';
    
    document.getElementById('scoreDisplay').textContent = `Your Score: ${score}`;
}

// Add new functions for question management
async function deleteQuestion(questionId) {
    if (!confirm('Are you sure you want to delete this question?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/question/delete/${questionId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Question deleted successfully!');
            fetchAllQuestions();
        } else {
            alert('Error deleting question. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting question:', error);
        alert('Error deleting question. Please try again.');
    }
}

function showUpdateQuestionForm(questionId) {
    // Hide other sections
    loginSection.style.display = 'none';
    homeSection.style.display = 'none';
    questionsSection.style.display = 'none';
    addQuestionSection.style.display = 'block';
    quizSection.style.display = 'none';
    resultSection.style.display = 'none';

    // Set the form title
    document.querySelector('#addQuestionSection h2').textContent = 'Update Question';
    
    // Find the question in the list
    const question = questionsList.querySelector(`[data-question-id="${questionId}"]`);
    if (question) {
        // Populate the form with existing question data
        document.getElementById('addQuestionTitle').value = question.dataset.title;
        document.getElementById('addOption1').value = question.dataset.option1;
        document.getElementById('addOption2').value = question.dataset.option2;
        document.getElementById('addOption3').value = question.dataset.option3;
        document.getElementById('addOption4').value = question.dataset.option4;
        document.getElementById('addCorrectAnswer').value = question.dataset.rightAnswer;
        document.getElementById('addQuestionCategory').value = question.dataset.category;
        
        // Change the form submit button to update
        const submitButton = document.querySelector('#addQuestionForm button[type="submit"]');
        submitButton.textContent = 'Update Question';
        submitButton.onclick = (e) => updateQuestion(e, questionId);
    }
}

async function updateQuestion(e, questionId) {
    e.preventDefault();
    
    const question = {
        questionTitle: document.getElementById('addQuestionTitle').value,
        option1: document.getElementById('addOption1').value,
        option2: document.getElementById('addOption2').value,
        option3: document.getElementById('addOption3').value,
        option4: document.getElementById('addOption4').value,
        rightAnswer: document.getElementById('addCorrectAnswer').value,
        category: document.getElementById('addQuestionCategory').value,
        difficultyLevel: "Easy"
    };

    try {
        const response = await fetch(`${API_BASE_URL}/question/update/${questionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(question)
        });
        
        if (response.ok) {
            alert('Question updated successfully!');
            showQuestions();
        } else {
            alert('Error updating question. Please try again.');
        }
    } catch (error) {
        console.error('Error updating question:', error);
        alert('Error updating question. Please try again.');
    }
}

// Add new functions for quiz management
async function deleteQuiz(quizId) {
    if (!confirm('Are you sure you want to delete this quiz?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/quiz/delete/${quizId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Quiz deleted successfully!');
            fetchAvailableQuizzes();
        } else {
            alert('Error deleting quiz. Please try again.');
        }
    } catch (error) {
        console.error('Error deleting quiz:', error);
        alert('Error deleting quiz. Please try again.');
    }
}

function showUpdateQuizForm(quizId, currentTitle) {
    // Hide other sections
    loginSection.style.display = 'none';
    homeSection.style.display = 'block';
    questionsSection.style.display = 'none';
    addQuestionSection.style.display = 'none';
    quizSection.style.display = 'none';
    resultSection.style.display = 'none';

    // Show the update form
    const updateForm = document.createElement('div');
    updateForm.className = 'card mt-4';
    updateForm.innerHTML = `
        <div class="card-body">
            <h3>Update Quiz</h3>
            <form id="updateQuizForm">
                <div class="mb-3">
                    <label for="updateQuizTitle" class="form-label">Quiz Title</label>
                    <input type="text" class="form-control" id="updateQuizTitle" value="${currentTitle}" required>
                </div>
                <button type="submit" class="btn btn-primary">Update Quiz</button>
                <button type="button" class="btn btn-secondary ms-2" onclick="showHome()">Cancel</button>
            </form>
        </div>
    `;
    
    // Remove any existing update form
    const existingForm = document.getElementById('updateQuizForm');
    if (existingForm) {
        existingForm.parentElement.remove();
    }
    
    // Add the new form
    document.getElementById('homeSection').appendChild(updateForm);
    
    // Add event listener for form submission
    document.getElementById('updateQuizForm').addEventListener('submit', (e) => updateQuiz(e, quizId));
}

async function updateQuiz(e, quizId) {
    e.preventDefault();
    
    const title = document.getElementById('updateQuizTitle').value;

    try {
        const response = await fetch(`${API_BASE_URL}/quiz/update/${quizId}?title=${encodeURIComponent(title)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        if (response.ok) {
            alert('Quiz updated successfully!');
            fetchAvailableQuizzes(); // Refresh the quiz list
            showHome();
        } else {
            const errorText = await response.text();
            if (response.status === 404) {
                alert('Quiz not found. It may have been deleted.');
            } else {
                alert(`Error updating quiz: ${errorText}`);
            }
        }
    } catch (error) {
        console.error('Error updating quiz:', error);
        alert('Network error while updating quiz. Please check your connection and try again.');
    }
}

// Initialize
showLogin(); 