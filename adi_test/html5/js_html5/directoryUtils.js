/*
모듈화된
디렉토리
관리
시스템
*/

/**
 * DirectoryUtils 모듈 - 디렉토리 유틸리티 함수
 * 
 * 이 모듈은 다음과 같은 기능을 담당합니다:
 * - 디렉토리 추가, 삭제 등의 CRUD 작업
 * - 디렉토리 데이터 관리 유틸리티
 * - 기타 유틸리티 함수
 */
var DirectoryUtils = (function() {
    // 디렉토리 추가 함수
    function addNewDirectory() {
        // 폼 데이터 가져오기
        const newDirName = document.getElementById('newDirectoryName').value.trim();
        const parentId = document.getElementById('parentDirectoryId').value;
        
        if (!newDirName) {
            console.error("디렉토리 이름이 비어 있습니다.");
            DirectoryUI.showNotification("디렉토리 이름을 입력해주세요.", "error");
            return;
        }
        
        console.log(`새 디렉토리 추가: 이름 '${newDirName}', 부모 ID ${parentId}`);
        
        try {
            // 부모 디렉토리 가져오기
            const parentDir = DirectoryCore.getDirectoryById(parentId);
            if (!parentDir) {
                console.error(`ID가 ${parentId}인 부모 디렉토리를 찾을 수 없습니다.`);
                DirectoryUI.showNotification("부모 디렉토리를 찾을 수 없습니다.", "error");
                return;
            }
            
            // 새 디렉토리 ID 생성
            const newDirId = generateDirectoryId();
            
            // 새 디렉토리 객체 생성
            const newDir = {
                id: newDirId,
                name: newDirName,
                parentId: parentId,
                children: [],
                path: [...parentDir.path, { id: newDirId, name: newDirName }]
            };
            
            // 부모 디렉토리의 children 배열에 새 디렉토리 추가
            if (!parentDir.children) parentDir.children = [];
            parentDir.children.push(newDir);
            
            // 데이터 맵 업데이트
            const directoryData = DirectoryCore.getData();
            directoryData[newDirId] = newDir;
            DirectoryCore.updateDirectoryMaps(newDir);
            
            // 모달 닫기
            DirectoryUI.closeModal('addDirectoryModal');
            
            // UI 갱신
            DirectoryUI.refreshUI();
            
            // 알림 표시
            DirectoryUI.showNotification(`디렉토리 '${newDirName}'이(가) 생성되었습니다.`, "success");
        } catch (error) {
            console.error("디렉토리 추가 중 오류 발생:", error);
            DirectoryUI.showNotification("디렉토리 추가 중 오류가 발생했습니다.", "error");
        }
    }

    // 루트 디렉토리 추가 함수
    function addNewRootDirectory() {
        // 폼 데이터 가져오기
        const newDirName = document.getElementById('newRootDirectoryName').value.trim();
        
        if (!newDirName) {
            console.error("디렉토리 이름이 비어 있습니다.");
            DirectoryUI.showNotification("디렉토리 이름을 입력해주세요.", "error");
            return;
        }
        
        console.log(`새 루트 디렉토리 추가: 이름 '${newDirName}'`);
        
        try {
            // 새 디렉토리 ID 생성
            const newDirId = generateDirectoryId();
            
            // 새 디렉토리 객체 생성
            const newDir = {
                id: newDirId,
                name: newDirName,
                parentId: null,
                children: [],
                path: [{ id: newDirId, name: newDirName }]
            };
            
            // 데이터 맵 업데이트
            const directoryData = DirectoryCore.getData();
            directoryData[newDirId] = newDir;
            DirectoryCore.updateDirectoryMaps(newDir);
            
            // 모달 닫기
            DirectoryUI.closeModal('addRootDirectoryModal');
            
            // UI 갱신
            DirectoryUI.refreshUI();
            
            // 알림 표시
            DirectoryUI.showNotification(`루트 디렉토리 '${newDirName}'이(가) 생성되었습니다.`, "success");
        } catch (error) {
            console.error("루트 디렉토리 추가 중 오류 발생:", error);
            DirectoryUI.showNotification("루트 디렉토리 추가 중 오류가 발생했습니다.", "error");
        }
    }

    // 디렉토리 삭제 함수
    function deleteDirectory(id) {
        console.log(`deleteDirectory(${id}) 함수가 호출되었습니다.`);
        if (confirm('정말로 이 디렉토리를 삭제하시겠습니까? 하위 디렉토리도 모두 삭제됩니다.')) {
            console.log(`디렉토리 삭제: ${id}`);
            
            try {
                // 디렉토리 객체 조회
                const directoryToDelete = DirectoryCore.getDirectoryById(id);
                if (!directoryToDelete) {
                    console.error(`ID가 ${id}인 디렉토리를 찾을 수 없습니다.`);
                    DirectoryUI.showNotification(`ID가 ${id}인 디렉토리를 찾을 수 없습니다.`, "error");
                    return;
                }
                
                const nodeName = directoryToDelete.name;
                
                // UI에서 노드 제거
                const nodeToRemove = document.querySelector(`.tree-node[data-id="${id}"]`);
                if (nodeToRemove) {
                    // 하위 디렉토리가 있는 경우, 함께 제거
                    const childrenContainer = nodeToRemove.querySelector('.tree-children');
                    if (childrenContainer) {
                        // 하위 디렉토리들도 재귀적으로 데이터에서 제거
                        removeChildrenFromData(directoryToDelete);
                        
                        // UI에서 제거
                        nodeToRemove.removeChild(childrenContainer);
                        console.log(`노드 ${id}의 하위 항목을 제거했습니다.`);
                    }
                    
                    // 노드 제거
                    nodeToRemove.parentNode.removeChild(nodeToRemove);
                    console.log(`노드 ${id}를 제거했습니다.`);
                }
                
                // 부모 객체에서 제거
                if (directoryToDelete.parentId) {
                    const parentDir = DirectoryCore.getDirectoryById(directoryToDelete.parentId);
                    if (parentDir && parentDir.children) {
                        parentDir.children = parentDir.children.filter(child => child.id !== id);
                    }
                }
                
                // 맵에서 제거
                const directoryIdMap = DirectoryCore.getIdMap();
                const directoryPathMap = DirectoryCore.getPathMap();
                const directoryData = DirectoryCore.getData();
                
                directoryIdMap.delete(id);
                
                // 경로 맵에서 제거
                if (directoryToDelete.path) {
                    const pathString = directoryToDelete.path.map(p => p.name).join('/');
                    directoryPathMap.delete(pathString);
                }
                
                // 데이터에서 제거
                delete directoryData[id];
                
                // 알림 메시지 표시
                DirectoryUI.showNotification(`디렉토리 '${nodeName}'이(가) 삭제되었습니다.`);
            } catch (error) {
                console.error("디렉토리 삭제 중 오류 발생:", error);
                DirectoryUI.showNotification("디렉토리 삭제 중 오류가 발생했습니다.", "error");
            }
        } else {
            console.log(`디렉토리 ${id} 삭제가 취소되었습니다.`);
        }
    }

    // 하위 디렉토리들을 데이터와 맵에서 제거하는 함수
    function removeChildrenFromData(directory) {
        if (!directory.children || directory.children.length === 0) return;
        
        const directoryIdMap = DirectoryCore.getIdMap();
        const directoryPathMap = DirectoryCore.getPathMap();
        const directoryData = DirectoryCore.getData();
        
        directory.children.forEach(child => {
            // 재귀적으로 하위 항목도 제거
            removeChildrenFromData(child);
            
            // 맵에서 제거
            directoryIdMap.delete(child.id);
            
            // 경로 맵에서 제거
            if (child.path) {
                const pathString = child.path.map(p => p.name).join('/');
                directoryPathMap.delete(pathString);
            }
            
            // 데이터에서 제거
            delete directoryData[child.id];
        });
    }

    // 고유한 디렉토리 ID 생성
    function generateDirectoryId() {
        return Date.now().toString() + Math.floor(Math.random() * 1000);
    }

    // 맵 초기화 후 UI 새로고침 함수
    function resetAndRefresh() {
        console.log("맵 데이터 초기화 및 UI 새로고침");
        
        // 현재 확장 상태 맵을 백업 (옵션)
        // const expandedStateBackup = new Map(DirectoryUI.getExpandedStateMap());
        
        // 샘플 데이터 로드
        DirectoryCore.loadSampleData();
        
        // UI 업데이트
        DirectoryCore.setCurrentPath([]);
        DirectoryUI.updatePathNavigation();
        
        // 트리 새로고침
        const treeElement = document.getElementById('tree');
        if (treeElement) {
            treeElement.innerHTML = '';
            const idMap = DirectoryCore.getIdMap();
            const rootDirs = Array.from(idMap.values())
                .filter(dir => !dir.parentId);
            DirectoryUI.renderTree(rootDirs, treeElement, null);
            DirectoryEvents.setupTreeEventListeners();
        }
        
        // 확장 상태 유지를 원하는 경우 백업에서 복원 (디렉토리 리셋이므로 확장 상태도 초기화)
        // 특정 디렉토리는 항상 펼쳐진 상태로 설정 가능 (예: rootDirs의 첫 번째 항목)
        // const rootDir = rootDirs[0];
        // if (rootDir) {
        //     DirectoryUI.getExpandedStateMap().set(rootDir.id, true);
        //     const rootElement = document.querySelector(`.tree-node[data-id="${rootDir.id}"]`);
        //     if (rootElement) {
        //         DirectoryUI.toggleNode(rootDir.id);
        //     }
        // }
        
        DirectoryUI.showNotification("디렉토리 구조가 초기화되었습니다.", "success");
        return true;
    }

    // 공개 API
    return {
        addNewDirectory: addNewDirectory,
        addNewRootDirectory: addNewRootDirectory,
        deleteDirectory: deleteDirectory,
        resetAndRefresh: resetAndRefresh
    };
})();
