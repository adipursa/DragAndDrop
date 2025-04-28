package com.dropand.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * 로그인 관련 요청을 처리하는 컨트롤러
 * 
 * 주요 기능:
 * 1. 로그인 페이지 제공
 * 2. 로그인/로그아웃 처리
 * 3. 인증 실패 처리
 * 4. 세션 관리
 */

@Controller
public class LoginController {

    @RequestMapping(value = "/loginPage", method = RequestMethod.GET)
    public ModelAndView loginPage() {
        return new ModelAndView("loginPage");
    }

    // Spring Security가 로그인 처리를 하므로 별도의 POST 핸들러는 필요하지 않음
} 