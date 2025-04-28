package com.dropand.repository;

import com.dropand.domain.Directory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DirectoryRepository extends JpaRepository<Directory, Long> {
    
    List<Directory> findByParent_IdOrderBySortOrderAsc(Long parentId);
    
    List<Directory> findByParentIsNullOrderBySortOrderAsc();
    
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Directory d WHERE d.parent.id = :directoryId")
    boolean hasChildren(@Param("directoryId") Long directoryId);
    
    Optional<Directory> findTopByParent_IdOrderBySortOrderDesc(Long parentId);
    
    Optional<Directory> findTopByParentIsNullOrderBySortOrderDesc();
} 