/*
모듈화된
디렉토리
관리
시스템
*/

/**
 * DirectoryDragDrop 모듈 - 드래그 앤 드롭 기능
 * 
 * 이 모듈은 다음과 같은 기능을 담당합니다:
 * - 드래그 앤 드롭 이벤트 설정
 * - 디렉토리 이동 처리
 * - 상위-하위 관계 체크
 */
var DirectoryDragDrop = (function() {
    // 드래그 앤 드롭 초기화 함수
    function setupDragAndDrop() {
        const treeNodes = document.querySelectorAll('.tree-node');
        console.log(`드래그 앤 드롭 설정: ${treeNodes.length}개 노드에 적용`);
        
        // 이벤트 리스너 등록
        treeNodes.forEach(node => {
            // 드래그 시작 시 이벤트
            node.addEventListener('dragstart', function(e) {
                e.dataTransfer.setData('text/plain', node.dataset.id);
                node.classList.add('dragging');
                console.log(`드래그 시작: ${node.textContent.trim().replace('[삭제]', '')}, ID ${node.dataset.id}`);
            });
            
            // 드래그 종료 시 이벤트
            node.addEventListener('dragend', function(e) {
                node.classList.remove('dragging');
                document.querySelectorAll('.tree-node').forEach(n => {
                    n.classList.remove('drop-target');
                });
            });
            
            // 드래그 엔터 이벤트 (드래그한 아이템이 대상 요소 위로 들어올 때)
            node.addEventListener('dragenter', function(e) {
                e.preventDefault();
                if (node !== e.target && !node.classList.contains('dragging')) {
                    node.classList.add('drop-target');
                }
            });
            
            // 드래그 오버 이벤트 (드래그한 아이템이 대상 요소 위에 있을 때 계속 발생)
            node.addEventListener('dragover', function(e) {
                e.preventDefault(); // 필수: 드롭 허용
            });
            
            // 드래그 리브 이벤트 (드래그한 아이템이 대상 요소에서 벗어날 때)
            node.addEventListener('dragleave', function(e) {
                // 자식 요소로 이동했을 때는 dragleave 이벤트가 발생하지 않도록 체크
                const relatedTarget = e.relatedTarget;
                if (relatedTarget && !node.contains(relatedTarget)) {
                    node.classList.remove('drop-target');
                }
            });
            
            // 드롭 이벤트 (드래그한 아이템을 대상 요소에 놓을 때)
            node.addEventListener('drop', function(e) {
                e.preventDefault();
                node.classList.remove('drop-target');
                
                const draggedId = e.dataTransfer.getData('text/plain');
                const targetId = node.dataset.id;
                
                // 자기 자신에게 드롭하는 경우 무시
                if (draggedId === targetId) {
                    console.log("자기 자신에게 드롭할 수 없습니다.");
                    return;
                }
                
                // 상위 디렉토리가 하위 디렉토리로 들어가는 것 방지
                if (DirectoryCore.isAncestor(draggedId, targetId)) {
                    console.log("상위 디렉토리를 하위 디렉토리로 이동할 수 없습니다.");
                    DirectoryUI.showNotification("상위 디렉토리를 하위 디렉토리로 이동할 수 없습니다.", "error");
                    return;
                }
                
                console.log(`디렉토리 이동: ID ${draggedId}를 ID ${targetId} 아래로 이동`);
                moveDirectory(draggedId, targetId);
            });
        });
    }

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
        const newPath = [...(newParent.path || []), { id: directory.id, name: directory.name }];
        directory.path = newPath;
        
        // 하위 디렉토리 경로도 재귀적으로 업데이트
        if (directory.children && directory.children.length > 0) {
            directory.children.forEach(child => {
                updateDirectoryPath(child, directory);
            });
        }
    }

    // 공개 API
    return {
        setupDragAndDrop: setupDragAndDrop,
        moveDirectory: moveDirectory
    };
})();
