package com.dropand.controller;

import com.dropand.domain.Directory;
import com.dropand.dto.DirectoryDto;
import com.dropand.dto.DirectoryOrderDto;
import com.dropand.dto.MoveDirectoryRequest;
import com.dropand.dto.CreateDirectoryRequest;
import com.dropand.service.DirectoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 디렉토리 관련 REST API를 처리하는 컨트롤러
 * 
 * 주요 기능:
 * 1. 디렉토리 CRUD API 엔드포인트 제공
 * 2. 디렉토리 트리 구조 조회 API
 * 3. 디렉토리 이동 API
 * 4. 요청/응답 데이터 변환 및 검증
 * 
 * @RestController 어노테이션:
 * - @Controller + @ResponseBody 조합과 동일합니다.
 * - 모든 핸들러 메소드의 반환값을 HTTP 응답 본문으로 자동 변환합니다.
 * - JSON/XML 같은 데이터 형식으로 응답을 반환할 때 사용합니다.
 * 
 * @RequestMapping 어노테이션:
 * - 컨트롤러의 기본 URL 경로를 지정합니다.
 * - 모든 핸들러 메소드의 경로는 이 기본 경로에 상대적입니다.
 * 
 * @CrossOrigin 어노테이션:
 * - CORS(Cross-Origin Resource Sharing) 설정을 제공합니다.
 * - 다른 도메인에서의 API 접근을 허용합니다.
 */

@RestController
@RequestMapping("/api/directories")
@CrossOrigin(
    origins = "*",
    allowedHeaders = "*",
    methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.OPTIONS
    }
)
public class DirectoryController {

    /**
     * 로깅을 위한 Logger 인스턴스
     * 로그 출력 및 디버깅에 사용됩니다.
     */
    private static final Logger log = LoggerFactory.getLogger(DirectoryController.class);
    
    /**
     * 디렉토리 서비스 객체
     * 디렉토리 관련 비즈니스 로직을 처리합니다.
     */
    private final DirectoryService directoryService;

    /**
     * 생성자 주입 방식의 의존성 주입
     * 스프링이 DirectoryService 빈을 자동으로 주입합니다.
     * 
     * @param directoryService 디렉토리 서비스 객체
     */
    public DirectoryController(DirectoryService directoryService) {
        this.directoryService = directoryService;
        log.info("DirectoryController 초기화됨");
    }

    /**
     * 전체 디렉토리 목록을 조회하는 API
     * HTTP GET 요청을 처리합니다.
     * 
     * @GetMapping 어노테이션:
     * - HTTP GET 요청을 이 메소드에 매핑합니다.
     * - produces: 응답의 컨텐츠 타입을 지정합니다(여기서는 JSON).
     * 
     * @return 전체 디렉토리 목록이 포함된 ResponseEntity 객체
     *         - 상태 코드: 200 OK
     *         - 본문: 디렉토리 DTO 목록(JSON 형식)
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<DirectoryDto>> getAllDirectories() {
        log.debug("전체 디렉토리 목록 조회 요청");
        return ResponseEntity.ok(directoryService.getAllDirectories());
    }

    /**
     * 디렉토리 트리 구조를 조회하는 API
     * 
     * @GetMapping 어노테이션:
     * - "/tree" 경로에 대한 GET 요청을 이 메소드에 매핑합니다.
     * 
     * @return 디렉토리 트리 구조가 포함된 ResponseEntity 객체
     */
    @GetMapping(value = "/tree", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<DirectoryDto>> getDirectoryTree() {
        log.debug("디렉토리 트리 조회 요청");
        return ResponseEntity.ok(directoryService.getDirectoryTree());
    }

    /**
     * 특정 부모 디렉토리의 하위 디렉토리 목록을 조회하는 API
     * 
     * @PathVariable 어노테이션:
     * - URL 경로에서 변수 값을 추출합니다.
     * - 여기서는 {parentId} 경로 변수를 매개변수에 바인딩합니다.
     * 
     * @param parentId 부모 디렉토리 ID
     * @return 하위 디렉토리 목록이 포함된 ResponseEntity 객체
     */
    @GetMapping(value = "/{parentId}/children", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<DirectoryDto>> getSubDirectories(@PathVariable Long parentId) {
        log.debug("하위 디렉토리 조회 요청 - 부모 ID: {}", parentId);
        return ResponseEntity.ok(directoryService.getSubDirectories(parentId));
    }

    /**
     * 새로운 디렉토리를 생성하는 API
     * HTTP POST 요청을 처리합니다.
     * 
     * @PostMapping 어노테이션:
     * - HTTP POST 요청을 이 메소드에 매핑합니다.
     * - consumes: 요청의 컨텐츠 타입을 지정합니다(여기서는 JSON).
     * - produces: 응답의 컨텐츠 타입을 지정합니다(여기서는 JSON).
     * 
     * @RequestBody 어노테이션:
     * - HTTP 요청 본문을 자바 객체로 변환합니다.
     * - required=true: 요청 본문이 필수적임을 나타냅니다.
     * 
     * @param request 생성할 디렉토리 정보가 포함된 요청 객체
     * @return 생성된 디렉토리 정보 또는 오류 메시지가 포함된 ResponseEntity 객체
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createDirectory(@RequestBody(required = true) CreateDirectoryRequest request) {
        try {
            log.info("디렉토리 생성 요청 수신 - 요청 데이터: {}", request);
            
            if (request == null) {
                String errorMessage = "요청 본문이 비어있습니다.";
                log.error(errorMessage);
                return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\": \"" + errorMessage + "\"}");
            }
            
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                String errorMessage = "디렉토리 이름은 필수입니다.";
                log.error(errorMessage);
                return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\": \"" + errorMessage + "\"}");
            }

            DirectoryDto directory = directoryService.createDirectory(request.getName().trim(), request.getParentId());
            log.info("디렉토리 생성 성공 - ID: {}, 이름: {}, 부모 ID: {}", 
                directory.getId(), directory.getName(), directory.getParentId());
            
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(directory);
                
        } catch (IllegalArgumentException e) {
            log.error("디렉토리 생성 실패 - 잘못된 요청: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            log.error("디렉토리 생성 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"error\": \"디렉토리 생성에 실패했습니다: " + e.getMessage() + "\"}");
        }
    }

    /**
     * 디렉토리를 삭제하는 API
     * HTTP DELETE 요청을 처리합니다.
     * 
     * @DeleteMapping 어노테이션:
     * - HTTP DELETE 요청을 이 메소드에 매핑합니다.
     * - "/{id}" 경로 패턴은 URL에 포함된 ID 값을 추출합니다.
     * 
     * @PathVariable 어노테이션:
     * - URL 경로에서 변수 값을 추출합니다.
     * 
     * @param id 삭제할 디렉토리의 ID
     * @return 삭제 성공 여부를 나타내는 ResponseEntity 객체
     *         - 상태 코드: 200 OK (성공적으로 삭제됨)
     *         - 본문: 없음(void)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDirectory(@PathVariable Long id) {
        directoryService.deleteDirectory(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 디렉토리를 이동하는 API
     * HTTP POST 요청을 처리합니다.
     * 
     * @PostMapping 어노테이션:
     * - "/{id}/move" 경로에 대한 POST 요청을 이 메소드에 매핑합니다.
     * 
     * @param id 이동할 디렉토리의 ID
     * @param request 이동할 대상 디렉토리의 ID와 정렬 순서 정보가 포함된 요청 객체
     * @return 이동 성공 여부를 나타내는 ResponseEntity 객체
     */
    @PostMapping("/{id}/move")
    public ResponseEntity<Void> moveDirectory(
            @PathVariable Long id,
            @RequestBody MoveDirectoryRequest request) {
        if (request.getSortOrder() == null) {
            List<DirectoryDto> siblings = request.getParentId() == null ?
                directoryService.getDirectoryTree() :
                directoryService.getSubDirectories(request.getParentId());
            
            int maxSortOrder = siblings.stream()
                .mapToInt(DirectoryDto::getSortOrder)
                .max()
                .orElse(0);
            request.setSortOrder(maxSortOrder + 1);
        }
        
        directoryService.moveDirectory(id, request.getParentId(), request.getSortOrder());
        return ResponseEntity.ok().build();
    }

    /**
     * 여러 디렉토리의 순서를 한 번에 업데이트하는 API
     * HTTP PUT 요청을 처리합니다.
     * 
     * @PutMapping 어노테이션:
     * - "/order" 경로에 대한 PUT 요청을 이 메소드에 매핑합니다.
     * 
     * @param orderList 순서를 업데이트할 디렉토리 목록
     * @return 업데이트 성공 여부를 나타내는 ResponseEntity 객체
     */
    @PutMapping("/order")
    public ResponseEntity<Void> updateDirectoryOrder(@RequestBody List<DirectoryOrderDto> orderList) {
        directoryService.updateDirectoryOrder(orderList);
        return ResponseEntity.ok().build();
    }

    /**
     * PUT 메소드를 사용하여 디렉토리를 이동하는 API
     * RESTful API 설계 원칙에 따라 리소스 상태 변경에 PUT을 사용합니다.
     * 
     * @param id 이동할 디렉토리의 ID
     * @param orderDto 이동 정보(부모 ID와 정렬 순서)가 포함된 DTO
     * @return 이동 성공 여부를 나타내는 ResponseEntity 객체
     */
    @PutMapping("/{id}/move")
    public ResponseEntity<Void> moveDirectoryPut(
            @PathVariable Long id,
            @RequestBody DirectoryOrderDto orderDto) {
        orderDto.setId(id);
        directoryService.updateDirectoryOrder(List.of(orderDto));
        return ResponseEntity.ok().build();
    }
} 