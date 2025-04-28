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
 * 
 * @Controller 어노테이션:
 * - 이 클래스가 스프링 MVC의 컨트롤러임을 나타냅니다.
 * - 스프링 부트가 이 클래스를 빈으로 등록하고 관리합니다.
 * - 웹 요청을 처리하고 적절한 응답을 반환합니다.
 */

@Controller
public class LoginController {

    /**
     * 로그인 페이지 요청을 처리하는 메소드
     * 
     * @RequestMapping 어노테이션:
     * - HTTP 요청을 특정 핸들러 메소드에 매핑합니다.
     * - value: 매핑할 URL 경로를 지정합니다.
     * - method: 처리할 HTTP 메소드를 지정합니다(여기서는 GET).
     *
     * @return ModelAndView 객체:
     * - 응답으로 보낼 뷰 이름과 모델 데이터를 포함합니다.
     * - "loginPage"는 src/main/resources/templates/loginPage.html 템플릿을 참조합니다.
     * - 모델: 뷰에 전달할 데이터 (여기서는 빈 모델)
     * - 뷰: 응답을 렌더링할 템플릿 (여기서는 "loginPage")
     */
    @RequestMapping(value = "/loginPage", method = RequestMethod.GET)
    public ModelAndView loginPage() {
        return new ModelAndView("loginPage");
    }

    // Spring Security가 로그인 처리를 하므로 별도의 POST 핸들러는 필요하지 않음
} 