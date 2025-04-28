package com.dropand.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 스프링 시큐리티 구성 클래스
 * 인증, 인가, 보안 설정을 정의합니다.
 * 
 * @Configuration: 이 클래스가 스프링의 구성 클래스임을 나타냅니다.
 * @EnableWebSecurity: 웹 보안 기능을 활성화하고 스프링 시큐리티 필터 체인을 구성합니다.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * 보안 필터 체인을 구성하는 빈 메소드
     * HTTP 요청에 대한 보안 규칙을 정의합니다.
     * 
     * @Bean: 이 메소드가 스프링 컨테이너에 의해 관리되는 빈을 반환함을 나타냅니다.
     * 
     * @param http HttpSecurity 객체 - 보안 필터 체인 구성에 사용됩니다.
     * @return 구성된 SecurityFilterChain 객체
     * @throws Exception 보안 구성 중 오류가 발생한 경우
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests((requests) -> requests
                .requestMatchers("/loginPage", "/css_html5/**", "/js_html5/**").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin((form) -> form
                .loginPage("/loginPage")
                .loginProcessingUrl("/loginPage")
                .defaultSuccessUrl("/html5/index.html", true)
                .failureUrl("/loginPage?error=true")
                .permitAll()
            )
            .logout((logout) -> logout.permitAll());

        return http.build();
    }

    /**
     * 사용자 인증 정보를 제공하는 빈 메소드
     * 테스트용 인메모리 사용자를 생성합니다.
     * 
     * @return UserDetailsService 구현체 - 사용자 정보 제공
     */
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails admin =
             User.withDefaultPasswordEncoder()
                .username("admin")
                .password("admin")
                .roles("ADMIN")
                .build();

        return new InMemoryUserDetailsManager(admin);
    }
}
