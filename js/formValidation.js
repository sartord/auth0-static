document.getElementById('userForm').addEventListener('submit', function(event) {
    let isValid = true;
    
    // 必須フィールドのチェック
    const requiredFields = ['fullname', 'email', 'address', 'age', 'phone', 'confirm'];
    
    requiredFields.forEach(function(field) {
        const input = document.getElementById(field);
        if (input.value.trim() === '') {
            isValid = false;
            alert(`${field} は必須です。`);
            input.focus();
        }
    });
    
    if (!isValid) {
        event.preventDefault(); // フォーム送信を停止
    }
});
