package com.dropand.dto;

/**
 * 디렉토리 데이터 전송 객체(DTO)
 * 
 * 주요 기능:
 * 1. 도메인 객체와 프레젠테이션 계층 간의 데이터 교환
 * 2. API 응답으로 클라이언트에 전송할 디렉토리 정보 캡슐화
 * 3. 필요한 디렉토리 속성들만 포함하여 효율적인 데이터 전송
 */
public class DirectoryDto {
    /**
     * 디렉토리 고유 식별자
     */
    public Long id;
    
    /**
     * 디렉토리 이름
     */
    public String name;
    
    /**
     * 부모 디렉토리 ID
     * null인 경우 루트 디렉토리를 의미합니다.
     */
    public Long parentId;
    
    /**
     * 정렬 순서
     * 같은 부모 아래에서의 표시 순서를 결정합니다.
     */
    public Integer sortOrder;
    
    /**
     * 하위 디렉토리 포함 여부
     * 자식 디렉토리가 있는지 나타내는 플래그입니다.
     */
    public boolean hasChildren;
    
    /**
     * 기본 생성자
     */
    public DirectoryDto() {
    }
    
    /**
     * 모든 필드를 초기화하는 생성자
     * 
     * @param id 디렉토리 ID
     * @param name 디렉토리 이름
     * @param parentId 부모 디렉토리 ID
     * @param sortOrder 정렬 순서
     * @param hasChildren 하위 디렉토리 포함 여부
     */
    public DirectoryDto(Long id, String name, Long parentId, Integer sortOrder, boolean hasChildren) {
        this.id = id;
        this.name = name;
        this.parentId = parentId;
        this.sortOrder = sortOrder;
        this.hasChildren = hasChildren;
    }
    
    /**
     * 디렉토리 ID를 반환하는 메소드
     * 
     * @return 디렉토리 ID
     */
    public Long getId() {
        return id;
    }
    
    /**
     * 디렉토리 ID를 설정하는 메소드
     * 
     * @param id 설정할 디렉토리 ID
     */
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Long getParentId() {
        return parentId;
    }
    
    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }
    
    public Integer getSortOrder() {
        return sortOrder;
    }
    
    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
    
    public boolean isHasChildren() {
        return hasChildren;
    }
    
    public void setHasChildren(boolean hasChildren) {
        this.hasChildren = hasChildren;
    }
}
