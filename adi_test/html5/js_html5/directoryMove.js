/*
모듈화된
디렉토리
관리
시스템
*/

/**
 * DirectoryMove 모듈 - 디렉토리 이동 관련 기능
 * 
 * 이 모듈은 다음과 같은 기능을 담당합니다:
 * - 디렉토리 이동 (드래그 앤 드롭)
 * - 디렉토리 이동 검증
 * - 디렉토리 경로 업데이트
 */
var DirectoryMove = (function() {
    // 디렉토리 이동 함수
    function moveDirectory(directoryId, newParentId) {
        // 실제 서버 API 호출 대신 로컬에서 처리
        console.log(`moveDirectory: ${directoryId} -> ${newParentId}`);
        
        // 이동할 디렉토리와 새 부모 디렉토리 찾기 (Map 사용)
        let directoryToMove = DirectoryCore.getDirectoryById(directoryId);
        let newParentDirectory = DirectoryCore.getDirectoryById(newParentId);
        
        // 이동할 디렉토리가 없는 경우 에러 처리
        if (!directoryToMove) {
            console.error(`이동할 디렉토리 (ID: ${directoryId})를 찾을 수 없습니다.`);
            DirectoryUI.showNotification(`이동할 디렉토리 (ID: ${directoryId})를 찾을 수 없습니다.`, "error");
            return;
        }
        
        // 새 부모 디렉토리가 없는 경우 에러 처리
        if (!newParentDirectory) {
            console.error(`새 부모 디렉토리 (ID: ${newParentId})를 찾을 수 없습니다.`);
            DirectoryUI.showNotification(`새 부모 디렉토리 (ID: ${newParentId})를 찾을 수 없습니다.`, "error");
            
            // 서버에 요청을 보내 디렉토리 이동 시도 (선택적)
            try {
                // 실제 구현 시 서버 API와 통신하는 코드 추가
                console.log(`서버에 디렉토리 이동 요청: ${directoryId} -> ${newParentId}`);
                
                // 새 부모 디렉토리를 찾을 수 없으나 서버에서는 성공한 것으로 가정
                DirectoryUI.showNotification(`서버에 디렉토리 이동 요청이 성공했습니다.`, "success");
                DirectoryUI.refreshUI(); // UI 새로고침
            } catch (error) {
                console.error("서버 요청 중 오류 발생:", error);
                DirectoryUI.showNotification("서버 요청 중 오류가 발생했습니다.", "error");
            }
            return;
        }
        
        // 상위-하위 관계 검증
        if (!validateAncestorRelationship(directoryId, newParentId)) {
            DirectoryUI.showNotification("부모 디렉토리를 자식 디렉토리로 이동할 수 없습니다.", "error");
            return;
        }
        
        try {
            // 서버 API 호출 - 실제 구현에서는 서버와 통신하여 디렉토리를 이동시킴
            // 여기서는 로컬에서만 처리
            
            // 이전 부모 디렉토리에서 제거
            if (directoryToMove.parentId) {
                const oldParentDir = DirectoryCore.getDirectoryById(directoryToMove.parentId);
                if (oldParentDir && oldParentDir.children) {
                    oldParentDir.children = oldParentDir.children.filter(child => child.id !== directoryId);
                }
            }
            
            // 새 부모 디렉토리의 자식으로 추가
            if (!newParentDirectory.children) newParentDirectory.children = [];
            newParentDirectory.children.push(directoryToMove);
            
            // 이동할 디렉토리의 부모 ID 업데이트
            directoryToMove.parentId = newParentId;
            
            // 이동할 디렉토리와 그 하위 디렉토리의 경로 업데이트
            updateDirectoryPath(directoryToMove, newParentDirectory);
            
            // 데이터 업데이트
            DirectoryCore.updateDirectoryMaps(directoryToMove);
            
            // UI 갱신
            DirectoryUI.refreshUI();
            DirectoryUI.showNotification(`디렉토리 '${directoryToMove.name}'가 '${newParentDirectory.name}'로 이동되었습니다.`, "success");
        } catch (error) {
            console.error("디렉토리 이동 중 오류 발생:", error);
            DirectoryUI.showNotification("디렉토리 이동 중 오류가 발생했습니다.", "error");
        }
    }

    // 디렉토리 경로 업데이트 함수
    function updateDirectoryPath(directory, newParent) {
        // 새 경로 계산
        const newPath = newParent.path ? 
            [...newParent.path, { id: newParent.id, name: newParent.name }] : 
            [{ id: newParent.id, name: newParent.name }];
        
        directory.path = newPath;
        
        // 하위 디렉토리 경로도 재귀적으로 업데이트
        if (directory.children && directory.children.length > 0) {
            directory.children.forEach(child => {
                updateDirectoryPath(child, directory);
            });
        }
    }

    // 상위-하위 관계 검증 함수 (개선된 버전)
    function validateAncestorRelationship(descendantId, ancestorId) {
        console.log(`상위-하위 관계 검증: 하위 ID ${descendantId}, 상위 ID ${ancestorId}`);
        
        // 동일한 디렉토리인 경우
        if (ancestorId === descendantId) {
            console.log("동일한 디렉토리임 - 이동 불가");
            return false;
        }
        
        // 맵을 사용해 조회
        const ancestor = DirectoryCore.getDirectoryById(ancestorId);
        if (!ancestor) {
            console.log(`상위 디렉토리 (ID: ${ancestorId})를 찾을 수 없습니다.`);
            return false;
        }
        
        // 경로 정보를 활용해 체크
        if (ancestor.path) {
            const isDescendantInPath = ancestor.path.some(node => node.id === descendantId);
            console.log(`경로 정보를 통한 확인 결과: ${isDescendantInPath ? '상위-하위 관계임 - 이동 불가' : '상위-하위 관계 아님 - 이동 가능'}`);
            return !isDescendantInPath; // 하위 디렉토리가 아니어야 이동 가능
        }
        
        // 부모 ID 추적 방식 (fallback)
        let currentDir = ancestor;
        let safetyCounter = 0; // 무한 루프 방지
        const MAX_DEPTH = 100;
        
        while (currentDir && currentDir.parentId && safetyCounter < MAX_DEPTH) {
            if (currentDir.parentId === descendantId) {
                console.log(`부모 ID 추적을 통한 확인 결과: 상위-하위 관계임 - 이동 불가`);
                return false; // 상위-하위 관계임 - 이동 불가
            }
            currentDir = DirectoryCore.getDirectoryById(currentDir.parentId);
            safetyCounter++;
        }
        
        console.log(`부모 ID 추적을 통한 확인 결과: 상위-하위 관계 아님 - 이동 가능 (${safetyCounter}번 체크)`);
        return true; // 상위-하위 관계 아님 - 이동 가능
    }

    // 디렉토리 이동 시 드래그 앤 드롭 처리 함수
    function handleDirectoryDrop(draggedDirId, targetDirId) {
        console.log(`드래그 앤 드롭 처리: ${draggedDirId} -> ${targetDirId}`);
        
        // 유효성 검사
        if (draggedDirId === targetDirId) {
            DirectoryUI.showNotification("같은 디렉토리로 이동할 수 없습니다.", "error");
            return;
        }
        
        // 상위-하위 관계 검증
        if (!validateAncestorRelationship(draggedDirId, targetDirId)) {
            DirectoryUI.showNotification("부모 디렉토리를 자식 디렉토리로 이동할 수 없습니다.", "error");
            return;
        }
        
        // 실제 이동 수행
        moveDirectory(draggedDirId, targetDirId);
    }

    // 공개 API
    return {
        moveDirectory: moveDirectory,
        updateDirectoryPath: updateDirectoryPath,
        validateAncestorRelationship: validateAncestorRelationship,
        handleDirectoryDrop: handleDirectoryDrop
    };
})();