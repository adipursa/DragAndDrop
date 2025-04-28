/*
 * directoryManager-01-core.js
 * 디렉토리 관리 통합 모듈 - 01 코어 기능
 * 
 * 이 파일은 기본 변수 정의와 핵심 데이터 관리 함수를 포함합니다.
 */

// 전역 DirectoryManager 객체 정의
var DirectoryManager = (function() {
    //=================================================================
    // 비공개 변수 - 데이터 관리
    //=================================================================
    var directoryData = {};          // ID로 디렉토리 데이터를 빠르게 조회하기 위한 객체
    var directoryIdMap = new Map();  // 디렉토리 ID 관리를 위한 Map
    var directoryPathMap = new Map(); // 경로별 디렉토리 ID 관리를 위한 Map
    var currentPath = [];            // 현재 경로를 저장하는 배열 (디렉토리 이동용)
    var expandedState = {};          // 노드 확장 상태 저장
    var currentParentId = null;      // 현재 부모 디렉토리 ID

    //=================================================================
    // 데이터 관리 함수
    //=================================================================
    
    // 디렉토리 맵 초기화
    function initializeDirectoryMaps() {
        directoryIdMap.clear();
        directoryPathMap.clear();
        directoryData = {};
        // expandedState는 초기화하지 않음 - 상태 유지
        currentPath = [];
        currentParentId = null;
        console.log("디렉토리 맵 초기화됨");
    }

    // 모든 데이터 초기화 (확장 상태 포함)
    function resetAllData() {
        initializeDirectoryMaps();
        expandedState = {};
        console.log("모든 데이터 초기화됨 (확장 상태 포함)");
    }

    // 디렉토리 데이터 처리 및 맵 구성
    function processDirectoryData(data, parentPath = [], parentId = null) {
        data.forEach(item => {
            // 현재 항목의 경로 계산
            const currentPath = [...parentPath, { id: item.id, name: item.name }];
            
            // 부모 ID 설정
            item.parentId = parentId;
            
            // 경로 정보 추가
            item.path = currentPath;
            
            // 전역 데이터에 추가
            directoryData[item.id] = item;
            
            // 맵에 추가
            updateDirectoryMaps(item);
            
            // 자식 항목도 재귀적으로 처리
            if (item.children && item.children.length > 0) {
                processDirectoryData(item.children, currentPath, item.id);
            }
        });
    }

    // ID로 디렉토리 조회
    function getDirectoryById(id) {
        return directoryIdMap.get(id) || null;
    }

    // 경로 문자열로 디렉토리 ID 조회
    function getDirectoryIdByPath(pathString) {
        return directoryPathMap.get(pathString) || null;
    }

    // 디렉토리 맵 업데이트
    function updateDirectoryMaps(directory) {
        // ID 맵 업데이트
        directoryIdMap.set(directory.id, directory);
        
        // 경로 맵 업데이트 (경로 문자열로 변환)
        if (directory.path) {
            const pathString = directory.path.map(p => p.name).join('/');
            directoryPathMap.set(pathString, directory.id);
        }
        
        console.log(`디렉토리 맵 업데이트됨 - ID: ${directory.id}`);
    }

    // 디렉토리 ID 체크 및 유효성 검증
    function isValidDirectoryId(id) {
        return directoryIdMap.has(id) || directoryData[id] !== undefined;
    }

    // 상위-하위 관계 체크 (개선된 버전)
    function isAncestor(ancestorId, descendantId) {
        console.log(`상위-하위 관계 체크: 상위 ID ${ancestorId}, 하위 ID ${descendantId}`);
    
        // 맵을 사용해 조회
        const descendant = getDirectoryById(descendantId);
        if (!descendant) {
            console.log(`하위 디렉토리 (ID: ${descendantId})를 찾을 수 없습니다.`);
            return false;
        }
        
        // 경로 정보를 활용해 체크
        if (descendant.path) {
            const isAncestorInPath = descendant.path.some(node => node.id === ancestorId);
            console.log(`경로 정보를 통한 확인 결과: ${isAncestorInPath ? '상위 디렉토리임' : '상위 디렉토리 아님'}`);
            return isAncestorInPath;
        }
        
        // 기존 방식 (fallback)
        let currentDir = descendant;
        let safetyCounter = 0; // 무한 루프 방지
        const MAX_DEPTH = 100;
        
        while (currentDir && currentDir.parentId && safetyCounter < MAX_DEPTH) {
            if (currentDir.parentId === ancestorId) {
                console.log(`부모 ID 추적을 통한 확인 결과: 상위 디렉토리임`);
                return true;
            }
            currentDir = getDirectoryById(currentDir.parentId);
            safetyCounter++;
        }
        
        console.log(`부모 ID 추적을 통한 확인 결과: 상위 디렉토리 아님 (${safetyCounter}번 체크)`);
        return false;
    }

    // 샘플 데이터 로드
    function loadSampleData() {
        var sampleData = [
            {
                id: "1",
                name: "루트 디렉토리 1",
                children: [
                    {
                        id: "2",
                        name: "하위 디렉토리 1-1",
                        children: []
                    },
                    {
                        id: "3",
                        name: "하위 디렉토리 1-2",
                        children: []
                    }
                ]
            },
            {
                id: "4",
                name: "루트 디렉토리 2",
                children: []
            }
        ];
        
        initializeDirectoryMaps();
        processDirectoryData(sampleData);
        
        return sampleData;
    }

    // 맵 데이터 상태 출력 및 확인 함수 (디버깅용)
    function debugMaps() {
        console.log("======= 디렉토리 맵 디버그 정보 =======");
        console.log(`directoryData 크기: ${Object.keys(directoryData).length}개 항목`);
        console.log(`directoryIdMap 크기: ${directoryIdMap.size}개 항목`);
        console.log(`directoryPathMap 크기: ${directoryPathMap.size}개 항목`);
        
        console.log("\n## directoryIdMap 내용:");
        directoryIdMap.forEach((value, key) => {
            console.log(`  - ID: ${key}, 이름: ${value.name}, 부모: ${value.parentId || 'root'}`);
        });
        
        console.log("\n## directoryPathMap 내용:");
        directoryPathMap.forEach((value, key) => {
            console.log(`  - 경로: ${key}, 연결 ID: ${value}`);
        });
        
        console.log("\n## 상위-하위 구조 분석:");
        // 각 디렉토리의 하위 항목 수 계산
        const childCountMap = new Map();
        directoryIdMap.forEach((dir) => {
            const parentId = dir.parentId;
            if (parentId) {
                childCountMap.set(parentId, (childCountMap.get(parentId) || 0) + 1);
            }
        });
        
        // 결과 출력
        childCountMap.forEach((count, parentId) => {
            const parentDir = directoryIdMap.get(parentId);
            if (parentDir) {
                console.log(`  - '${parentDir.name}' (ID: ${parentId})의 하위 항목 수: ${count}개`);
            } else {
                console.log(`  - 알 수 없는 부모 ID ${parentId}의 하위 항목 수: ${count}개`);
            }
        });
        
        console.log("======================================");
        return true;
    }

    // 외부로 노출할 API (실제 반환 코드는 다른 파일에서 정의)
    return {
        // 데이터 관리
        initializeDirectoryMaps: initializeDirectoryMaps,
        resetAllData: resetAllData,
        processDirectoryData: processDirectoryData,
        updateDirectoryMaps: updateDirectoryMaps,
        getDirectoryById: getDirectoryById,
        getDirectoryIdByPath: getDirectoryIdByPath,
        isValidDirectoryId: isValidDirectoryId,
        isAncestor: isAncestor,
        loadSampleData: loadSampleData,
        debugMaps: debugMaps,
        
        // 데이터 접근
        getData: function() { return directoryData; },
        getIdMap: function() { return directoryIdMap; },
        getPathMap: function() { return directoryPathMap; },
        getCurrentPath: function() { return currentPath; },
        setCurrentPath: function(path) { currentPath = path; },
        getExpandedState: function() { return expandedState; },
        setExpandedState: function(id, state) { expandedState[id] = state; },
        
        // 다른 파일에서 확장
    };
})(); 