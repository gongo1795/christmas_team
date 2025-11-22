document.addEventListener('DOMContentLoaded', () => {
    const treeArea = document.getElementById('tree-area');
    const ornamentsList = document.querySelector('.ornaments-list');
    const resetButton = document.getElementById('reset-button');
    let draggedType = null;

    // --- 1. 드래그 시작 이벤트 ---
    ornamentsList.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('ornament')) {
            // 드롭된 아이템의 'data-type'을 저장하여 복제에 사용
            draggedType = e.target.getAttribute('data-type');
            e.dataTransfer.setData('text/plain', draggedgedType);
        }
    });

    // --- 2. 드롭 허용 ---
    treeArea.addEventListener('dragover', (e) => {
        e.preventDefault(); 
    });

    // --- 3. 드롭 실행 ---
    treeArea.addEventListener('drop', (e) => {
        e.preventDefault();
        
        if (!draggedType) return; // 유효한 아이템이 아니면 중단

        // 새 장식 아이템 생성 (복제)
        const newOrnament = document.createElement('div');
        newOrnament.classList.add('ornament', draggedType);
        newOrnament.setAttribute('data-type', draggedType);
        newOrnament.style.position = 'absolute';

        // 트리 영역 내에서 마우스 위치 계산
        const rect = treeArea.getBoundingClientRect();
        // 장식 크기의 절반을 빼서 중앙에 오도록 조정 (40px 기준 20px)
        const x = e.clientX - rect.left - 20; 
        const y = e.clientY - rect.top - 20;

        newOrnament.style.left = x + 'px';
        newOrnament.style.top = y + 'px';
        
        // 클릭 시 삭제 기능 추가 (선택 사항)
        newOrnament.addEventListener('click', () => {
            newOrnament.remove();
            saveTreeState();
        });

        treeArea.appendChild(newOrnament);
        saveTreeState();
    });
    
    // --- 4. 상태 저장 및 로드 ---

    function saveTreeState() {
        const ornaments = [];
        // 트리 영역 내의 모든 장식 아이템 정보를 수집
        treeArea.querySelectorAll('.ornament').forEach(item => {
            ornaments.push({
                type: item.getAttribute('data-type'),
                left: item.style.left,
                top: item.style.top
            });
        });
        // Local Storage에 JSON 형태로 저장
        localStorage.setItem('christmasTreeState', JSON.stringify(ornaments));
        console.log("트리 상태 저장 완료.");
    }

    function loadTreeState() {
        const savedState = localStorage.getItem('christmasTreeState');
        if (!savedState) return;

        const ornaments = JSON.parse(savedState);
        
        // 기존 장식 초기화 후 저장된 상태 불러오기
        treeArea.querySelectorAll('.ornament').forEach(item => item.remove());
        
        ornaments.forEach(data => {
            const newOrnament = document.createElement('div');
            newOrnament.classList.add('ornament', data.type);
            newOrnament.setAttribute('data-type', data.type);
            newOrnament.style.position = 'absolute';
            newOrnament.style.left = data.left;
            newOrnament.style.top = data.top;

            newOrnament.addEventListener('click', () => {
                newOrnament.remove();
                saveTreeState();
            });

            treeArea.appendChild(newOrnament);
        });
        console.log("트리 상태 로드 완료.");
    }

    // --- 5. 초기화 버튼 기능 ---
    resetButton.addEventListener('click', () => {
        if (confirm("정말로 트리를 초기화하시겠습니까?")) {
            localStorage.removeItem('christmasTreeState');
            treeArea.querySelectorAll('.ornament').forEach(item => item.remove());
            alert("트리가 초기화되었습니다.");
        }
    });

    // 페이지 로드 시 저장된 트리 상태 불러오기
    loadTreeState();
});