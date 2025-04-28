package com.dropand.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * 메인 페이지 관련 요청을 처리하는 컨트롤러
 * 
 * 주요 기능:
 * 1. 메인 페이지 라우팅
 * 2. 디렉토리 관리 페이지 제공
 * 3. 페이지 접근 권한 관리
 * 
 * @Controller 어노테이션:
 * - 이 클래스가 스프링 MVC의 컨트롤러임을 나타냅니다.
 * - 스프링 컨테이너가 이 클래스를 빈으로 등록하고 관리합니다.
 * - 뷰 반환 컨트롤러로서 템플릿 이름이나 리다이렉트 URL을 반환합니다.
 */

@Controller
public class MainController {
    
    /**
     * 루트 URL(/)에 대한 GET 요청을 처리하는 메소드
     * 
     * @GetMapping 어노테이션:
     * - HTTP GET 요청을 특정 핸들러 메소드에 매핑합니다.
     * - 여기서는 루트 경로(/)를 이 메소드에 매핑합니다.
     *
     * @return HTML5 인덱스 페이지로 리다이렉트하는 문자열
     *         "redirect:" 접두사는 스프링 MVC의 리다이렉션을 나타냅니다.
     */
    @GetMapping("/")
    public String index() {
        return "redirect:/html5/index.html";
    }
}