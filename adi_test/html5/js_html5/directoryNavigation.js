/*
모듈화된
디렉토리
관리
시스템
*/

/**
 * DirectoryNavigation 모듈 - 디렉토리 탐색 및 이동 기능
 * 
 * 이 모듈은 다음과 같은 기능을 담당합니다:
 * - 특정 디렉토리로 이동
 * - 상위 디렉토리로 이동
 * - 디렉토리 더블클릭 처리
 */
var DirectoryNavigation = (function() {
    // 특정 디렉토리로 이동하는 함수
    function navigateToDirectory(directoryId, path = null) {
        console.log(`디렉토리 이동: ID ${directoryId || 'root'}`);
        
        // 루트로 이동하는 경우
        if (!directoryId) {
            DirectoryCore.setCurrentPath([]);
            DirectoryUI.updatePathNavigation();
            
            // 트리 요소 업데이트
            const treeElement = document.getElementById('tree');
            if (treeElement) {
                treeElement.innerHTML = '';
                
                // 맵에서 루트 디렉토리들을 가져와서 렌더링
                const idMap = DirectoryCore.getIdMap();
                const rootDirectories = Array.from(idMap.values())
                    .filter(dir => !dir.parentId)
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
                
                console.log(`루트 디렉토리 ${rootDirectories.length}개를 맵에서 가져왔습니다.`);
                DirectoryUI.renderTree(rootDirectories, treeElement, null);
                DirectoryEvents.setupTreeEventListeners();
            }
            
            return;
        }
        
        // ID로 디렉토리 정보 조회 (Map 사용)
        const directory = DirectoryCore.getDirectoryById(directoryId);
        if (!directory) {
            console.error(`ID가 ${directoryId}인 디렉토리를 찾을 수 없습니다.`);
            DirectoryUI.showNotification(`ID가 ${directoryId}인 디렉토리를 찾을 수 없습니다.`, 'error');
            return;
        }
        
        // 경로 설정 (제공된 경로가 없으면 디렉토리의 경로 사용)
        DirectoryCore.setCurrentPath(path || directory.path || []);
        DirectoryUI.updatePathNavigation();
        
        // 트리 요소 업데이트
        const treeElement = document.getElementById('tree');
        if (treeElement) {
            treeElement.innerHTML = '';
            
            // 하위 디렉토리 목록 가져오기 (Map 사용)
            const idMap = DirectoryCore.getIdMap();
            const children = Array.from(idMap.values())
                .filter(dir => dir.parentId === directoryId)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            
            if (children && children.length > 0) {
                console.log(`디렉토리 ID ${directoryId}의 하위 항목 ${children.length}개를 맵에서 가져왔습니다.`);
                DirectoryUI.renderTree(children, treeElement, directoryId);
                DirectoryEvents.setupTreeEventListeners();
            } else {
                console.log(`디렉토리 ID ${directoryId}에 하위 항목이 없습니다.`);
                // 빈 디렉토리 표시
                treeElement.innerHTML = '<div class="empty-dir-message">이 디렉토리는 비어 있습니다.</div>';
            }
        }
    }

    // 디렉토리 더블클릭 시 해당 디렉토리로 이동하는 이벤트 핸들러
    function handleDirectoryDoubleClick(nodeId) {
        console.log(`디렉토리 더블클릭: ID ${nodeId}`);
        
        // ID로 디렉토리 정보 조회 (Map 사용)
        const directory = DirectoryCore.getDirectoryById(nodeId);
        if (!directory) {
            console.error(`ID가 ${nodeId}인 디렉토리를 찾을 수 없습니다.`);
            DirectoryUI.showNotification(`ID가 ${nodeId}인 디렉토리를 찾을 수 없습니다.`, 'error');
            return;
        }
        
        // 하위 항목 확인 (Map 사용)
        const idMap = DirectoryCore.getIdMap();
        const hasChildren = Array.from(idMap.values())
            .some(dir => dir.parentId === nodeId);
        
        // 하위 항목이 있는 경우에만 이동
        if (hasChildren) {
            navigateToDirectory(nodeId);
        } else {
            DirectoryUI.showNotification(`'${directory.name}'는 비어 있는 디렉토리입니다.`, 'info');
        }
    }

    // 상위 디렉토리로 이동하는 함수
    function navigateUp() {
        console.log("상위 디렉토리로 이동합니다.");
        
        const currentPath = DirectoryCore.getCurrentPath();
        
        // 현재 경로가 없으면 (루트에 있으면) 아무 작업도 하지 않음
        if (currentPath.length === 0) {
            DirectoryUI.showNotification("이미 최상위 디렉토리에 있습니다.", "info");
            return;
        }
        
        // 현재 경로의 마지막에서 하나 뺀 디렉토리로 이동
        if (currentPath.length > 1) {
            // 마지막에서 두 번째 항목의 ID 가져오기
            const parentDirId = currentPath[currentPath.length - 2].id;
            // 마지막 항목 제외한 경로로 이동
            navigateToDirectory(parentDirId, currentPath.slice(0, -1));
        } else {
            // 현재 경로에 항목이 하나만 있으면 루트로 이동
            navigateToDirectory(null);
        }
    }

    // 공개 API
    return {
        navigateToDirectory: navigateToDirectory,
        handleDirectoryDoubleClick: handleDirectoryDoubleClick,
        navigateUp: navigateUp
    };
})();
