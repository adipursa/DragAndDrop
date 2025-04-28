package com.dropand.config;

import com.dropand.repository.DirectoryRepository;
import com.dropand.service.DirectoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 테스트용 초기 데이터를 생성하는 설정 클래스
 * 
 * 주요 기능:
 * 1. 애플리케이션 시작 시 테스트 데이터 생성 (현재는 data.sql 파일로 대체)
 * 2. 샘플 디렉토리 구조 생성 (현재는 data.sql 파일로 대체)
 * 3. 테스트 사용자 계정 생성 (현재 비활성화)
 */

@Configuration
@RequiredArgsConstructor
public class TestDataInitializer {

    private final DirectoryRepository directoryRepository;
    private final DirectoryService directoryService;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            // 초기 데이터는 resources/data.sql 파일을 통해 로드됩니다.
            // 추가적인 초기화 작업이 필요하면 여기에 작성하세요.
        };
    }
}