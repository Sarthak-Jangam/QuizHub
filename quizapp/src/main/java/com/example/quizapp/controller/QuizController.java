package com.example.quizapp.controller;

import com.example.quizapp.model.Question;
import com.example.quizapp.model.QuestionWrapper;
import com.example.quizapp.model.Quiz;
import com.example.quizapp.model.Response;
import com.example.quizapp.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("quiz")
@CrossOrigin("*")
public class QuizController {
    @Autowired
    QuizService quizService;

    @GetMapping("all")
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        return quizService.getAllQuizzes();
    }

    @PostMapping("create")
    public ResponseEntity<Quiz> createQuiz(@RequestParam String title) {
        return quizService.createQuiz(title);
    }

    @PostMapping("{quizId}/add-question")
    public ResponseEntity<String> addQuestionToQuiz(
            @PathVariable Integer quizId,
            @RequestBody Question question) {
        return quizService.addQuestionToQuiz(quizId, question);
    }

    @GetMapping("get/{id}")
    public ResponseEntity<List<QuestionWrapper>> getQuizQuestions(@PathVariable Integer id) {
       return quizService.getQuizQuestions(id);
    }

    @PostMapping("submit/{id}")
    public ResponseEntity<Integer> submitQuiz(@PathVariable Integer id, @RequestBody List<Response> responses) {
        return quizService.calculateResult(id,responses);
    }

    @PutMapping("update/{id}")
    public ResponseEntity<String> updateQuiz(
            @PathVariable Integer id,
            @RequestParam String title) {
        return quizService.updateQuiz(id, title);
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<String> deleteQuiz(@PathVariable Integer id) {
        return quizService.deleteQuiz(id);
    }
}
