package com.dropand.service;

import com.dropand.domain.Directory;
import com.dropand.dto.DirectoryDto;
import com.dropand.dto.DirectoryOrderDto;
import com.dropand.repository.DirectoryRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 디렉토리 관련 비즈니스 로직을 처리하는 서비스 클래스
 * 컨트롤러와 리포지토리 사이에서 실제 업무 로직을 처리합니다.
 */
@Service
public class DirectoryService {
    
    private static final Logger log = LoggerFactory.getLogger(DirectoryService.class);
    
    /**
     * 디렉토리 리포지토리 객체
     * 데이터베이스 작업을 처리합니다.
     */
    private final DirectoryRepository directoryRepository;
    
    // 명시적 생성자 추가
    public DirectoryService(DirectoryRepository directoryRepository) {
        this.directoryRepository = directoryRepository;
        log.info("DirectoryService 초기화됨");
    }
    
    /**
     * 전체 디렉토리 목록을 조회하는 메소드
     * 
     * @return 전체 디렉토리 목록
     */
    @Transactional(readOnly = true) 
    public List<DirectoryDto> getAllDirectories() {
        log.debug("모든 디렉토리 조회");
        List<Directory> directories = directoryRepository.findByParentIsNullOrderBySortOrderAsc();
        log.debug("전체 디렉토리 조회 완료 - 조회된 디렉토리 수: {}", directories.size());
        return directories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * 디렉토리 트리를 조회하는 메소드
     * 
     * @return 전체 디렉토리 트리
     */
    @Transactional(readOnly = true)
    public List<DirectoryDto> getDirectoryTree() {
        log.debug("디렉토리 트리 조회");
        List<Directory> rootDirectories = directoryRepository.findByParentIsNullOrderBySortOrderAsc();
        return rootDirectories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * 하위 디렉토리 목록을 조회하는 메소드
     * 
     * @param parentId 부모 디렉토리 ID
     * @return 하위 디렉토리 목록
     * @throws IllegalArgumentException 부모 디렉토리가 존재하지 않는 경우
     */
    @Transactional(readOnly = true)
    public List<DirectoryDto> getSubDirectories(Long parentId) {
        log.debug("하위 디렉토리 조회 시작 - parentId: {}", parentId);
        Directory parent = directoryRepository.findById(parentId)
            .orElseThrow(() -> new IllegalArgumentException("Parent directory not found with id: " + parentId));
        List<Directory> directories = directoryRepository.findByParent_IdOrderBySortOrderAsc(parentId);
        log.debug("하위 디렉토리 조회 완료 - 조회된 디렉토리 수: {}", directories.size());
        return directories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * 디렉토리를 생성하는 메소드
     * 
     * @param name 디렉토리 이름
     * @param parentId 부모 디렉토리 ID (null인 경우 루트 디렉토리)
     * @return 생성된 디렉토리 정보
     */
    @Transactional
    public DirectoryDto createDirectory(String name, Long parentId) {
        log.debug("디렉토리 생성 - 이름: {}, 부모 ID: {}", name, parentId);
        
        Directory parent = null;
        if (parentId != null) {
            parent = directoryRepository.findById(parentId)
                    .orElseThrow(() -> new IllegalArgumentException("Parent directory not found with id: " + parentId));
        }
        
        // 정렬 순서 설정: 같은 부모를 가진 디렉토리 중 가장 마지막 순서 + 1
        int sortOrder = 1;
        if (parentId != null) {
            sortOrder = directoryRepository.findTopByParent_IdOrderBySortOrderDesc(parentId)
                    .map(d -> d.getSortOrder() + 1)
                    .orElse(1);
        } else {
            sortOrder = directoryRepository.findTopByParentIsNullOrderBySortOrderDesc()
                    .map(d -> d.getSortOrder() + 1)
                    .orElse(1);
        }
        
        Directory directory = new Directory(name, parent, sortOrder);
        Directory savedDirectory = directoryRepository.save(directory);
        return convertToDTO(savedDirectory);
    }

    /**
     * Directory 엔티티를 DirectoryDto로 변환하는 메소드
     * 
     * @param directory 변환할 Directory 엔티티
     * @return 변환된 DirectoryDto
     */
    private DirectoryDto convertToDTO(Directory directory) {
        // 직접 필드 접근
        DirectoryDto dto = new DirectoryDto();
        dto.id = directory.getId();
        dto.name = directory.getName();
        dto.parentId = directory.getParent() != null ? directory.getParent().getId() : null;
        dto.sortOrder = directory.getSortOrder();
        dto.hasChildren = directoryRepository.hasChildren(directory.getId());
        return dto;
    }

    /**
     * 디렉토리 이름을 업데이트하는 메소드
     * 
     * @param id 업데이트할 디렉토리 ID
     * @param directoryDto 업데이트할 디렉토리 정보
     * @return 업데이트된 디렉토리 정보
     * @throws RuntimeException 디렉토리가 존재하지 않는 경우
     */
    @Transactional
    public DirectoryDto updateDirectory(Long id, DirectoryDto directoryDto) {
        return directoryRepository.findById(id)
                .map(directory -> {
                    directory.setName(directoryDto.name);
                    return convertToDTO(directoryRepository.save(directory));
                })
                .orElseThrow(() -> new RuntimeException("디렉토리를 찾을 수 없습니다: " + id));
    }

    /**
     * 디렉토리를 이동하는 메소드
     * 
     * @param id 이동할 디렉토리 ID
     * @param newParentId 새로운 부모 디렉토리 ID (null인 경우 루트로 이동)
     * @param newPosition 새로운 위치 (정렬 순서)
     * @return 이동된 디렉토리 정보
     */
    @Transactional
    public DirectoryDto moveDirectory(Long id, Long newParentId, Integer newPosition) {
        log.debug("디렉토리 이동 - ID: {}, 새 부모 ID: {}, 새 위치: {}", id, newParentId, newPosition);
        
        Directory directory = directoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Directory not found with id: " + id));
        
        Directory newParent = null;
        if (newParentId != null) {
            // 새 부모 디렉토리가 존재하지 않을 경우 자동 생성
            try {
                newParent = directoryRepository.findById(newParentId)
                        .orElse(null);
                
                if (newParent == null) {
                    log.info("새 부모 디렉토리가 존재하지 않아 자동 생성합니다. ID: {}", newParentId);
                    // 임시 디렉토리 생성
                    newParent = new Directory("임시 디렉토리 " + newParentId, null, 1);
                    newParent.setPath("/임시/" + newParentId);
                    newParent = directoryRepository.save(newParent);
                    log.info("새 부모 디렉토리 생성 완료. 이름: {}", newParent.getName());
                }
            } catch (Exception e) {
                log.error("부모 디렉토리 생성 중 오류 발생", e);
                // 실패 시 null로 설정 (루트로 이동)
                newParent = null;
                newParentId = null;
            }
        }
        
        directory.setParent(newParent);
        directory.setSortOrder(newPosition);
        Directory savedDirectory = directoryRepository.save(directory);
        
        return convertToDTO(savedDirectory);
    }

    /**
     * 디렉토리 순서를 업데이트하는 메소드
     * 
     * @param orderList 업데이트할 디렉토리 순서 목록
     */
    @Transactional
    public void updateDirectoryOrder(List<DirectoryOrderDto> orderList) {
        log.debug("디렉토리 순서 업데이트 - 항목 수: {}", orderList.size());
        
        for (DirectoryOrderDto orderDto : orderList) {
            directoryRepository.findById(orderDto.getId())
                    .ifPresent(directory -> {
                        directory.setSortOrder(orderDto.getSortOrder());
                        directoryRepository.save(directory);
                    });
        }
    }

    /**
     * 디렉토리를 삭제하는 메소드
     * 
     * @param id 삭제할 디렉토리 ID
     * @throws IllegalArgumentException 디렉토리가 존재하지 않는 경우
     */
    @Transactional
    public void deleteDirectory(Long id) {
        log.debug("디렉토리 삭제 시작 - ID: {}", id);
        
        Directory directory = directoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Directory not found with id: " + id));
        
        // 하위 디렉토리가 있는지 확인
        List<Directory> children = directoryRepository.findByParent_IdOrderBySortOrderAsc(id);
        if (!children.isEmpty()) {
            log.debug("하위 디렉토리가 있어 재귀적으로 삭제 - 하위 디렉토리 수: {}", children.size());
            for (Directory child : children) {
                deleteDirectory(child.getId());
            }
        }
        
        // 부모 디렉토리에서 제거
        Directory parent = directory.getParent();
        if (parent != null) {
            parent.getChildren().remove(directory);
            directoryRepository.save(parent);
            log.debug("부모 디렉토리에서 제거됨 - 부모 ID: {}", parent.getId());
        }
        
        // 디렉토리 삭제
        directoryRepository.delete(directory);
        log.debug("디렉토리 삭제 완료 - ID: {}", id);
    }
}