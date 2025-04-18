package com.example.quizapp.service;

import com.example.quizapp.dao.QuestionDao;
import com.example.quizapp.dao.QuizDao;
import com.example.quizapp.model.Question;
import com.example.quizapp.model.QuestionWrapper;
import com.example.quizapp.model.Quiz;
import com.example.quizapp.model.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class QuizService {
    @Autowired
    QuizDao quizDao;
    @Autowired
    QuestionDao questionDao;

    public ResponseEntity<Quiz> createQuiz(String title) {
        try {
            Quiz quiz = new Quiz();
            quiz.setTitle(title);
            quiz = quizDao.save(quiz);
            return new ResponseEntity<>(quiz, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<String> addQuestionToQuiz(Integer quizId, Question question) {
        try {
            Optional<Quiz> quizOptional = quizDao.findById(quizId);
            if (quizOptional.isEmpty()) {
                return new ResponseEntity<>("Quiz not found", HttpStatus.NOT_FOUND);
            }

            Quiz quiz = quizOptional.get();
            question = questionDao.save(question);
            quiz.getQuestions().add(question);
            quizDao.save(quiz);

            return new ResponseEntity<>("Question added successfully", HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error adding question", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<List<QuestionWrapper>> getQuizQuestions(Integer id) {
        try {
            Optional<Quiz> quiz = quizDao.findById(id);

            if (quiz.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            List<Question> questionsFromDB = quiz.get().getQuestions();
            List<QuestionWrapper> questionsForUser = new ArrayList<>();

            for (Question q : questionsFromDB) {
                QuestionWrapper qw = new QuestionWrapper(q.getId(), q.getQuestionTitle(), q.getOption1(), q.getOption2(), q.getOption3(), q.getOption4());
                questionsForUser.add(qw);
            }

            return new ResponseEntity<>(questionsForUser, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace(); // Consider using a logger instead of printing the stack trace
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    public ResponseEntity<Integer> calculateResult(Integer id, List<Response> responses) {
        try {
            Optional<Quiz> quizOptional = quizDao.findById(id);

            if (quizOptional.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            Quiz quiz = quizOptional.get();
            List<Question> questions = quiz.getQuestions();

            if (responses.size() != questions.size()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }

            int right = 0;
            int i = 0;

            for (Response response : responses) {
                Question question = questions.get(i);
                // Get the correct option based on the response number
                String correctOption = getOptionByNumber(question, response.getResponse());
                if (correctOption != null && correctOption.equals(question.getRightAnswer())) {
                    right++;
                }
                i++;
            }

            return new ResponseEntity<>(right, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String getOptionByNumber(Question question, String optionNumber) {
        try {
            int num = Integer.parseInt(optionNumber);
            switch (num) {
                case 1:
                    return question.getOption1();
                case 2:
                    return question.getOption2();
                case 3:
                    return question.getOption3();
                case 4:
                    return question.getOption4();
                default:
                    return null;
            }
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        try {
            List<Quiz> quizzes = quizDao.findAll();
            return new ResponseEntity<>(quizzes, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(new ArrayList<>(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<String> updateQuiz(Integer id, String title) {
        try {
            Optional<Quiz> quizOptional = quizDao.findById(id);
            if (quizOptional.isEmpty()) {
                return new ResponseEntity<>("Quiz not found", HttpStatus.NOT_FOUND);
            }

            Quiz quiz = quizOptional.get();
            quiz.setTitle(title);
            quizDao.save(quiz);
            return new ResponseEntity<>("Quiz updated successfully", HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error updating quiz", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<String> deleteQuiz(Integer id) {
        try {
            Optional<Quiz> quizOptional = quizDao.findById(id);
            if (quizOptional.isEmpty()) {
                return new ResponseEntity<>("Quiz not found", HttpStatus.NOT_FOUND);
            }

            quizDao.deleteById(id);
            return new ResponseEntity<>("Quiz deleted successfully", HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Error deleting quiz", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
