package com.dropand.repository;

import com.dropand.domain.Directory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 디렉토리 엔티티에 대한 데이터 액세스 인터페이스
 * 
 * @Repository 어노테이션:
 * - 이 인터페이스가 스프링의 데이터 액세스 계층 컴포넌트임을 나타냅니다.
 * - 스프링 데이터 JPA가 이 인터페이스의 구현체를 자동으로 생성합니다.
 * 
 * JpaRepository<Directory, Long>:
 * - Directory 엔티티에 대한 CRUD 작업을 제공합니다.
 * - 첫 번째 타입 파라미터(Directory)는 관리할 엔티티 타입입니다.
 * - 두 번째 타입 파라미터(Long)는 엔티티의 ID 타입입니다.
 * - 페이징, 정렬 등 다양한 쿼리 메소드를 상속받습니다.
 */
@Repository
public interface DirectoryRepository extends JpaRepository<Directory, Long> {
    
    /**
     * 특정 부모 디렉토리 아래의 모든 자식 디렉토리를 정렬 순서대로 조회합니다.
     * 메소드 이름 규칙을 따라 자동으로 쿼리가 생성됩니다.
     * 
     * @param parentId 부모 디렉토리 ID
     * @return 정렬된 자식 디렉토리 목록
     */
    List<Directory> findByParent_IdOrderBySortOrderAsc(Long parentId);
    
    /**
     * 최상위 디렉토리(부모가 없는 디렉토리)를 정렬 순서대로 모두 조회합니다.
     * 
     * @return 정렬된 최상위 디렉토리 목록
     */
    List<Directory> findByParentIsNullOrderBySortOrderAsc();
    
    /**
     * 특정 디렉토리에 자식이 있는지 확인합니다.
     * JPQL(Java Persistence Query Language)을 사용한 커스텀 쿼리입니다.
     * 
     * @Query 어노테이션:
     * - 직접 JPQL 쿼리를 작성할 수 있게 합니다.
     * - 엔티티 클래스와 필드를 참조합니다(테이블과 컬럼이 아님).
     * 
     * @Param 어노테이션:
     * - JPQL 쿼리의 명명된 파라미터와 메소드 파라미터를 매핑합니다.
     * 
     * @param directoryId 확인할 디렉토리 ID
     * @return 자식이 있으면 true, 없으면 false
     */
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Directory d WHERE d.parent.id = :directoryId")
    boolean hasChildren(@Param("directoryId") Long directoryId);
    
    /**
     * 특정 부모 디렉토리 아래에서 정렬 순서가 가장 큰(마지막) 디렉토리를 조회합니다.
     * 새 디렉토리 추가 시 정렬 순서를 결정하는 데 사용됩니다.
     * 
     * @param parentId 부모 디렉토리 ID
     * @return 마지막 정렬 순서를 가진 디렉토리 (없으면 빈 Optional)
     */
    Optional<Directory> findTopByParent_IdOrderBySortOrderDesc(Long parentId);
    
    /**
     * 최상위 레벨에서 정렬 순서가 가장 큰(마지막) 디렉토리를 조회합니다.
     * 
     * @return 마지막 정렬 순서를 가진 최상위 디렉토리 (없으면 빈 Optional)
     */
    Optional<Directory> findTopByParentIsNullOrderBySortOrderDesc();
} 