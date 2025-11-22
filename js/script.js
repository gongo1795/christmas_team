document.addEventListener('DOMContentLoaded', () => {
    const snowContainer = document.getElementById('snow-container');
    const snowToggleButton = document.getElementById('snow-toggle');
    const NUM_FLAKES = 50; // 생성할 눈송이 개수

    // --- 1. 눈송이 생성 ---
    function createSnowflakes() {
        for (let i = 0; i < NUM_FLAKES; i++) {
            const flake = document.createElement('div');
            flake.classList.add('snowflake');
            
            // 초기 위치 및 크기 랜덤 설정
            flake.style.left = `${Math.random() * 100}vw`;
            flake.style.width = flake.style.height = `${Math.random() * 5 + 5}px`;
            
            // 애니메이션 속도 및 딜레이 랜덤 설정
            flake.style.animationDuration = `${Math.random() * 10 + 5}s`;
            flake.style.animationDelay = `${Math.random() * 10}s`;

            snowContainer.appendChild(flake);
        }
    }

    // --- 2. 토글 기능 ---
    function toggleSnow(forceStatus) {
        const isPaused = snowContainer.classList.toggle('paused', forceStatus);
        
        // 버튼 텍스트 변경
        snowToggleButton.textContent = isPaused ? '☀️' : '❄️';
        
        // 상태 저장 (true: 정지됨 / false: 재생 중)
        localStorage.setItem('snowPaused', isPaused);
    }
    
    // --- 3. 버튼 이벤트 리스너 ---
    snowToggleButton.addEventListener('click', () => {
        // 현재 상태를 반전시켜 토글
        const currentlyPaused = snowContainer.classList.contains('paused');
        toggleSnow(!currentlyPaused);
    });

    // --- 4. 초기 로드 및 상태 복원 ---
    createSnowflakes();
    
    // Local Storage에서 상태를 불러와 적용
    const savedPausedState = localStorage.getItem('snowPaused');
    if (savedPausedState === 'true') {
        toggleSnow(true); // 눈 내림 정지 상태로 시작
    } else {
        // 기본적으로 눈 내림 상태로 시작
        snowContainer.classList.remove('paused');
        snowToggleButton.textContent = '❄️';
    }
});