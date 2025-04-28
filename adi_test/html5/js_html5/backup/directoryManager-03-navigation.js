/*
 * directoryManager-03-navigation.js
 * 디렉토리 관리 통합 모듈 - 03 탐색 및 조작 함수
 * 
 * 이 파일은 디렉토리 탐색 및 조작 관련 함수를 포함합니다.
 */

// 탐색 및 조작 함수를 DirectoryManager 객체에 추가
(function() {
    // 디렉토리로 이동하는 함수
    function navigateToDirectory(directoryId, path = null) {
        console.log(`디렉토리 이동: ID ${directoryId}`);
        
        // 현재 부모 ID 업데이트
        var currentParentId = directoryId;
        
        // 경로 업데이트 (있는 경우)
        if (path) {
            DirectoryManager.setCurrentPath(path);
        } else if (directoryId) {
            // directoryId에 해당하는 디렉토리 가져오기
            const dir = DirectoryManager.getDirectoryById(directoryId);
            if (dir && dir.path) {
                DirectoryManager.setCurrentPath(dir.path);
                
                // 이동한 디렉토리의 경로에 있는 모든 디렉토리를 펼친 상태로 설정
                dir.path.forEach(pathItem => {
                    DirectoryManager.setExpandedState(pathItem.id, true);
                });
            } else {
                DirectoryManager.setCurrentPath([]);
            }
        } else {
            // 루트로 이동
            DirectoryManager.setCurrentPath([]);
        }
        
        // 현재 디렉토리를 펼친 상태로 설정
        if (directoryId) {
            DirectoryManager.setExpandedState(directoryId, true);
        }
        
        // 경로 표시 업데이트
        DirectoryManager.updatePathNavigation();
        
        // 현재 디렉토리의 내용 표시 (목록 뷰 or 디테일 뷰)
        displayDirectoryContents(directoryId);
    }

    // 디렉토리 더블클릭 처리 (디렉토리 이동)
    function handleDirectoryDoubleClick(nodeId) {
        console.log(`디렉토리 더블클릭: ID ${nodeId}`);
        
        // 해당 디렉토리가 유효한지 확인
        if (!DirectoryManager.isValidDirectoryId(nodeId)) {
            console.error(`유효하지 않은 디렉토리 ID: ${nodeId}`);
            return;
        }
        
        // 디렉토리 이동
        navigateToDirectory(nodeId);
    }

    // 상위 디렉토리로 이동하는 함수
    function navigateUp() {
        console.log("상위 디렉토리로 이동 시도");
        
        // 현재 경로가 없거나 루트 수준인 경우
        const currentPath = DirectoryManager.getCurrentPath();
        if (!currentPath || currentPath.length === 0) {
            console.log("이미 루트 수준입니다. 상위 디렉토리 없음.");
            return;
        }
        
        // 현재 경로에서 하나 위 경로로 이동
        const newPath = currentPath.slice(0, -1);
        
        // 이동할 상위 디렉토리의 ID 결정
        const parentId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
        
        // 해당 디렉토리로 이동
        navigateToDirectory(parentId, newPath);
    }

    // 노드 토글 (확장/축소)
    function toggleNode(id) {
        console.log(`노드 토글: ID ${id}`);
        const nodeElement = document.querySelector(`.tree-node[data-id="${id}"]`);
        if (!nodeElement) return;
        
        const childrenElement = nodeElement.querySelector('.tree-children');
        if (!childrenElement) return;
        
        const isExpanded = childrenElement.style.display !== 'none';
        const icon = nodeElement.querySelector('.icon');
        
        if (isExpanded) {
            // 축소
            childrenElement.style.display = 'none';
            if (icon) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-right');
            }
            // 상태 저장
            DirectoryManager.setExpandedState(id, false);
        } else {
            // 확장
            childrenElement.style.display = 'block';
            if (icon) {
                icon.classList.remove('fa-chevron-right');
                icon.classList.add('fa-chevron-down');
            }
            // 상태 저장
            DirectoryManager.setExpandedState(id, true);
        }
    }

    // 디렉토리 내용 표시 함수
    function displayDirectoryContents(directoryId) {
        console.log(`디렉토리 내용 표시: ID ${directoryId}`);
        
        // 디렉토리 목록 컨테이너
        const directoryContents = document.getElementById('directoryContents');
        if (!directoryContents) return;
        
        // 내용 초기화
        directoryContents.innerHTML = '';
        
        // 디렉토리 ID가 없으면 루트 디렉토리 표시
        if (!directoryId) {
            // 루트 디렉토리 가져오기
            const rootDirectories = Array.from(DirectoryManager.getIdMap().values())
                .filter(dir => !dir.parentId)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            
            // 각 루트 디렉토리 표시
            rootDirectories.forEach(dir => {
                const dirElement = createDirectoryElement(dir);
                directoryContents.appendChild(dirElement);
            });
        } else {
            // 특정 디렉토리의 자식 요소 표시
            const directory = DirectoryManager.getDirectoryById(directoryId);
            if (!directory) return;
            
            // 해당 디렉토리의 자식 가져오기
            const children = Array.from(DirectoryManager.getIdMap().values())
                .filter(dir => dir.parentId === directoryId)
                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
            
            // 각 자식 디렉토리 표시
            children.forEach(child => {
                const dirElement = createDirectoryElement(child);
                directoryContents.appendChild(dirElement);
            });
        }
    }

    // 디렉토리 요소 생성 함수
    function createDirectoryElement(directory) {
        const dirElement = document.createElement('div');
        dirElement.className = 'directory-item';
        dirElement.dataset.id = directory.id;
        
        // 아이콘 추가
        const icon = document.createElement('i');
        icon.className = 'fas fa-folder';
        dirElement.appendChild(icon);
        
        // 이름 추가
        const nameSpan = document.createElement('span');
        nameSpan.className = 'directory-name';
        nameSpan.textContent = directory.name;
        dirElement.appendChild(nameSpan);
        
        // 이벤트 리스너 추가
        dirElement.addEventListener('dblclick', function() {
            handleDirectoryDoubleClick(directory.id);
        });
        
        // 드래그 앤 드롭 설정
        dirElement.setAttribute('draggable', 'true');
        
        return dirElement;
    }

    // 모달 함수 (디렉토리 추가, 삭제 등)
    function showAddModal(parentId, parentName) {
        console.log(`새 디렉토리 추가 모달 표시: 부모 ID ${parentId}`);
        
        // 부모 ID 설정
        document.getElementById('parentDirectoryId').value = parentId;
        
        // 부모 이름 표시
        const parentDirName = document.getElementById('parentDirectoryName');
        if (parentDirName) {
            parentDirName.textContent = parentName || '알 수 없는 부모 디렉토리';
        }
        
        // 입력 필드 초기화
        document.getElementById('newDirectoryName').value = '';
        
        // 모달 표시
        const modal = document.getElementById('addDirectoryModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    function showAddRootModal() {
        console.log("새 루트 디렉토리 추가 모달 표시");
        
        // 입력 필드 초기화
        document.getElementById('newRootDirectoryName').value = '';
        
        // 모달 표시
        const modal = document.getElementById('addRootDirectoryModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    function closeModal(modalId) {
        console.log(`모달 닫기: ${modalId}`);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // DirectoryManager 객체에 함수 추가
    Object.assign(DirectoryManager, {
        // 네비게이션
        navigateToDirectory: navigateToDirectory,
        navigateUp: navigateUp,
        toggleNode: toggleNode,
        displayDirectoryContents: displayDirectoryContents,
        handleDirectoryDoubleClick: handleDirectoryDoubleClick,
        
        // 모달
        showAddModal: showAddModal,
        showAddRootModal: showAddRootModal,
        closeModal: closeModal,
        
        // 유틸리티
        createDirectoryElement: createDirectoryElement
    });
})(); 