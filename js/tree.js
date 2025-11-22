document.addEventListener('DOMContentLoaded', () => {
    const treeArea = document.getElementById('tree-area');
    const resetButton = document.getElementById('reset-button');
    
    // 모달 요소들
    const inputModal = document.getElementById('input-modal');
    const viewModal = document.getElementById('view-modal');
    const inputForm = document.getElementById('memo-input-form');
    const inputMemoText = document.getElementById('input-memo-text');
    const viewMemoText = document.getElementById('view-memo-text');

    // 모달 닫기 버튼
    const closeInputModal = document.getElementById('close-input-modal');
    const closeViewModal = document.getElementById('close-view-modal');

    let draggedData = null;
    let memoDropPosition = { left: 0, top: 0, type: null }; // 드롭 위치와 타입 저장

    const STORAGE_KEY = 'christmasTreeState_Memo'; // 로컬 저장소 키

    // --- 1. 로컬 저장소 기능 ---
    function saveTreeState(state) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function loadTreeState() {
        const json = localStorage.getItem(STORAGE_KEY);
        return json ? JSON.parse(json) : [];
    }

    function getNextId() {
        const state = loadTreeState();
        return state.length > 0 ? Math.max(...state.map(o => o.id)) + 1 : 1;
    }

    // --- 2. 장식 엘리먼트 생성 (메모 기능 포함) ---
    function createOrnamentElement(data) {
        const ornament = document.createElement('div');
        
        ornament.classList.add('ornament', data.type); 
        ornament.setAttribute('data-id', data.id);
        
        // 메모 기능이 있는 장식 처리 (모든 장식은 메모 데이터를 가집니다)
        if (data.memo) {
            ornament.setAttribute('data-memo', data.memo); 
            
            // 클릭 시 메모 열람 모달 띄우기 (모든 장식에 적용)
            ornament.addEventListener('click', () => {
                viewMemoText.textContent = data.memo;
                viewModal.style.display = 'block';
            });
            
            if (data.type === 'memo-note') {
                 ornament.innerHTML = '📝'; // 기본 메모 노트에만 아이콘 표시
            }
        }
        
        // 드래그 이벤트 리스너 추가 (위치 이동 기능)
        addDragListeners(ornament);
        
        return ornament;
    }

    // --- 3. 장식 위치 이동 (드래그) 로직 ---
    function addDragListeners(ornament) {
        let isDragging = false;
        let offset = { x: 0, y: 0 };
        
        ornament.addEventListener('mousedown', (e) => {
            e.preventDefault(); 
            isDragging = true;
            
            const rect = ornament.getBoundingClientRect();
            
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;

            ornament.style.cursor = 'grabbing';
            ornament.style.transition = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const treeRect = treeArea.getBoundingClientRect();
            
            let newX = e.clientX - treeRect.left - offset.x;
            let newY = e.clientY - treeRect.top - offset.y;
            
            let newLeftPercent = (newX / treeRect.width) * 100;
            let newTopPercent = (newY / treeRect.height) * 100;

            newLeftPercent = Math.max(0, Math.min(100, newLeftPercent));
            newTopPercent = Math.max(0, Math.min(100, newTopPercent));
            
            ornament.style.left = `${newLeftPercent}%`;
            ornament.style.top = `${newTopPercent}%`;
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                ornament.style.cursor = 'grab';
                ornament.style.transition = ''; 
                
                // 로컬 저장소 업데이트
                const ornamentId = parseInt(ornament.getAttribute('data-id'));
                const state = loadTreeState();
                const item = state.find(o => o.id === ornamentId);
                
                if (item) {
                    item.left = ornament.style.left;
                    item.top = ornament.style.top;
                    saveTreeState(state);
                }
            }
        });
    }

    // --- 4. 드래그앤드롭 로직 (팔레트 -> 트리) ---
    document.querySelectorAll('.ornaments-list .ornament').forEach(paletteOrnament => {
        paletteOrnament.addEventListener('dragstart', (e) => {
            draggedData = { type: paletteOrnament.getAttribute('data-type') };
            e.dataTransfer.setData('text/plain', draggedData.type);
        });
    });

    treeArea.addEventListener('dragover', (e) => {
        e.preventDefault(); 
    });

    // **핵심 수정 부분:** 모든 장식 드롭 시 메모 팝업을 띄우도록 조건문을 제거했습니다.
    treeArea.addEventListener('drop', (e) => {
        e.preventDefault();
        
        if (!draggedData || !draggedData.type) return;

        const rect = treeArea.getBoundingClientRect();
        
        // 드롭된 위치를 퍼센트로 계산
        const dropX = ((e.clientX - rect.left) / rect.width) * 100;
        const dropY = ((e.clientY - rect.top) / rect.height) * 100;
        
        // 모든 장식에 대해 메모 입력 모달을 띄우고 위치와 타입을 저장
        memoDropPosition = { 
            type: draggedData.type, 
            left: `${dropX}%`, 
            top: `${dropY}%` 
        };
        inputModal.style.display = 'block';
        inputMemoText.value = '';
        inputMemoText.focus();
        
        draggedData = null;
    });


    // --- 5. 메모 입력 폼 제출 처리 ---
    inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const memo = inputMemoText.value.trim();
        
        if (memo) {
            // memoDropPosition에 저장된 타입과 메모 데이터를 사용
            addOrnamentToTree(
                memoDropPosition.type, 
                memoDropPosition.left, 
                memoDropPosition.top, 
                memo
            );
            inputModal.style.display = 'none'; // 모달 닫기
        } else {
            alert('메모 내용을 입력해 주세요.');
        }
    });

    // --- 6. 트리 장식 추가 및 저장 함수 ---
    function addOrnamentToTree(type, left, top, memo) { // memo는 이제 필수가 됨
        const newOrnamentData = {
            id: getNextId(),
            type: type,
            left: left,
            top: top,
            memo: memo 
        };

        // 1. DOM에 추가
        const newOrnament = createOrnamentElement(newOrnamentData);
        newOrnament.style.left = left;
        newOrnament.style.top = top;
        treeArea.appendChild(newOrnament);

        // 2. 로컬 저장소에 저장
        const state = loadTreeState();
        state.push(newOrnamentData);
        saveTreeState(state);
    }

    // --- 7. 초기화 버튼 ---
    resetButton.addEventListener('click', () => {
        if (confirm('트리의 모든 장식과 메모를 초기화하시겠습니까?')) {
            localStorage.removeItem(STORAGE_KEY);
            treeArea.innerHTML = '<div class="main-tree"></div>'; // DOM 초기화
            alert('트리가 초기화되었습니다.');
            loadInitialState();
        }
    });

    // --- 8. 초기 상태 로드 함수 ---
    function loadInitialState() {
        treeArea.innerHTML = '<div class="main-tree"></div>'; // 초기화
        const savedState = loadTreeState();
        
        savedState.forEach(data => {
            const ornament = createOrnamentElement(data);
            ornament.style.left = data.left;
            ornament.style.top = data.top;
            treeArea.appendChild(ornament);
        });
    }

    // --- 9. 모달 닫기 기능 ---
    closeInputModal.onclick = () => {
        inputModal.style.display = 'none';
    }
    closeViewModal.onclick = () => viewModal.style.display = 'none';

    window.onclick = function(event) {
        if (event.target == inputModal) {
            inputModal.style.display = 'none';
        }
        if (event.target == viewModal) {
            viewModal.style.display = 'none';
        }
    }
    
    // 페이지 로드 시 트리 상태 불러오기
    loadInitialState();
});