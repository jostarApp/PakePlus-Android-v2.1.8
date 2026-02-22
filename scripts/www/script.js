// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // Tab 切换
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    const prefixManagerFloat = document.getElementById('prefixManagerFloat');
    const prefixHideBtn = document.getElementById('prefixHideBtn');
    const prefixShowBtn = document.getElementById('prefixShowBtn');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');
            if (tabName === 'filename') {
                prefixShowBtn.style.display = prefixManagerFloat.classList.contains('hidden') ? '' : 'none';
            } else {
                prefixShowBtn.style.display = 'none';
            }
        });
    });

    prefixHideBtn.addEventListener('click', function() {
        prefixManagerFloat.classList.add('hidden');
        prefixShowBtn.style.display = '';
    });
    prefixShowBtn.addEventListener('click', function() {
        prefixManagerFloat.classList.remove('hidden');
        prefixShowBtn.style.display = 'none';
    });

    // ===== 随机字符串生成器 =====
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
        navigator.clipboard.writeText(resultText.value).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '已复制！';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 1500);
        }).catch(() => {
            document.execCommand('copy');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '已复制！';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 1500);
        });
    }

    // ===== 文件名生成器 =====
    const prefixInput = document.getElementById('prefixInput');
    const addPrefixBtn = document.getElementById('addPrefixBtn');
    const prefixList = document.getElementById('prefixList');
    const suffixInput = document.getElementById('suffixInput');
    const counterInput = document.getElementById('counterInput');
    const generateFilenameBtn = document.getElementById('generateFilenameBtn');
    const copyFilenameBtn = document.getElementById('copyFilenameBtn');
    const filenameResultText = document.getElementById('filenameResultText');

    let prefixes = [];
    let selectedPrefix = null;

    // 加载文件名生成器配置
    loadFilenameConfig();

    // 添加前缀
    addPrefixBtn.addEventListener('click', addPrefix);
    prefixInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addPrefix();
        }
    });

    // 后缀输入框失焦时保存
    suffixInput.addEventListener('blur', saveFilenameConfig);
    
    // 序号输入框失焦时保存
    counterInput.addEventListener('blur', function() {
        const counter = parseInt(counterInput.value) || 0;
        saveCounter(counter);
    });

    // 生成文件名
    generateFilenameBtn.addEventListener('click', generateFilename);

    // 复制文件名
    copyFilenameBtn.addEventListener('click', copyFilename);

    function addPrefix() {
        const prefix = prefixInput.value.trim();
        if (!prefix) {
            alert('请输入前缀名称！');
            return;
        }

        if (prefixes.includes(prefix)) {
            alert('该前缀已存在！');
            return;
        }

        prefixes.push(prefix);
        prefixInput.value = '';
        renderPrefixList();
        saveFilenameConfig();
    }

    function deletePrefix(prefix) {
        prefixes = prefixes.filter(p => p !== prefix);
        if (selectedPrefix === prefix) {
            selectedPrefix = null;
        }
        renderPrefixList();
        saveFilenameConfig();
    }

    function selectPrefix(prefix) {
        selectedPrefix = prefix;
        renderPrefixList();
        saveFilenameConfig();
    }

    function renderPrefixList() {
        prefixList.innerHTML = '';
        prefixes.forEach(prefix => {
            const item = document.createElement('div');
            item.className = 'prefix-item' + (prefix === selectedPrefix ? ' selected' : '');
            
            const text = document.createElement('span');
            text.textContent = prefix;
            text.addEventListener('click', () => selectPrefix(prefix));
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '×';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deletePrefix(prefix);
            });
            
            item.appendChild(text);
            item.appendChild(deleteBtn);
            prefixList.appendChild(item);
        });
    }

    function generateFilename() {
        if (!selectedPrefix) {
            alert('请选择一个前缀！');
            return;
        }

        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        
        // 获取当前序号并递增
        let counter = parseInt(counterInput.value) || 0;
        counter++;
        counterInput.value = counter;
        saveCounter(counter);
        
        const timestamp = `${day}${hour}${minute}${counter}`;
        const suffix = suffixInput.value.trim();
        
        const filename = suffix 
            ? `${selectedPrefix}_${timestamp}.${suffix}`
            : `${selectedPrefix}_${timestamp}`;
        
        filenameResultText.value = filename;
    }

    function getCounter() {
        const saved = localStorage.getItem('filenameCounter');
        return saved ? parseInt(saved) : 0;
    }

    function saveCounter(counter) {
        localStorage.setItem('filenameCounter', counter.toString());
    }

    function copyFilename() {
        if (!filenameResultText.value) {
            alert('没有内容可复制！');
            return;
        }

        filenameResultText.select();
        navigator.clipboard.writeText(filenameResultText.value).then(() => {
            const originalText = copyFilenameBtn.textContent;
            copyFilenameBtn.textContent = '已复制！';
            setTimeout(() => {
                copyFilenameBtn.textContent = originalText;
            }, 1500);
        }).catch(() => {
            document.execCommand('copy');
            const originalText = copyFilenameBtn.textContent;
            copyFilenameBtn.textContent = '已复制！';
            setTimeout(() => {
                copyFilenameBtn.textContent = originalText;
            }, 1500);
        });
    }

    function saveFilenameConfig() {
        const config = {
            prefixes: prefixes,
            selectedPrefix: selectedPrefix,
            suffix: suffixInput.value.trim()
        };
        localStorage.setItem('filenameConfig', JSON.stringify(config));
    }

    function loadFilenameConfig() {
        const savedConfig = localStorage.getItem('filenameConfig');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                prefixes = config.prefixes || [];
                selectedPrefix = config.selectedPrefix || null;
                if (config.suffix) {
                    suffixInput.value = config.suffix;
                }
                renderPrefixList();
            } catch (e) {
                console.error('加载文件名配置失败', e);
            }
        }
        
        // 加载序号
        const counter = getCounter();
        counterInput.value = counter;
    }
});
