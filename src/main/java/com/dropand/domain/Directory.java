package com.dropand.domain;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * 디렉토리 도메인 엔티티 클래스
 * 
 * 주요 기능:
 * 1. 디렉토리 정보 저장 (ID, 이름, 정렬 순서)
 * 2. 계층 구조 관리 (부모-자식 관계)
 * 3. JPA 엔티티 매핑
 * 4. 디렉토리 조작을 위한 유틸리티 메서드 제공
 * 
 * 주요 어노테이션:
 * @Entity: JPA 엔티티 클래스임을 나타냅니다.
 * @Table: 이 엔티티와 매핑될 데이터베이스 테이블 정보를 지정합니다.
 * @Getter, @Setter: Lombok이 자동으로 getter, setter 메소드를 생성합니다.
 * @NoArgsConstructor, @AllArgsConstructor: Lombok이 생성자를 자동 생성합니다.
 * @JsonIdentityInfo: 객체 직렬화 시 무한 재귀 참조를 방지합니다.
 */

@Entity
@Table(name = "directories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIdentityInfo(
    generator = ObjectIdGenerators.PropertyGenerator.class,
    property = "id"
)
public class Directory {
    /**
     * 디렉토리의 고유 식별자(기본 키)
     * @Id: 이 필드가 기본 키임을 나타냅니다.
     * @GeneratedValue: 기본 키 생성 전략을 지정합니다.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 디렉토리 이름
     * @Column: 데이터베이스 컬럼 매핑 정보를 제공합니다.
     * nullable=false: 이 필드는 NULL 값을 허용하지 않습니다.
     */
    @Column(nullable = false)
    private String name;
    
    /**
     * 디렉토리 경로
     * 전체 경로 정보를 저장합니다.
     */
    @Column(nullable = false)
    private String path;
    
    /**
     * 디렉토리 정렬 순서
     * 같은 부모 아래에서의 표시 순서를 결정합니다.
     */
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;
    
    /**
     * 부모 디렉토리
     * @ManyToOne: 다대일 관계를 나타냅니다 (여러 디렉토리가 하나의 부모를 가질 수 있음).
     * @JoinColumn: 외래 키 컬럼을 지정합니다.
     * @JsonBackReference: 순환 참조를 방지하기 위한 Jackson 어노테이션입니다.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonBackReference
    private Directory parent;
    
    /**
     * 자식 디렉토리 목록
     * @OneToMany: 일대다 관계를 나타냅니다 (하나의 디렉토리가 여러 자식을 가질 수 있음).
     * mappedBy: 양방향 관계에서 관계의 주인을 지정합니다.
     * cascade: 부모 엔티티의 상태 변화가 자식 엔티티에 전파되는 방식을 지정합니다.
     * orphanRemoval: 부모와의 연관관계가 끊어진 자식 엔티티를 자동으로 삭제합니다.
     */
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @JsonManagedReference
    private List<Directory> children = new ArrayList<>();

    /**
     * 이름, 부모, 정렬 순서를 가진 디렉토리 생성자
     *
     * @param name 디렉토리 이름
     * @param parent 부모 디렉토리 (null인 경우 루트 디렉토리)
     * @param sortOrder 정렬 순서
     */
    public Directory(String name, Directory parent, Integer sortOrder) {
        this.name = name;
        this.parent = parent;
        this.sortOrder = sortOrder;
    }

    /**
     * 자식 디렉토리를 추가하는 메소드
     * 양방향 연관관계를 유지합니다.
     *
     * @param child 추가할 자식 디렉토리
     */
    public void addChild(Directory child) {
        this.children.add(child);
        child.setParent(this);
    }

    /**
     * 자식 디렉토리를 제거하는 메소드
     * 양방향 연관관계를 유지합니다.
     *
     * @param child 제거할 자식 디렉토리
     */
    public void removeChild(Directory child) {
        this.children.remove(child);
        child.setParent(null);
    }

    /**
     * ID를 반환하는 메소드
     * @return 디렉토리 ID
     */
    public Long getId() {
        return id;
    }

    /**
     * 이름을 반환하는 메소드
     * @return 디렉토리 이름
     */
    public String getName() {
        return name;
    }

    /**
     * 경로를 반환하는 메소드
     * @return 디렉토리 경로
     */
    public String getPath() {
        return path;
    }

    /**
     * 정렬 순서를 반환하는 메소드
     * @return 디렉토리 정렬 순서
     */
    public Integer getSortOrder() {
        return sortOrder;
    }

    /**
     * 부모 디렉토리를 반환하는 메소드
     * @return 부모 디렉토리 객체
     */
    public Directory getParent() {
        return parent;
    }

    /**
     * 자식 디렉토리 목록을 반환하는 메소드
     * @return 자식 디렉토리 목록
     */
    public List<Directory> getChildren() {
        return children;
    }

    /**
     * ID를 설정하는 메소드
     * @param id 설정할 디렉토리 ID
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * 이름을 설정하는 메소드
     * @param name 설정할 디렉토리 이름
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * 경로를 설정하는 메소드
     * @param path 설정할 디렉토리 경로
     */
    public void setPath(String path) {
        this.path = path;
    }

    /**
     * 정렬 순서를 설정하는 메소드
     * @param sortOrder 설정할 정렬 순서
     */
    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    /**
     * 부모 디렉토리를 설정하는 메소드
     * 양방향 연관관계를 유지합니다.
     * 
     * @param parent 설정할 부모 디렉토리
     */
    public void setParent(Directory parent) {
        // 이전 부모와의 관계 제거
        if (this.parent != null && this.parent.getChildren() != null) {
            this.parent.getChildren().remove(this);
        }

        // 새로운 부모 설정
        this.parent = parent;

        // 새로운 부모의 자식 목록에 추가
        if (parent != null && parent.getChildren() != null) {
            if (!parent.getChildren().contains(this)) {
                parent.getChildren().add(this);
            }
        }
    }

    /**
     * 엔티티 저장 또는 업데이트 전에 데이터 유효성을 검사하는 메소드
     * @PrePersist, @PreUpdate: 엔티티가 저장/업데이트되기 전에 자동으로 호출됩니다.
     *
     * @throws IllegalArgumentException 유효하지 않은 데이터가 있는 경우
     */
    @PrePersist
    @PreUpdate
    private void validateData() {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("디렉토리 이름은 필수입니다.");
        }
        if (sortOrder == null) {
            sortOrder = 0;
        }
    }

    /**
     * 부모 디렉토리의 ID를 반환하는 메소드
     * JSON 직렬화에 사용됩니다.
     *
     * @return 부모 디렉토리 ID (부모가 없으면 null)
     */
    @JsonProperty("parentId")
    public Long getParentId() {
        return parent != null ? parent.getId() : null;
    }

    /**
     * 디렉토리 정보를 문자열로 변환하는 메소드
     * 디버깅 및 로깅에 유용합니다.
     *
     * @return 디렉토리 정보를 포함한 문자열
     */
    @Override
    public String toString() {
        return "Directory{" +
            "id=" + id +
            ", name='" + name + '\'' +
            ", path='" + path + '\'' +
            ", sortOrder=" + sortOrder +
            ", parentId=" + getParentId() +
            '}';
    }
}