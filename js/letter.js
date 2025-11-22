document.getElementById('letter-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = this;
    const feedback = document.getElementById('feedback');
    feedback.textContent = "편지 전송 중...";
    feedback.classList.remove('feedback-success', 'feedback-error');

    // EmailJS 템플릿 파라미터는 폼의 'name' 속성을 따릅니다.
    // ⚠️ SERVICE_ID와 TEMPLATE_ID를 실제 EmailJS 설정에 맞게 변경하세요!
    emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', form)
        .then(function() {
            feedback.textContent = '🎉 편지가 성공적으로 산타에게 전달되었습니다! 🎉';
            feedback.classList.add('feedback-success');
            form.reset(); // 성공 후 폼 초기화
        }, function(error) {
            console.log('전송 실패:', error);
            feedback.textContent = '❌ 편지 전송에 실패했습니다. (콘솔 확인 요망)';
            feedback.classList.add('feedback-error');
        });
});