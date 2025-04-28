package com.dropand.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 디렉토리 생성 요청 DTO 클래스
 * 클라이언트에서 전송된 디렉토리 생성 요청 데이터를 담는 객체입니다.
 * 
 * 주요 기능:
 * 1. API 요청 데이터 매핑
 * 2. 디렉토리 생성에 필요한 정보 전달
 * 3. 요청 유효성 검증을 위한 데이터 캡슐화
 * 
 * @Getter, @Setter: Lombok이 자동으로 getter, setter 메서드를 생성합니다.
 * @NoArgsConstructor: Lombok이 파라미터 없는 기본 생성자를 생성합니다.
 * @AllArgsConstructor: Lombok이 모든 필드를 초기화하는 생성자를 생성합니다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateDirectoryRequest {
    /**
     * 생성할 디렉토리 이름
     */
    private String name;
    
    /**
     * 부모 디렉토리 ID
     * null인 경우 루트 디렉토리로 생성됩니다.
     */
    private Long parentId;

    /**
     * 디렉토리 이름을 반환하는 메소드
     * 
     * @return 디렉토리 이름
     */
    public String getName() {
        return name;
    }

    /**
     * 디렉토리 이름을 설정하는 메소드
     * 
     * @param name 설정할 디렉토리 이름
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * 부모 디렉토리 ID를 반환하는 메소드
     * 
     * @return 부모 디렉토리 ID
     */
    public Long getParentId() {
        return parentId;
    }

    /**
     * 부모 디렉토리 ID를 설정하는 메소드
     * 
     * @param parentId 설정할 부모 디렉토리 ID
     */
    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    /**
     * 객체 정보를 문자열로 변환하는 메소드
     * 디버깅 및 로깅에 유용합니다.
     * 
     * @return 객체 정보를 포함한 문자열
     */
    @Override
    public String toString() {
        return "CreateDirectoryRequest{" +
            "name='" + name + '\'' +
            ", parentId=" + parentId +
            '}';
    }
} 