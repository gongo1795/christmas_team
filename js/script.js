document.addEventListener('DOMContentLoaded', () => {
    const snowContainer = document.getElementById('snow-container');
    const snowToggleButton = document.getElementById('snow-toggle');
    const NUM_FLAKES = 50; // 생성할 눈송이 개수
    let snowInterval; // 눈송이 생성/제거를 위한 인터벌 ID

    // --- 1. 눈송이 생성 ---
    function createSnowflakes() {
        // 기존 눈송이 모두 제거
        snowContainer.innerHTML = ''; 

        for (let i = 0; i < NUM_FLAKES; i++) {
            const flake = document.createElement('div');
            flake.classList.add('snowflake');
            
            // 초기 위치 및 크기 랜덤 설정
            flake.style.left = `${Math.random() * 100}vw`;
            flake.style.width = flake.style.height = `${Math.random() * 5 + 5}px`;
            
            // 애니메이션 속도 및 딜레이 랜덤 설정
            flake.style.animationDuration = `${Math.random() * 10 + 5}s`; // 애니메이션 시간
            flake.style.animationDelay = `${Math.random() * 10}s`;       // 시작 딜레이

            snowContainer.appendChild(flake);
        }
    }

    // --- 2. 토글 기능 (생성/제거 방식) ---
    function toggleSnow(turnOn) {
        if (turnOn) {
            // 눈 내림 시작 (이미 눈이 있다면 다시 생성)
            createSnowflakes();
            snowToggleButton.textContent = '❄️';
            localStorage.setItem('snowEnabled', 'true');
        } else {
            // 눈 내림 정지 (눈송이 모두 제거)
            snowContainer.innerHTML = ''; // 모든 눈송이 제거
            snowToggleButton.textContent = '☀️';
            localStorage.setItem('snowEnabled', 'false');
        }
    }
    
    // --- 3. 버튼 이벤트 리스너 ---
    snowToggleButton.addEventListener('click', () => {
        const isSnowCurrentlyEnabled = localStorage.getItem('snowEnabled') === 'true';
        toggleSnow(!isSnowCurrentlyEnabled); // 현재 상태 반전
    });

    // --- 4. 초기 로드 및 상태 복원 ---
    const savedSnowState = localStorage.getItem('snowEnabled');
    if (savedSnowState === 'false') {
        toggleSnow(false); // 눈 내림 정지 상태로 시작
    } else {
        toggleSnow(true); // 기본적으로 눈 내림 상태로 시작
    }
});