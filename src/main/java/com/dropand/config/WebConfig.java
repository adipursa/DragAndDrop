package com.dropand.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 웹 MVC 설정 클래스
 * 정적 리소스 처리와 웹 관련 설정을 담당합니다.
 * 
 * @Configuration 어노테이션:
 * - 이 클래스가 스프링의 구성 클래스임을 나타냅니다.
 * - 스프링 MVC의 추가 설정을 제공합니다.
 * 
 * WebMvcConfigurer 인터페이스:
 * - 스프링 MVC 구성을 커스터마이징할 수 있는 콜백 메소드를 제공합니다.
 * - 기본 구성은 유지하면서 특정 부분만 재정의할 수 있습니다.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    /**
     * 리소스 핸들러 경로 (URL 패턴)
     * 애플리케이션 프로퍼티에서 주입됩니다.
     * 
     * @Value 어노테이션:
     * - 프로퍼티 값을 필드에 주입합니다.
     * - 기본값으로 "/html5/**"가 사용됩니다.
     */
    @Value("${custom.resource-handler:/html5/**}")
    private String resourceHandler;

    /**
     * 정적 리소스 파일 실제 위치
     * 파일 시스템 경로를 지정합니다.
     */
    @Value("${custom.static-location:file:///C:/Users/master/workspace/dropAnd/adi_test/html5/}")
    private String staticLocation;

    /**
     * 정적 리소스 핸들러 추가 메소드
     * 커스텀 정적 리소스 위치를 설정합니다.
     * 
     * @param registry ResourceHandlerRegistry 객체 - 리소스 핸들러 등록에 사용됩니다.
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler(resourceHandler)
                .addResourceLocations(staticLocation);
    }

    /*
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/html5/main_html5/list.html");
    }
    */
}
