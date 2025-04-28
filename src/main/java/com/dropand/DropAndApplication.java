package com.dropand;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * DropAnd 애플리케이션의 메인 클래스
 * 
 * 주요 기능:
 * 1. 스프링 부트 애플리케이션 시작점
 * 2. 애플리케이션 설정 및 초기화
 * 3. 컴포넌트 스캔 및 빈 등록
 * 
 * @SpringBootApplication 어노테이션은 다음 세 가지 어노테이션을 포함합니다:
 * - @Configuration: 이 클래스가 빈 정의의 소스임을 나타냅니다.
 * - @EnableAutoConfiguration: 스프링 부트의 자동 구성 메커니즘을 활성화합니다.
 * - @ComponentScan: 'com.dropand' 패키지에서 컴포넌트를 스캔합니다.
 */

@SpringBootApplication
public class DropAndApplication {
    public static void main(String[] args) {
        SpringApplication.run(DropAndApplication.class, args);
    }
} 