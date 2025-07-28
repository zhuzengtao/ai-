// 搜索功能增强模块

class SearchEngine {
    constructor() {
        this.searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        this.maxHistoryItems = 10;
        this.setupSearchEnhancements();
    }

    // 设置搜索增强功能
    setupSearchEnhancements() {
        this.setupSearchSuggestions();
        this.setupSearchHistory();
        this.setupAdvancedSearch();
    }

    // 设置搜索建议
    setupSearchSuggestions() {
        const searchInput = document.getElementById('search-input');
        const suggestionsContainer = this.createSuggestionsContainer();
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                this.showSuggestions(query, suggestionsContainer);
            } else {
                this.hideSuggestions(suggestionsContainer);
            }
        });

        // 点击外部隐藏建议
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                this.hideSuggestions(suggestionsContainer);
            }
        });
    }

    // 创建建议容器
    createSuggestionsContainer() {
        const container = document.createElement('div');
        container.className = 'search-suggestions';
        container.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #e1e5e9;
            border-top: none;
            border-radius: 0 0 8px 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-height: 300px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        `;
        
        const searchWrapper = document.querySelector('.search-input-wrapper');
        searchWrapper.style.position = 'relative';
        searchWrapper.appendChild(container);
        
        return container;
    }

    // 显示搜索建议
    showSuggestions(query, container) {
        const suggestions = this.generateSuggestions(query);
        
        if (suggestions.length === 0) {
            this.hideSuggestions(container);
            return;
        }

        container.innerHTML = '';
        
        // 添加建议项
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.style.cssText = `
                padding: 10px 15px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                transition: background-color 0.2s;
            `;
            
            item.innerHTML = `
                <div class="suggestion-text">${this.highlightMatch(suggestion.text, query)}</div>
                <div class="suggestion-type" style="font-size: 0.8rem; color: #666; margin-top: 2px;">
                    ${suggestion.type}
                </div>
            `;
            
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f8f9fa';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'white';
            });
            
            item.addEventListener('click', () => {
                document.getElementById('search-input').value = suggestion.text;
                this.addToHistory(suggestion.text);
                handleSearch();
                this.hideSuggestions(container);
            });
            
            container.appendChild(item);
        });
        
        container.style.display = 'block';
    }

    // 生成搜索建议
    generateSuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();
        
        // 从提示词标题中生成建议
        allPrompts.forEach(prompt => {
            if (prompt.title.toLowerCase().includes(queryLower)) {
                suggestions.push({
                    text: prompt.title,
                    type: '提示词标题',
                    score: this.calculateRelevanceScore(prompt.title, query)
                });
            }
        });
        
        // 从标签中生成建议
        const allTags = [...new Set(allPrompts.flatMap(p => p.tags))];
        allTags.forEach(tag => {
            if (tag.toLowerCase().includes(queryLower)) {
                suggestions.push({
                    text: tag,
                    type: '标签',
                    score: this.calculateRelevanceScore(tag, query)
                });
            }
        });
        
        // 从分类中生成建议
        const categories = {
            'programming': '编程开发',
            'writing': '写作文案',
            'design': '设计创意',
            'marketing': '营销推广',
            'education': '教育学习',
            'business': '商业分析',
            'translation': '翻译润色'
        };
        
        Object.entries(categories).forEach(([key, name]) => {
            if (name.toLowerCase().includes(queryLower)) {
                suggestions.push({
                    text: name,
                    type: '分类',
                    score: this.calculateRelevanceScore(name, query)
                });
            }
        });
        
        // 从搜索历史中生成建议
        this.searchHistory.forEach(historyItem => {
            if (historyItem.toLowerCase().includes(queryLower)) {
                suggestions.push({
                    text: historyItem,
                    type: '搜索历史',
                    score: this.calculateRelevanceScore(historyItem, query) + 0.1 // 历史记录稍微加权
                });
            }
        });
        
        // 去重并按相关性排序
        const uniqueSuggestions = suggestions.filter((item, index, self) => 
            index === self.findIndex(t => t.text === item.text)
        );
        
        return uniqueSuggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, 8); // 最多显示8个建议
    }

    // 计算相关性分数
    calculateRelevanceScore(text, query) {
        const textLower = text.toLowerCase();
        const queryLower = query.toLowerCase();
        
        // 完全匹配得分最高
        if (textLower === queryLower) return 1.0;
        
        // 开头匹配得分较高
        if (textLower.startsWith(queryLower)) return 0.8;
        
        // 包含匹配
        if (textLower.includes(queryLower)) return 0.6;
        
        // 模糊匹配（计算编辑距离）
        const distance = this.levenshteinDistance(textLower, queryLower);
        const maxLength = Math.max(textLower.length, queryLower.length);
        return Math.max(0, 1 - distance / maxLength) * 0.4;
    }

    // 计算编辑距离
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    // 高亮匹配文本
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong style="color: #667eea;">$1</strong>');
    }

    // 隐藏建议
    hideSuggestions(container) {
        container.style.display = 'none';
    }

    // 设置搜索历史
    setupSearchHistory() {
        // 重写原有的搜索函数以添加历史记录
        const originalHandleSearch = window.handleSearch;
        window.handleSearch = () => {
            const query = document.getElementById('search-input').value.trim();
            if (query) {
                this.addToHistory(query);
            }
            originalHandleSearch();
        };
    }

    // 添加到搜索历史
    addToHistory(query) {
        if (!query || query.length < 2) return;
        
        // 移除重复项
        const index = this.searchHistory.indexOf(query);
        if (index > -1) {
            this.searchHistory.splice(index, 1);
        }
        
        // 添加到开头
        this.searchHistory.unshift(query);
        
        // 限制历史记录数量
        if (this.searchHistory.length > this.maxHistoryItems) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
        }
        
        // 保存到本地存储
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }

    // 设置高级搜索
    setupAdvancedSearch() {
        // 可以在这里添加高级搜索功能，如搜索过滤器等
        this.setupSearchFilters();
    }

    // 设置搜索过滤器
    setupSearchFilters() {
        // 添加搜索选项按钮
        const searchBar = document.querySelector('.search-bar');
        const filterBtn = document.createElement('button');
        filterBtn.className = 'search-filter-btn';
        filterBtn.innerHTML = '<i class="fas fa-filter"></i>';
        filterBtn.title = '搜索选项';
        filterBtn.style.cssText = `
            padding: 12px;
            background: white;
            border: 2px solid #e1e5e9;
            border-radius: 25px;
            cursor: pointer;
            margin-left: 10px;
            transition: all 0.3s;
        `;
        
        filterBtn.addEventListener('click', () => {
            this.showSearchFilters();
        });
        
        searchBar.appendChild(filterBtn);
    }

    // 显示搜索过滤器
    showSearchFilters() {
        // 这里可以实现搜索过滤器的弹窗
        console.log('显示搜索过滤器');
    }

    // 清除搜索历史
    clearHistory() {
        this.searchHistory = [];
        localStorage.removeItem('searchHistory');
    }

    // 获取热门搜索词
    getPopularSearches() {
        // 基于提示词的标签和标题生成热门搜索词
        const tagCounts = {};
        allPrompts.forEach(prompt => {
            prompt.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });
        
        return Object.entries(tagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([tag]) => tag);
    }
}

// 初始化搜索引擎
let searchEngine;
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保其他脚本已加载
    setTimeout(() => {
        searchEngine = new SearchEngine();
    }, 100);
});
