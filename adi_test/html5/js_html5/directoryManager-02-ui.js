/*
 * directoryManager-02-ui.js
 * 디렉토리 관리 통합 모듈 - 02 UI 함수
 * 
 * 이 파일은 UI 관련 함수를 포함합니다.
 */

// UI 함수를 DirectoryManager 객체에 추가
(function() {
    // 트리 요소에 이벤트 리스너 등록
    function setupTreeEventListeners() {
        console.log("트리 이벤트 리스너 설정을 시작합니다.");
        
        // 토글 아이콘 클릭 이벤트
        const toggleIcons = document.querySelectorAll('.tree-node .icon.fa-chevron-right, .tree-node .icon.fa-chevron-down');
        console.log(`토글 아이콘 ${toggleIcons.length}개를 찾았습니다.`);
        
        toggleIcons.forEach(icon => {
            icon.addEventListener('click', function(e) {
                e.stopPropagation();
                const nodeId = this.parentNode.dataset.id;
                console.log(`토글 아이콘 클릭됨: 노드 ID ${nodeId}`);
                DirectoryManager.toggleNode(nodeId);
            });
        });
        
        // 트리 노드에 이벤트 리스너 설정
        const treeNodes = document.querySelectorAll('.tree-node');
        console.log(`트리 노드 ${treeNodes.length}개를 찾았습니다.`);
        
        treeNodes.forEach(nodeElement => {
            DirectoryManager.setupNodeEventListeners(nodeElement);
        });
    }

    // 노드 요소에 이벤트 리스너 등록
    function setupNodeEventListeners(nodeElement) {
        console.log(`노드 ${nodeElement.dataset.id}에 이벤트 리스너를 설정합니다.`);
        
        // 하위 디렉토리 추가 버튼 클릭 이벤트
        const addButton = nodeElement.querySelector('.add-dir-btn');
        if (addButton) {
            addButton.addEventListener('click', function(e) {
                e.stopPropagation();
                const nodeId = nodeElement.dataset.id;
                const nodeName = nodeElement.dataset.name || nodeElement.textContent.trim().replace('[삭제]', '');
                console.log(`하위 디렉토리 추가 버튼 클릭됨: 부모 ID ${nodeId}`);
                DirectoryManager.showAddModal(nodeId, nodeName);
            });
        }
        
        // 삭제 버튼 클릭 이벤트
        const deleteButton = nodeElement.querySelector('.delete-btn');
        if (deleteButton) {
            deleteButton.addEventListener('click', function(e) {
                e.stopPropagation();
                const nodeId = nodeElement.dataset.id;
                console.log(`삭제 버튼 클릭됨: 노드 ID ${nodeId}`);
                DirectoryManager.deleteDirectory(nodeId);
            });
        }
        
        // 노드 클릭 시 토글 기능 추가
        nodeElement.addEventListener('click', function(e) {
            if (e.target === this || (e.target.classList.contains('icon') && !e.target.classList.contains('fa-plus'))) {
                const nodeId = this.dataset.id;
                if (this.querySelector('.tree-children')) {
                    console.log(`노드 클릭됨 (토글): 노드 ID ${nodeId}`);
                    DirectoryManager.toggleNode(nodeId);
                }
            }
        });
        
        // 더블클릭 이벤트 (디렉토리 이동)
        nodeElement.addEventListener('dblclick', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const nodeId = this.dataset.id;
            DirectoryManager.handleDirectoryDoubleClick(nodeId);
        });
        
        // 드래그 및 드롭 속성 설정 (드래그 가능)
        nodeElement.setAttribute('draggable', 'true');
    }

    // 버튼 이벤트 설정
    function setupButtonEvents() {
        console.log("버튼 이벤트 설정");
        
        // 루트 디렉토리 추가 버튼
        const addRootButton = document.getElementById('addRootBtn');
        if (addRootButton) {
            addRootButton.addEventListener('click', function() {
                console.log("루트 디렉토리 추가 버튼 클릭됨");
                DirectoryManager.showAddRootModal();
            });
        }
        
        // 상위 디렉토리로 이동 버튼
        const upButton = document.getElementById('upDirBtn');
        if (upButton) {
            upButton.addEventListener('click', function() {
                console.log("상위 디렉토리로 이동 버튼 클릭됨");
                DirectoryManager.navigateUp();
            });
        }
        
        // 모달 닫기 버튼
        const closeButtons = document.querySelectorAll('.modal .close, .modal .cancel-btn');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modalId = this.closest('.modal').id;
                console.log(`모달 닫기 버튼 클릭됨: ${modalId}`);
                DirectoryManager.closeModal(modalId);
            });
        });
        
        // 새 디렉토리 추가 확인 버튼
        const addDirectoryConfirmButton = document.getElementById('addDirectoryConfirmBtn');
        if (addDirectoryConfirmButton) {
            addDirectoryConfirmButton.addEventListener('click', function() {
                console.log("디렉토리 추가 확인 버튼 클릭됨");
                DirectoryManager.addNewDirectory();
            });
        }
        
        // 새 루트 디렉토리 추가 확인 버튼
        const addRootDirectoryConfirmButton = document.getElementById('addRootDirectoryConfirmBtn');
        if (addRootDirectoryConfirmButton) {
            addRootDirectoryConfirmButton.addEventListener('click', function() {
                console.log("루트 디렉토리 추가 확인 버튼 클릭됨");
                DirectoryManager.addNewRootDirectory();
            });
        }
        
        // 디버그 버튼 (맵 상태 확인)
        const debugMapBtn = document.getElementById('debugMapBtn');
        if (debugMapBtn) {
            debugMapBtn.addEventListener('click', function() {
                console.log("디버그 버튼 클릭됨: 맵 상태 확인");
                DirectoryManager.showMapStatus();
            });
        }
        
        // 리셋 버튼 (맵 초기화 및 새로고침)
        const resetMapBtn = document.getElementById('resetMapBtn');
        if (resetMapBtn) {
            resetMapBtn.addEventListener('click', function() {
                console.log("리셋 버튼 클릭됨: 맵 초기화 및 새로고침");
                DirectoryManager.resetAndRefresh();
            });
        }
    }

    // 키보드 이벤트 설정
    function setupKeyboardEvents() {
        document.addEventListener('keydown', function(e) {
            // ESC 키 - 모달 닫기
            if (e.key === 'Escape') {
                const visibleModal = document.querySelector('.modal[style*="display: block"]');
                if (visibleModal) {
                    console.log(`ESC 키 입력: ${visibleModal.id} 모달 닫기`);
                    DirectoryManager.closeModal(visibleModal.id);
                }
            }
            
            // Backspace 키 - 상위 디렉토리로 이동 (단, 입력 필드가 아닐 때)
            if (e.key === 'Backspace' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                if (!document.querySelector('.modal[style*="display: block"]')) {
                    console.log("Backspace 키 입력: 상위 디렉토리로 이동");
                    DirectoryManager.navigateUp();
                    e.preventDefault(); // 브라우저의 뒤로 가기 방지
                }
            }
        });
    }

    // 현재 경로 탐색 UI를 업데이트하는 함수
    function updatePathNavigation() {
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
            
            // 경로 표시 컨테이너 추가
            const pathLinks = document.createElement('div');
            pathLinks.id = 'pathLinks';
            pathLinks.className = 'path-links';
            pathNav.appendChild(pathLinks);
            
            // 컨테이너에 삽입 (트리 요소 이전)
            const treeElement = document.getElementById('tree');
            if (treeElement) {
                container.insertBefore(pathNav, treeElement);
            } else {
                container.appendChild(pathNav);
            }
        }
        
        // 경로 링크 업데이트
        const pathLinks = document.getElementById('pathLinks');
        if (!pathLinks) return;
        
        // 링크 초기화
        pathLinks.innerHTML = '';
        
        // 루트 링크 추가
        const rootLink = document.createElement('span');
        rootLink.className = 'path-item';
        rootLink.textContent = '루트';
        rootLink.addEventListener('click', function() {
            DirectoryManager.navigateToDirectory(null);
        });
        pathLinks.appendChild(rootLink);
        
        // 현재 경로 렌더링
        const currentPath = DirectoryManager.getCurrentPath();
        if (currentPath.length > 0) {
            currentPath.forEach((item, index) => {
                // 구분자 추가
                const separator = document.createElement('span');
                separator.className = 'path-separator';
                separator.textContent = ' > ';
                pathLinks.appendChild(separator);
                
                // 경로 항목 추가
                const pathItem = document.createElement('span');
                pathItem.className = 'path-item';
                pathItem.textContent = item.name;
                
                // 마지막 항목이 아니면 클릭 가능하게 설정
                if (index < currentPath.length - 1) {
                    pathItem.addEventListener('click', function() {
                        DirectoryManager.navigateToDirectory(item.id, currentPath.slice(0, index + 1));
                    });
                } else {
                    pathItem.classList.add('current');
                }
                
                pathLinks.appendChild(pathItem);
            });
        }
    }

    // 알림 표시
    function showNotification(message, type = 'info') {
        console.log(`알림: ${message} (${type})`);
        
        // 기존 알림 요소 가져오기 또는 새로 생성
        let notification = document.getElementById('notification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            document.body.appendChild(notification);
        }
        
        // 알림 타입에 따른 스타일
        const typeClasses = {
            'info': 'notification-info',
            'success': 'notification-success',
            'error': 'notification-error',
            'warning': 'notification-warning'
        };
        
        // 모든 타입 클래스 제거
        Object.values(typeClasses).forEach(cls => {
            notification.classList.remove(cls);
        });
        
        // 현재 타입 클래스 추가
        notification.classList.add('notification', typeClasses[type] || 'notification-info');
        
        // 메시지 설정
        notification.textContent = message;
        
        // 알림 표시
        notification.style.display = 'block';
        
        // 위치 조정
        notification.style.top = '20px';
        
        // 일정 시간 후 숨기기
        setTimeout(() => {
            notification.style.top = '-100px';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 500);
        }, 3000);
    }

    // DirectoryManager 객체에 함수 추가
    Object.assign(DirectoryManager, {
        // UI 이벤트
        setupTreeEventListeners: setupTreeEventListeners,
        setupNodeEventListeners: setupNodeEventListeners,
        setupButtonEvents: setupButtonEvents,
        setupKeyboardEvents: setupKeyboardEvents,
        updatePathNavigation: updatePathNavigation,
        showNotification: showNotification
    });
})(); 