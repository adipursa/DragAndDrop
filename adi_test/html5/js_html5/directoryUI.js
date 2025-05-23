/*
모듈화된
디렉토리
관리
시스템
*/

/**
 * DirectoryUI 모듈 - UI 렌더링 및 화면 관련 기능
 * 
 * 이 모듈은 다음과 같은 기능을 담당합니다:
 * - 디렉토리 트리 렌더링
 * - 경로 네비게이션 UI 업데이트
 * - 알림 메시지 표시
 * - UI 새로고침
 */
var DirectoryUI = (function() {
    // 디렉토리 확장 상태를 저장하는 맵
    var expandedStateMap = new Map();
    
    // 트리 렌더링 함수
    function renderTree(nodes, parent, parentId) {
        console.log(`트리 렌더링: ${nodes.length}개 노드, 부모 ID ${parentId || 'root'}`);
        
        try {
            nodes.forEach(node => {
                // 노드 요소 생성
                const nodeElement = document.createElement('div');
                nodeElement.className = 'tree-node';
                nodeElement.dataset.id = node.id;
                nodeElement.dataset.name = node.name;
                if (parentId) {
                    nodeElement.dataset.parentId = parentId;
                }
                
                // 토글 아이콘 (하위 항목이 있는 경우)
                if (node.children && node.children.length > 0) {
                    const toggleIcon = document.createElement('i');
                    toggleIcon.className = 'icon fas fa-chevron-right';
                    nodeElement.appendChild(toggleIcon);
                }
                
                // 폴더 아이콘
                const folderIcon = document.createElement('i');
                folderIcon.className = 'icon fas fa-folder';
                nodeElement.appendChild(folderIcon);
                
                // 디렉토리 이름
                nodeElement.appendChild(document.createTextNode(` ${node.name}`));
                
                // 하위 디렉토리 추가 버튼
                const addBtn = document.createElement('span');
                addBtn.className = 'add-dir-btn';
                addBtn.title = '하위 디렉토리 추가';
                addBtn.innerHTML = '<i class="fas fa-plus"></i>';
                nodeElement.appendChild(addBtn);
                
                // 삭제 버튼
                const deleteBtn = document.createElement('span');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = '[삭제]';
                deleteBtn.title = '디렉토리 삭제';
                nodeElement.appendChild(deleteBtn);
                
                // 노드를 부모 요소에 추가
                parent.appendChild(nodeElement);
                
                // 하위 항목이 있는 경우, 하위 항목을 위한 컨테이너 생성
                if (node.children && node.children.length > 0) {
                    const childrenContainer = document.createElement('div');
                    childrenContainer.className = 'tree-children';
                    nodeElement.appendChild(childrenContainer);
                    
                    // 저장된 확장 상태에 따라 펼쳐진 상태 복원
                    if (expandedStateMap.get(node.id) === true) {
                        nodeElement.classList.add('expanded');
                        childrenContainer.style.display = 'block';
                        
                        // 아이콘 변경
                        const toggleIcon = nodeElement.querySelector('.icon.fa-chevron-right');
                        if (toggleIcon) {
                            toggleIcon.classList.remove('fa-chevron-right');
                            toggleIcon.classList.add('fa-chevron-down');
                        }
                    }
                    
                    // 하위 항목 렌더링
                    renderTree(node.children, childrenContainer, node.id);
                }
            });
        } catch (error) {
            console.error("트리 렌더링 중 오류 발생:", error);
        }
    }

    // 토글 기능 (트리 노드 확장/축소)
    function toggleNode(id) {
        console.log(`노드 토글: ID ${id}`);
        const nodeElement = document.querySelector(`.tree-node[data-id="${id}"]`);
        if (!nodeElement) {
            console.error(`ID가 ${id}인 노드를 찾을 수 없습니다.`);
            return;
        }
        
        const childrenContainer = nodeElement.querySelector('.tree-children');
        if (childrenContainer) {
            // 확장 상태 토글
            const isExpanded = nodeElement.classList.contains('expanded');
            nodeElement.classList.toggle('expanded');
            
            // 하위 항목 표시/숨김
            childrenContainer.style.display = isExpanded ? 'none' : 'block';
            
            // 아이콘 변경
            const toggleIcon = nodeElement.querySelector('.icon.fa-chevron-right, .icon.fa-chevron-down');
            if (toggleIcon) {
                toggleIcon.classList.toggle('fa-chevron-right');
                toggleIcon.classList.toggle('fa-chevron-down');
            }
            
            // 확장 상태 맵 업데이트
            expandedStateMap.set(id, !isExpanded);
            console.log(`노드 ${id}의 확장 상태가 ${!isExpanded}로 저장되었습니다.`);
            
            console.log(`노드 ${id} ${isExpanded ? '축소됨' : '확장됨'}`);
        }
    }

    // 현재 경로 탐색 UI를 업데이트하는 함수
    function updatePathNavigation() {
        const currentPath = DirectoryCore.getCurrentPath();
        console.log("경로 네비게이션 업데이트:", currentPath);
        
        // 경로 네비게이션 컨테이너가 존재하지 않으면 생성
        let pathNav = document.getElementById('pathNavigation');
        if (!pathNav) {
            const container = document.querySelector('.container');
            if (!container) return;
            
            // 경로 네비게이션 컨테이너 생성
            pathNav = document.createElement('div');
            pathNav.id = 'pathNavigation';
            pathNav.className = 'path-navigation';
            
            // 안내 텍스트 추가
            const pathText = document.createElement('div');
            pathText.className = 'path-text';
            pathText.innerHTML = '<i class="fas fa-folder-open"></i> 현재 위치: ';
            pathNav.appendChild(pathText);
            
            // 경로 표시 영역 추가
            const pathLinks = document.createElement('div');
            pathLinks.className = 'path-links';
            pathLinks.id = 'pathLinks';
            pathNav.appendChild(pathLinks);
            
            // 인스트럭션 패널 뒤에 삽입
            const instructionPanel = document.querySelector('.instruction-panel');
            container.insertBefore(pathNav, instructionPanel.nextSibling);
        }
        
        // 경로 링크 업데이트
        const pathLinks = document.getElementById('pathLinks');
        if (!pathLinks) return;
        
        pathLinks.innerHTML = '';
        
        // 홈(루트) 링크
        const homeLink = document.createElement('span');
        homeLink.className = 'path-link';
        homeLink.innerHTML = '<i class="fas fa-home"></i> 홈';
        homeLink.title = '루트 디렉토리로 이동';
        homeLink.addEventListener('click', () => DirectoryNavigation.navigateToDirectory(null));
        pathLinks.appendChild(homeLink);
        
        // 현재 경로가 있는 경우 경로 표시
        if (currentPath.length > 0) {
            pathLinks.appendChild(document.createTextNode(' > '));
            
            // 경로의 각 디렉토리에 대한 링크 생성
            currentPath.forEach((dir, index) => {
                const pathLink = document.createElement('span');
                pathLink.className = 'path-link';
                pathLink.textContent = dir.name;
                pathLink.title = `${dir.name}로 이동`;
                
                // 마지막 항목이 아닌 경우에만 클릭 이벤트 추가
                if (index < currentPath.length - 1) {
                    pathLink.addEventListener('click', () => {
                        // 해당 경로까지의 디렉토리로 이동
                        DirectoryNavigation.navigateToDirectory(dir.id, currentPath.slice(0, index + 1));
                    });
                } else {
                    pathLink.classList.add('current');
                }
                
                pathLinks.appendChild(pathLink);
                
                // 마지막 항목이 아니면 구분자 추가
                if (index < currentPath.length - 1) {
                    pathLinks.appendChild(document.createTextNode(' > '));
                }
            });
        }
    }

    // 알림 메시지 표시 함수
    function showNotification(message, type = 'info') {
        console.log(`알림 메시지: ${message}`);
        const toastContainer = document.getElementById('toastContainer');
        if (toastContainer) {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `
                <span>${message}</span>
                <button class="toast-close">&times;</button>
            `;
            
            toastContainer.appendChild(toast);
            
            // 닫기 버튼 이벤트
            const closeBtn = toast.querySelector('.toast-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', function() {
                    toastContainer.removeChild(toast);
                });
            }
            
            // 자동 제거 (3초 후)
            setTimeout(() => {
                if (toast.parentNode === toastContainer) {
                    toastContainer.removeChild(toast);
                }
            }, 3000);
        } else {
            console.error("toastContainer 요소를 찾을 수 없습니다.");
        }
    }

    // UI 새로고침 함수
    function refreshUI() {
        console.log("UI 새로고침 함수가 호출되었습니다.");
        
        // 현재 열려있는 디렉토리 정보 저장
        const currentPath = DirectoryCore.getCurrentPath();
        const currentViewId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null;
        
        // 맵 데이터 확인 및 디버그 출력
        const idMap = DirectoryCore.getIdMap();
        console.log(`Map 상태: ${idMap.size}개 항목, 경로 맵: ${DirectoryCore.getPathMap().size}개 항목`);
        console.log(`확장 상태 맵: ${expandedStateMap.size}개 항목`);
        
        // 현재 보고 있는 디렉토리의 내용을 새로고침
        if (currentViewId) {
            // 현재 디렉토리가 맵에 존재하는지 확인
            if (idMap.has(currentViewId)) {
                console.log(`현재 디렉토리 ID ${currentViewId}가 맵에 존재합니다. 해당 디렉토리로 이동합니다.`);
                DirectoryNavigation.navigateToDirectory(currentViewId);
            } else {
                console.error(`현재 디렉토리 ID ${currentViewId}가 맵에 존재하지 않습니다. 루트로 이동합니다.`);
                // 존재하지 않으면 루트로 이동
                DirectoryNavigation.navigateToDirectory(null);
            }
        } else {
            // 루트 디렉토리 보기 (맵 데이터 사용)
            console.log("루트 디렉토리를 새로고침합니다.");
            DirectoryMain.loadTree();
        }
    }

    // 모달 관련 함수들
    function showAddModal(parentId, parentName) {
        // 부모 디렉토리 이름을 모달에 설정
        document.getElementById('parentDirectoryName').textContent = parentName;
        document.getElementById('parentDirectoryId').value = parentId;
        
        // 모달 표시
        document.getElementById('addDirectoryModal').style.display = 'block';
    }

    function showAddRootModal() {
        document.getElementById('addRootDirectoryModal').style.display = 'block';
    }

    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        
        // 입력 필드 초기화
        if (modalId === 'addDirectoryModal') {
            document.getElementById('newDirectoryName').value = '';
        } else if (modalId === 'addRootDirectoryModal') {
            document.getElementById('newRootDirectoryName').value = '';
        }
    }

    // 디렉토리 맵 상태를 브라우저에 표시하는 함수
    function showMapStatus() {
        const status = DirectoryCore.debugMaps();
        
        // 확장 상태 맵 디버그 정보 출력
        console.log("======= 확장 상태 맵 디버그 정보 =======");
        console.log(`확장 상태 맵 크기: ${expandedStateMap.size}개 항목`);
        expandedStateMap.forEach((isExpanded, id) => {
            const dir = DirectoryCore.getDirectoryById(id);
            const name = dir ? dir.name : '알 수 없는 디렉토리';
            console.log(`  - ID: ${id}, 이름: ${name}, 확장 상태: ${isExpanded ? '펼침' : '접힘'}`);
        });
        console.log("======================================");
        
        showNotification(`맵 상태 확인: ${status ? '성공' : '실패'}. 콘솔을 확인하세요.`, 'info');
        return status;
    }
    
    // 확장 상태 맵 초기화
    function resetExpandedStateMap() {
        expandedStateMap.clear();
        console.log("확장 상태 맵이 초기화되었습니다.");
    }
    
    // 확장 상태 맵 가져오기
    function getExpandedStateMap() {
        return expandedStateMap;
    }

    // 공개 API
    return {
        renderTree: renderTree,
        toggleNode: toggleNode,
        updatePathNavigation: updatePathNavigation,
        showNotification: showNotification,
        refreshUI: refreshUI,
        showAddModal: showAddModal,
        showAddRootModal: showAddRootModal,
        closeModal: closeModal,
        showMapStatus: showMapStatus,
        resetExpandedStateMap: resetExpandedStateMap,
        getExpandedStateMap: getExpandedStateMap
    };
})();
