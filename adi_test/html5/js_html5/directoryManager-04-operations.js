/*
 * directoryManager-04-operations.js
 * 디렉토리 관리 통합 모듈 - 04 디렉토리 조작 함수
 * 
 * 이 파일은 디렉토리 추가, 삭제, 이동 등의 조작 함수를 포함합니다.
 */

// 디렉토리 조작 함수를 DirectoryManager 객체에 추가
(function() {
    // 새 디렉토리 추가
    function addNewDirectory() {
        // 필요한 값 가져오기
        const parentId = document.getElementById('parentDirectoryId').value;
        const newDirName = document.getElementById('newDirectoryName').value.trim();
        
        // 유효성 검사
        if (!newDirName) {
            DirectoryManager.showNotification('디렉토리 이름을 입력해주세요.', 'error');
            return;
        }
        
        // 부모 디렉토리가 유효한지 확인
        if (!DirectoryManager.isValidDirectoryId(parentId)) {
            DirectoryManager.showNotification('유효하지 않은 부모 디렉토리입니다.', 'error');
            return;
        }
        
        // 새 디렉토리 ID 생성 (임시 방식)
        const newId = Date.now().toString();
        
        // 부모 디렉토리 가져오기
        const parentDir = DirectoryManager.getDirectoryById(parentId);
        
        // 경로 계산
        const newPath = parentDir ? [...(parentDir.path || []), { id: newId, name: newDirName }] : [{ id: newId, name: newDirName }];
        
        // 새 디렉토리 객체 생성
        const newDir = {
            id: newId,
            name: newDirName,
            parentId: parentId,
            path: newPath,
            children: []
        };
        
        // 부모 디렉토리의 children 배열에 추가
        if (parentDir && Array.isArray(parentDir.children)) {
            parentDir.children.push(newDir);
        }
        
        // 데이터 저장소에 추가
        DirectoryManager.getData()[newId] = newDir;
        
        // 맵에 추가
        DirectoryManager.updateDirectoryMaps(newDir);
        
        // 모달 닫기
        DirectoryManager.closeModal('addDirectoryModal');
        
        // 부모 디렉토리를 펼친 상태로 설정
        DirectoryManager.setExpandedState(parentId, true);
        
        // UI 갱신
        refreshUI();
        
        // 새로 추가된 디렉토리로 스크롤
        setTimeout(() => {
            const newElement = document.querySelector(`.tree-node[data-id="${newId}"]`);
            if (newElement) {
                newElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // 잠시 강조 효과 주기
                newElement.style.backgroundColor = '#e3f2fd';
                setTimeout(() => {
                    newElement.style.backgroundColor = '';
                }, 1500);
            }
        }, 100);
        
        // 성공 메시지 표시
        DirectoryManager.showNotification(`'${newDirName}' 디렉토리가 추가되었습니다.`, 'success');
    }

    // 새 루트 디렉토리 추가
    function addNewRootDirectory() {
        // 필요한 값 가져오기
        const newDirName = document.getElementById('newRootDirectoryName').value.trim();
        
        // 유효성 검사
        if (!newDirName) {
            DirectoryManager.showNotification('디렉토리 이름을 입력해주세요.', 'error');
            return;
        }
        
        // 새 디렉토리 ID 생성 (임시 방식)
        const newId = Date.now().toString();
        
        // 새 디렉토리 객체 생성
        const newDir = {
            id: newId,
            name: newDirName,
            parentId: null,  // 루트 디렉토리는 부모가 없음
            path: [{ id: newId, name: newDirName }],
            children: []
        };
        
        // 데이터 저장소에 추가
        DirectoryManager.getData()[newId] = newDir;
        
        // 맵에 추가
        DirectoryManager.updateDirectoryMaps(newDir);
        
        // 모달 닫기
        DirectoryManager.closeModal('addRootDirectoryModal');
        
        // UI 갱신
        refreshUI();
        
        // 새로 추가된 디렉토리로 스크롤
        setTimeout(() => {
            const newElement = document.querySelector(`.tree-node[data-id="${newId}"]`);
            if (newElement) {
                newElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // 잠시 강조 효과 주기
                newElement.style.backgroundColor = '#e3f2fd';
                setTimeout(() => {
                    newElement.style.backgroundColor = '';
                }, 1500);
            }
        }, 100);
        
        // 성공 메시지 표시
        DirectoryManager.showNotification(`'${newDirName}' 루트 디렉토리가 추가되었습니다.`, 'success');
    }

    // 디렉토리 삭제
    function deleteDirectory(directoryId) {
        const directoryData = DirectoryManager.getData();
        if (!directoryId || !directoryData[directoryId]) {
            alert("삭제할 디렉토리를 찾을 수 없습니다.");
            return;
        }

        const directory = directoryData[directoryId];
        const hasChildren = directory.children && directory.children.length > 0;
        
        // 삭제 확인
        let confirmMessage = "정말로 이 디렉토리를 삭제하시겠습니까?";
        if (hasChildren) {
            confirmMessage = "이 디렉토리에는 하위 디렉토리가 있습니다. 모든 하위 디렉토리도 함께 삭제됩니다. 계속하시겠습니까?";
        }
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        // 부모 디렉토리 참조 보존
        const parentId = directory.parentId;
        
        // 재귀적으로 디렉토리 삭제
        deleteRecursive(directoryId);
        
        // 부모 디렉토리가 있는 경우 children 배열에서 삭제된 디렉토리 제거
        if (parentId && directoryData[parentId]) {
            const parentDir = directoryData[parentId];
            if (parentDir.children) {
                const index = parentDir.children.indexOf(directoryId);
                if (index !== -1) {
                    parentDir.children.splice(index, 1);
                }
            }
            
            // 부모 디렉토리 선택
            DirectoryManager.displayDirectoryContents(parentId);
            
            // 트리 UI 새로고침
            DirectoryManager.renderTree();
        } else {
            // 루트 디렉토리가 삭제된 경우 다른 루트 디렉토리 찾기
            const roots = Object.values(directoryData).filter(dir => !dir.parentId);
            if (roots.length > 0) {
                DirectoryManager.displayDirectoryContents(roots[0].id);
            } else {
                // 디렉토리가 없는 경우 컨텐츠 영역 비우기
                document.getElementById('content-area').innerHTML = '<p>선택된 디렉토리가 없습니다.</p>';
            }
            
            // 트리 UI 새로고침
            DirectoryManager.renderTree();
        }
        
        // 성공 메시지 표시
        alert("디렉토리가 성공적으로 삭제되었습니다.");
        
        // 모달 닫기
        document.getElementById('deleteDirectoryModal').style.display = 'none';
    }

    // 디렉토리 이동 함수
    function moveDirectory(directoryId, newParentId) {
        console.log(`디렉토리 이동: ID ${directoryId}를 부모 ID ${newParentId}로 이동`);
        
        // 유효성 검증
        if (!DirectoryManager.isValidDirectoryId(directoryId) || !DirectoryManager.isValidDirectoryId(newParentId)) {
            DirectoryManager.showNotification('유효하지 않은 디렉토리 ID입니다.', 'error');
            return;
        }
        
        // 데이터 가져오기
        const directoryToMove = DirectoryManager.getDirectoryById(directoryId);
        const newParentDir = DirectoryManager.getDirectoryById(newParentId);
        
        if (!directoryToMove || !newParentDir) {
            DirectoryManager.showNotification('디렉토리를 찾을 수 없습니다.', 'error');
            return;
        }

        // 이동 전에 현재 확장 상태 저장
        const expandedState = DirectoryManager.getExpandedState();
        
        // 기존 부모에서 이 디렉토리 제거
        if (directoryToMove.parentId) {
            const oldParentDir = DirectoryManager.getDirectoryById(directoryToMove.parentId);
            if (oldParentDir && oldParentDir.children) {
                oldParentDir.children = oldParentDir.children.filter(child => child.id !== directoryId);
            }
        }
        
        // 새 부모 정보 업데이트
        directoryToMove.parentId = newParentId;
        
        // 경로 정보 업데이트
        const newPath = [...newParentDir.path, { id: directoryToMove.id, name: directoryToMove.name }];
        directoryToMove.path = newPath;
        
        // 모든 하위 디렉토리의 경로도 업데이트
        updateChildrenPaths(directoryToMove);
        
        // 새 부모의 children 배열에 추가
        if (!newParentDir.children) {
            newParentDir.children = [];
        }
        newParentDir.children.push(directoryToMove);
        
        // 맵 업데이트
        DirectoryManager.updateDirectoryMaps(directoryToMove);
        
        // 새 부모 노드를 펼치기
        DirectoryManager.setExpandedState(newParentId, true);
        
        // UI 갱신
        refreshUI();
        
        // 알림 표시
        DirectoryManager.showNotification(`'${directoryToMove.name}' 디렉토리를 '${newParentDir.name}'로 이동했습니다.`, 'success');
    }
    
    // 하위 디렉토리의 경로 재귀적 업데이트
    function updateChildrenPaths(directory) {
        // directoryIdMap에서 이 디렉토리의 모든 하위 디렉토리 찾기
        const children = Array.from(DirectoryManager.getIdMap().values())
            .filter(dir => dir.parentId === directory.id);
        
        children.forEach(child => {
            // 경로 업데이트
            child.path = [...directory.path, { id: child.id, name: child.name }];
            
            // 맵 업데이트
            DirectoryManager.updateDirectoryMaps(child);
            
            // 재귀적으로 하위 디렉토리도 처리
            updateChildrenPaths(child);
        });
    }

    // UI 새로고침
    function refreshUI() {
        console.log("UI 새로고침");
        
        // 현재 경로 네비게이션 업데이트
        DirectoryManager.updatePathNavigation();
        
        // 트리 다시 렌더링
        const treeElement = document.getElementById('tree');
        if (treeElement) {
            treeElement.innerHTML = '';
            
            // 루트 디렉토리 가져오기
            const rootDirectories = Array.from(DirectoryManager.getIdMap().values())
                .filter(dir => !dir.parentId)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            
            // 트리 렌더링
            renderTree(rootDirectories, treeElement, null);
            
            // 이벤트 리스너 다시 설정
            DirectoryManager.setupTreeEventListeners();
        }
        
        // 현재 디렉토리 내용 업데이트
        if (DirectoryManager.getCurrentPath().length > 0) {
            const currentPathArray = DirectoryManager.getCurrentPath();
            const currentId = currentPathArray[currentPathArray.length - 1].id;
            DirectoryManager.displayDirectoryContents(currentId);
        } else {
            DirectoryManager.displayDirectoryContents(null);
        }
    }

    // 트리 초기 렌더링 함수
    function renderInitialTree() {
        console.log("초기 트리 렌더링");
        const treeElement = document.getElementById('tree');
        if (!treeElement) return;
        
        treeElement.innerHTML = '';
        
        // 맵 데이터에서 루트 디렉토리 가져오기
        const rootDirectories = Array.from(DirectoryManager.getIdMap().values())
            .filter(dir => !dir.parentId)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
        
        console.log(`루트 디렉토리 ${rootDirectories.length}개를 맵에서 가져왔습니다.`);
        
        // 트리 렌더링 함수 호출
        renderTree(rootDirectories, treeElement, null);
    }

    // 트리 렌더링 함수 (재귀적)
    function renderTree(nodes, parent, parentId) {
        nodes.forEach(node => {
            // 노드 요소 생성
            const nodeElement = document.createElement('div');
            nodeElement.className = 'tree-node';
            nodeElement.dataset.id = node.id;
            nodeElement.dataset.name = node.name;
            nodeElement.dataset.parentId = parentId || '';
            
            // 아이콘과 이름 추가
            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = DirectoryManager.getExpandedState()[node.id] === true;
            const iconClass = hasChildren ? (isExpanded ? 'fa-chevron-down' : 'fa-chevron-right') : 'fa-minus';
            
            nodeElement.innerHTML = `
                <i class="icon fas ${iconClass}"></i>
                <i class="fas fa-folder"></i>
                <span class="node-text">${node.name}</span>
                <button class="add-dir-btn" title="하위 디렉토리 추가"><i class="fas fa-plus"></i></button>
                <button class="delete-btn" title="디렉토리 삭제"><i class="fas fa-trash"></i></button>
            `;
            
            // 하위 항목 컨테이너 추가
            if (hasChildren) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'tree-children';
                childrenContainer.style.display = isExpanded ? 'block' : 'none'; // 이전 상태 기억
                nodeElement.appendChild(childrenContainer);
                
                // 재귀적으로 자식 요소 렌더링
                renderTree(node.children, childrenContainer, node.id);
            }
            
            // 부모 요소에 추가
            parent.appendChild(nodeElement);
            
            // 노드 이벤트 리스너 설정
            DirectoryManager.setupNodeEventListeners(nodeElement);
        });
    }

    // 맵 상태 표시
    function showMapStatus() {
        DirectoryManager.debugMaps();
        DirectoryManager.showNotification(`맵 상태: ${DirectoryManager.getIdMap().size}개 항목, 경로 맵: ${DirectoryManager.getPathMap().size}개 항목`, 'info');
    }

    // 맵 초기화 및 새로고침
    function resetAndRefresh() {
        if (confirm('모든 디렉토리 데이터를 초기화하고 샘플 데이터를 다시 로드하시겠습니까?')) {
            DirectoryManager.resetAllData(); // 모든 데이터 초기화 (확장 상태 포함)
            DirectoryManager.loadSampleData();
            refreshUI();
            DirectoryManager.showNotification('디렉토리 맵이 초기화되었습니다.', 'success');
        }
    }

    // 드래그 앤 드롭 기능 설정
    function setupDragAndDrop() {
        console.log("드래그 앤 드롭 기능 설정");
        
        let draggedElement = null;
        
        // 트리 컨테이너에 이벤트 리스너 추가
        const treeContainer = document.getElementById('tree');
        if (!treeContainer) return;
        
        // 드래그 시작
        treeContainer.addEventListener('dragstart', function(e) {
            if (e.target.classList.contains('tree-node')) {
                draggedElement = e.target;
                e.dataTransfer.setData('text/plain', e.target.dataset.id);
                e.target.classList.add('dragging');
                
                // 반투명하게 표시
                setTimeout(() => {
                    e.target.style.opacity = '0.4';
                }, 0);
            }
        });
        
        // 드래그 종료
        treeContainer.addEventListener('dragend', function(e) {
            if (e.target.classList.contains('tree-node')) {
                e.target.classList.remove('dragging');
                e.target.style.opacity = '1';
                
                // 모든 드랍 대상 강조 제거
                document.querySelectorAll('.drop-target').forEach(el => {
                    el.classList.remove('drop-target');
                });
            }
        });
        
        // 드래그 오버 (드랍 가능 영역 표시)
        treeContainer.addEventListener('dragover', function(e) {
            e.preventDefault(); // 드랍을 허용하기 위해 필요
            
            // 드래그된 요소를 드랍할 대상 찾기
            const dropTarget = getDropTarget(e.target);
            
            if (dropTarget && draggedElement && dropTarget !== draggedElement) {
                // 드랍 대상의 ID
                const dropTargetId = dropTarget.dataset.id;
                // 드래그 중인 요소의 ID
                const draggedId = draggedElement.dataset.id;
                
                // 상위-하위 관계 체크 (순환 참조 방지)
                if (DirectoryManager.isAncestor(draggedId, dropTargetId)) {
                    // 드래그 중인 요소가 대상의 상위라면 드랍 불가
                    return;
                }
                
                // 기존 대상 강조 제거
                document.querySelectorAll('.drop-target').forEach(el => {
                    if (el !== dropTarget) {
                        el.classList.remove('drop-target');
                    }
                });
                
                // 새 대상 강조
                dropTarget.classList.add('drop-target');
            }
        });
        
        // 드랍 영역 떠날 때
        treeContainer.addEventListener('dragleave', function(e) {
            const dropTarget = getDropTarget(e.target);
            if (dropTarget && !dropTarget.contains(e.relatedTarget)) {
                dropTarget.classList.remove('drop-target');
            }
        });
        
        // 드랍 실행
        treeContainer.addEventListener('drop', function(e) {
            e.preventDefault();
            
            // 드랍 대상 찾기
            const dropTarget = getDropTarget(e.target);
            
            if (dropTarget && draggedElement) {
                // 이동할 디렉토리 ID와 대상 디렉토리 ID
                const directoryToMoveId = draggedElement.dataset.id;
                const targetDirectoryId = dropTarget.dataset.id;
                
                // 동일한 요소면 무시
                if (directoryToMoveId === targetDirectoryId) {
                    dropTarget.classList.remove('drop-target');
                    return;
                }
                
                // 상위-하위 관계 체크 (순환 참조 방지)
                if (DirectoryManager.isAncestor(directoryToMoveId, targetDirectoryId)) {
                    alert('상위 디렉토리를 하위 디렉토리로 이동할 수 없습니다.');
                    dropTarget.classList.remove('drop-target');
                    return;
                }
                
                // 디렉토리 이동 실행
                moveDirectory(directoryToMoveId, targetDirectoryId);
                
                // 강조 제거
                dropTarget.classList.remove('drop-target');
            }
        });
        
        // 드랍 대상 요소 찾기 (가장 가까운 tree-node)
        function getDropTarget(element) {
            while (element && !element.classList.contains('tree-node')) {
                element = element.parentElement;
                if (!element || element === treeContainer) {
                    return null;
                }
            }
            return element;
        }
    }

    // 디렉토리와 하위 디렉토리 재귀적 삭제
    function deleteRecursive(directoryId) {
        const directory = DirectoryManager.getData()[directoryId];
        if (!directory) return;
        
        // 자식 디렉토리가 있으면 먼저 재귀적으로 삭제
        if (directory.children && directory.children.length > 0) {
            // 배열 복사 (삭제 중 원본 배열이 변경되는 것을 방지)
            const childrenCopy = [...directory.children];
            childrenCopy.forEach(childId => {
                deleteRecursive(childId);
            });
        }
        
        // 디렉토리 자체 삭제
        delete DirectoryManager.getData()[directoryId];
    }

    // DirectoryManager 객체에 함수 추가
    Object.assign(DirectoryManager, {
        // 디렉토리 조작
        addNewDirectory: addNewDirectory,
        addNewRootDirectory: addNewRootDirectory,
        deleteDirectory: deleteDirectory,
        moveDirectory: moveDirectory,
        updateChildrenPaths: updateChildrenPaths,
        
        // UI 관리
        refreshUI: refreshUI,
        showMapStatus: showMapStatus,
        resetAndRefresh: resetAndRefresh,
        
        // 트리 렌더링
        renderInitialTree: renderInitialTree,
        renderTree: renderTree,
        
        // 드래그 앤 드롭
        setupDragAndDrop: setupDragAndDrop
    });
})(); 