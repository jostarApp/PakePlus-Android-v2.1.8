// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    const checkboxes = document.querySelectorAll('input[name="segments"]');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const rangeInput = document.getElementById('rangeInput');
    const resultText = document.getElementById('resultText');

    // 加载保存的配置
    loadSavedConfig();

    // 复选框只能选一个
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                checkboxes.forEach(cb => {
                    if (cb !== this) cb.checked = false;
                });
                saveConfig();
            }
        });
    });

    // 长度区间输入框失焦时保存
    rangeInput.addEventListener('blur', function() {
        saveConfig();
    });

    // 生成按钮
    generateBtn.addEventListener('click', generateString);

    // 复制按钮
    copyBtn.addEventListener('click', copyToClipboard);

    // 保存配置到 localStorage
    function saveConfig() {
        const selectedCheckbox = document.querySelector('input[name="segments"]:checked');
        const config = {
            segments: selectedCheckbox ? selectedCheckbox.value : null,
            range: rangeInput.value.trim()
        };
        localStorage.setItem('generatorConfig', JSON.stringify(config));
    }

    // 加载保存的配置
    function loadSavedConfig() {
        const savedConfig = localStorage.getItem('generatorConfig');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                
                // 恢复段数选择
                if (config.segments) {
                    checkboxes.forEach(cb => {
                        if (cb.value === config.segments) {
                            cb.checked = true;
                        }
                    });
                }
                
                // 恢复长度区间
                if (config.range) {
                    rangeInput.value = config.range;
                }
            } catch (e) {
                console.error('加载配置失败', e);
            }
        }
    }

    // 生成随机字符串
    function generateString() {
        const selectedCheckbox = document.querySelector('input[name="segments"]:checked');
        
        if (!selectedCheckbox) {
            alert('请选择段数！');
            return;
        }

        const segments = parseInt(selectedCheckbox.value);
        const range = rangeInput.value.trim();
        
        // 解析范围
        const rangeMatch = range.match(/^(\d+)-(\d+)$/);
        if (!rangeMatch) {
            alert('请输入正确的范围格式，例如：3-8');
            return;
        }

        const minLength = parseInt(rangeMatch[1]);
        const maxLength = parseInt(rangeMatch[2]);

        if (minLength < 1 || maxLength < minLength) {
            alert('范围无效！最小值必须大于0，最大值必须大于等于最小值');
            return;
        }

        // 生成字符串
        const result = [];
        for (let i = 0; i < segments; i++) {
            result.push(generateSegment(minLength, maxLength));
        }

        resultText.value = result.join('.');
    }

    // 生成单个段
    function generateSegment(minLen, maxLen) {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        
        // 随机长度
        const length = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;
        
        // 第一个字符必须是字母
        let segment = letters[Math.floor(Math.random() * letters.length)];
        
        // 剩余字符可以是字母或数字
        for (let i = 1; i < length; i++) {
            segment += chars[Math.floor(Math.random() * chars.length)];
        }
        
        return segment;
    }

    // 复制到剪贴板
    function copyToClipboard() {
        if (!resultText.value) {
            alert('没有内容可复制！');
            return;
        }

        resultText.select();
        document.execCommand('copy');
        
        // 显示复制成功提示
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '已复制！';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 1500);
    }
});
