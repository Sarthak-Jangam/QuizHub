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

    public ResponseEntity<String> createQuiz(String category, int numQ, String title) {
        try {
            List<Question> questions = questionDao.findRandomQuestionsByCategory(category, numQ);

            if (questions.isEmpty()) {
                return new ResponseEntity<>("No questions found for the given category", HttpStatus.NOT_FOUND);
            }

            Quiz quiz = new Quiz();
            quiz.setTitle(title);
            quiz.setQuestions(questions);
            quizDao.save(quiz);

            return new ResponseEntity<>("Quiz created successfully", HttpStatus.CREATED);

        } catch (Exception e) {
            e.printStackTrace(); // For debugging (Consider replacing this with a logger)
            return new ResponseEntity<>("An error occurred while creating the quiz", HttpStatus.INTERNAL_SERVER_ERROR);
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
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // Ensuring responses match questions
            }

            int right = 0;
            int i = 0;

            for (Response response : responses) {
                if (response.getResponse().equals(questions.get(i).getRightAnswer())) {
                    right++;
                }
                i++;
            }

            return new ResponseEntity<>(right, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace(); // Consider using a logger instead of printStackTrace()
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
