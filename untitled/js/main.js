// 全局变量
let allPrompts = [];
let filteredPrompts = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentCategory = 'all';

// DOM元素
const templatesGrid = document.getElementById('templates-grid');
const favoritesGrid = document.getElementById('favorites-grid');
const loading = document.getElementById('loading');
const noResults = document.getElementById('no-results');
const modal = document.getElementById('template-modal');
const modalClose = document.getElementById('modal-close');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const filterTabs = document.querySelectorAll('.filter-tab');
const navLinks = document.querySelectorAll('.nav-link');

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    loadPrompts();
    setupEventListeners();
    updateFavoritesCount();
});

// 加载提示词数据
async function loadPrompts() {
    try {
        showLoading(true);

        // 尝试从fetch加载，如果失败则使用内嵌数据
        try {
            const response = await fetch('data/prompts.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            allPrompts = data.prompts;
        } catch (fetchError) {
            console.warn('从文件加载失败，使用内嵌数据:', fetchError);
            // 使用内嵌的示例数据
            allPrompts = getEmbeddedPrompts();
            // 显示服务器提示
            showServerNotice();
        }

        filteredPrompts = [...allPrompts];
        renderPrompts();
        updateTotalCount();
        showLoading(false);
    } catch (error) {
        console.error('加载数据失败:', error);
        showError('数据加载失败，请刷新页面重试');
        showLoading(false);
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 搜索功能
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // 分类筛选
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.dataset.category;
            handleCategoryFilter(category);
        });
    });

    // 导航链接
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            if (target.startsWith('#')) {
                handleNavigation(target.substring(1));
            }
        });
    });

    // 模态框关闭
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
}

// 渲染提示词卡片
function renderPrompts() {
    if (filteredPrompts.length === 0) {
        showNoResults(true);
        templatesGrid.innerHTML = '';
        return;
    }

    showNoResults(false);
    templatesGrid.innerHTML = '';

    filteredPrompts.forEach(prompt => {
        const card = createPromptCard(prompt);
        templatesGrid.appendChild(card);
    });
}

// 创建提示词卡片
function createPromptCard(prompt) {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.innerHTML = `
        <div class="template-header">
            <div>
                <h3 class="template-title">${prompt.title}</h3>
                <span class="template-category">${getCategoryName(prompt.category)}</span>
            </div>
            <button class="favorite-btn ${favorites.includes(prompt.id) ? 'active' : ''}" 
                    onclick="toggleFavorite(${prompt.id})" title="收藏">
                <i class="fas fa-heart"></i>
            </button>
        </div>
        <p class="template-description">${prompt.description}</p>
        <div class="template-tags">
            ${prompt.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="template-actions">
            <button class="copy-btn" onclick="copyPrompt('${prompt.prompt.replace(/'/g, "\\'")}')">
                <i class="fas fa-copy"></i> 复制
            </button>
            <button class="view-btn" onclick="viewPrompt(${prompt.id})">
                <i class="fas fa-eye"></i> 查看
            </button>
        </div>
    `;
    return card;
}

// 获取分类名称
function getCategoryName(category) {
    const categoryNames = {
        'programming': '编程开发',
        'writing': '写作文案',
        'design': '设计创意',
        'marketing': '营销推广',
        'education': '教育学习',
        'business': '商业分析',
        'translation': '翻译润色',
        'other': '其他'
    };
    return categoryNames[category] || '其他';
}

// 处理搜索
function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query === '') {
        filteredPrompts = currentCategory === 'all' 
            ? [...allPrompts] 
            : allPrompts.filter(p => p.category === currentCategory);
    } else {
        const basePrompts = currentCategory === 'all' 
            ? allPrompts 
            : allPrompts.filter(p => p.category === currentCategory);
            
        filteredPrompts = basePrompts.filter(prompt => 
            prompt.title.toLowerCase().includes(query) ||
            prompt.description.toLowerCase().includes(query) ||
            prompt.tags.some(tag => tag.toLowerCase().includes(query)) ||
            prompt.prompt.toLowerCase().includes(query)
        );
    }
    
    renderPrompts();
}

// 处理分类筛选
function handleCategoryFilter(category) {
    currentCategory = category;
    
    // 更新活跃标签
    filterTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });

    // 筛选数据
    if (category === 'all') {
        filteredPrompts = [...allPrompts];
    } else {
        filteredPrompts = allPrompts.filter(prompt => prompt.category === category);
    }

    // 如果有搜索词，继续应用搜索筛选
    const query = searchInput.value.trim();
    if (query) {
        handleSearch();
    } else {
        renderPrompts();
    }
}

// 处理导航
function handleNavigation(target) {
    // 更新导航状态
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${target}`);
    });

    // 显示对应内容
    const sections = ['templates-section', 'favorites-section'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'none';
        }
    });

    if (target === 'favorites') {
        document.getElementById('favorites-section').style.display = 'block';
        renderFavorites();
    } else {
        document.querySelector('.templates-section').style.display = 'block';
    }

    // 滚动到对应位置
    if (target === 'home') {
        document.querySelector('.hero').scrollIntoView({ behavior: 'smooth' });
    } else if (target === 'templates') {
        document.querySelector('.templates-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// 复制提示词
function copyPrompt(promptText) {
    navigator.clipboard.writeText(promptText).then(() => {
        showToast('提示词已复制到剪贴板！');
    }).catch(err => {
        console.error('复制失败:', err);
        showToast('复制失败，请手动复制', 'error');
    });
}

// 查看提示词详情
function viewPrompt(promptId) {
    const prompt = allPrompts.find(p => p.id === promptId);
    if (!prompt) return;

    document.getElementById('modal-title').textContent = prompt.title;
    document.getElementById('modal-category').textContent = getCategoryName(prompt.category);
    document.getElementById('modal-tags').innerHTML = 
        prompt.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    document.getElementById('modal-prompt').textContent = prompt.prompt;
    document.getElementById('modal-usage-text').textContent = prompt.usage;
    document.getElementById('modal-example-text').textContent = prompt.example;

    // 设置复制按钮
    const modalCopyBtn = document.getElementById('modal-copy-btn');
    modalCopyBtn.onclick = () => copyPrompt(prompt.prompt);

    modal.style.display = 'block';
}

// 关闭模态框
function closeModal() {
    modal.style.display = 'none';
}

// 切换收藏状态
function toggleFavorite(promptId) {
    const index = favorites.indexOf(promptId);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(promptId);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoritesCount();
    
    // 更新当前页面的收藏按钮状态
    const favoriteBtn = document.querySelector(`button[onclick="toggleFavorite(${promptId})"]`);
    if (favoriteBtn) {
        favoriteBtn.classList.toggle('active');
    }
    
    // 如果当前在收藏页面，重新渲染
    if (document.getElementById('favorites-section').style.display === 'block') {
        renderFavorites();
    }
}

// 渲染收藏夹
function renderFavorites() {
    const favoritePrompts = allPrompts.filter(prompt => favorites.includes(prompt.id));
    
    if (favoritePrompts.length === 0) {
        favoritesGrid.style.display = 'none';
        document.getElementById('empty-favorites').style.display = 'block';
        return;
    }
    
    document.getElementById('empty-favorites').style.display = 'none';
    favoritesGrid.style.display = 'grid';
    favoritesGrid.innerHTML = '';
    
    favoritePrompts.forEach(prompt => {
        const card = createPromptCard(prompt);
        favoritesGrid.appendChild(card);
    });
}

// 更新收藏数量
function updateFavoritesCount() {
    // 这里可以添加收藏数量的显示逻辑
}

// 更新总数统计
function updateTotalCount() {
    const totalElement = document.getElementById('totalPrompts');
    if (totalElement) {
        const count = allPrompts.length;
        totalElement.textContent = count;

        // 如果是内嵌数据（少于85个），显示提示
        if (count < 85) {
            showServerNotice();
        }
    }
}

// 显示加载状态
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

// 显示无结果状态
function showNoResults(show) {
    noResults.style.display = show ? 'block' : 'none';
}

// 显示错误信息
function showError(message) {
    showToast(message, 'error');
}

// 显示服务器提示
function showServerNotice() {
    const notice = document.getElementById('serverNotice');
    if (notice) {
        notice.style.display = 'block';
    }
}

// 显示提示信息
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
        color: white;
        border-radius: 6px;
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 获取内嵌的提示词数据（用于直接浏览器访问）
// 注意：由于文件大小限制，这里只包含前20个模板作为示例
// 完整的85个模板请通过服务器访问 data/prompts.json 文件
function getEmbeddedPrompts() {
    return [
        {
            "id": 1,
            "title": "代码审查助手",
            "category": "programming",
            "description": "帮助审查代码质量、发现潜在问题并提供改进建议",
            "tags": ["代码审查", "质量检测", "最佳实践"],
            "prompt": "请作为一名资深的代码审查专家，仔细分析以下代码：\n\n[在此处粘贴代码]\n\n请从以下几个方面进行评估：\n1. 代码质量和可读性\n2. 性能优化建议\n3. 安全性问题\n4. 最佳实践遵循情况\n5. 潜在的bug或错误\n\n请提供具体的改进建议和修改后的代码示例。",
            "usage": "将需要审查的代码粘贴到指定位置，AI会从多个维度分析代码质量",
            "example": "适用于任何编程语言的代码审查，特别是JavaScript、Python、Java等主流语言"
        },
        {
            "id": 2,
            "title": "API文档生成器",
            "category": "programming",
            "description": "根据代码自动生成清晰、详细的API文档",
            "tags": ["API文档", "自动生成", "开发文档"],
            "prompt": "请根据以下代码生成专业的API文档：\n\n[在此处粘贴API代码]\n\n文档应包含：\n1. 接口概述和用途\n2. 请求方法和URL\n3. 请求参数详细说明（类型、是否必需、默认值、示例）\n4. 响应格式和字段说明\n5. 错误码和错误处理\n6. 完整的请求和响应示例\n7. 使用注意事项\n\n请使用Markdown格式输出，确保文档清晰易读。",
            "usage": "粘贴API相关代码，自动生成标准化的API文档",
            "example": "支持REST API、GraphQL等各种API类型的文档生成"
        },
        {
            "id": 3,
            "title": "Bug修复助手",
            "category": "programming",
            "description": "分析错误信息，提供详细的修复方案和预防措施",
            "tags": ["Bug修复", "错误分析", "调试"],
            "prompt": "我遇到了一个编程问题，请帮我分析和解决：\n\n**错误描述：**\n[描述具体的错误现象]\n\n**错误信息：**\n[粘贴完整的错误日志或堆栈跟踪]\n\n**相关代码：**\n[粘贴出现问题的代码片段]\n\n**运行环境：**\n[说明编程语言版本、框架版本、操作系统等]\n\n请提供：\n1. 错误原因的详细分析\n2. 具体的修复步骤\n3. 修改后的代码示例\n4. 如何预防类似问题\n5. 相关的最佳实践建议",
            "usage": "详细描述遇到的bug，包括错误信息和相关代码，获得专业的修复指导",
            "example": "适用于各种编程语言和框架的bug修复，如React报错、Python异常、数据库连接问题等"
        },
        {
            "id": 4,
            "title": "算法优化顾问",
            "category": "programming",
            "description": "分析算法复杂度，提供性能优化建议和更高效的实现方案",
            "tags": ["算法优化", "性能提升", "复杂度分析"],
            "prompt": "请作为算法专家，帮我优化以下代码的性能：\n\n**当前实现：**\n[粘贴需要优化的代码]\n\n**使用场景：**\n[描述代码的具体使用场景和数据规模]\n\n**性能要求：**\n[说明对性能的具体要求]\n\n请提供：\n1. 当前算法的时间和空间复杂度分析\n2. 性能瓶颈识别\n3. 优化后的算法实现\n4. 优化前后的复杂度对比\n5. 在不同数据规模下的性能预期\n6. 是否有其他更适合的算法或数据结构",
            "usage": "提供需要优化的算法代码和使用场景，获得专业的性能优化建议",
            "example": "适用于排序算法、搜索算法、动态规划、图算法等各种算法优化需求"
        },
        {
            "id": 5,
            "title": "营销文案创作师",
            "category": "marketing",
            "description": "创作吸引人的营销文案，提高转化率和用户参与度",
            "tags": ["营销文案", "转化率", "品牌推广"],
            "prompt": "请作为资深营销文案专家，为我创作高转化率的营销文案：\n\n**产品/服务：**\n[详细描述你的产品或服务]\n\n**目标受众：**\n[描述目标客户群体的特征、需求、痛点]\n\n**营销目标：**\n[说明具体的营销目标，如提高销量、增加注册、品牌认知等]\n\n**使用场景：**\n[说明文案的使用场景，如广告投放、邮件营销、社交媒体等]\n\n**品牌调性：**\n[描述品牌的风格和调性，如专业、亲和、创新等]\n\n请提供：\n1. 3-5个不同风格的文案版本\n2. 每个版本的核心卖点和策略说明\n3. 适合的使用场景建议\n4. 预期的用户反应和转化效果\n5. 进一步优化的建议",
            "usage": "详细描述产品和目标受众，获得多个版本的专业营销文案",
            "example": "适用于产品推广、服务介绍、活动宣传、品牌故事等各种营销场景"
        },
        {
            "id": 6,
            "title": "社交媒体内容策划",
            "category": "marketing",
            "description": "制定社交媒体内容策略，提高粉丝互动和品牌影响力",
            "tags": ["社交媒体", "内容策划", "粉丝互动"],
            "prompt": "请作为社交媒体运营专家，为我制定内容策略：\n\n**品牌信息：**\n[描述品牌定位、核心价值、目标市场]\n\n**平台选择：**\n[说明主要运营的社交媒体平台，如微博、抖音、小红书、Instagram等]\n\n**目标受众：**\n[详细描述目标粉丝群体的特征和偏好]\n\n**运营目标：**\n[说明具体目标，如增粉、提高互动率、品牌曝光等]\n\n**内容偏好：**\n[说明偏好的内容类型，如教程、娱乐、资讯等]\n\n请提供：\n1. 一周的内容发布计划\n2. 每天的具体内容创意和文案\n3. 最佳发布时间建议\n4. 互动策略和话题标签\n5. 内容效果评估指标\n6. 长期内容策略规划",
            "usage": "提供品牌信息和运营目标，获得完整的社交媒体内容策略",
            "example": "适用于各种社交媒体平台的内容运营，包括图文、视频、直播等形式"
        },
        {
            "id": 7,
            "title": "学术论文写作助手",
            "category": "writing",
            "description": "协助撰写高质量的学术论文，包括结构规划和内容优化",
            "tags": ["学术写作", "论文结构", "研究方法"],
            "prompt": "请作为学术写作专家，协助我撰写学术论文：\n\n**研究主题：**\n[详细描述研究主题和研究问题]\n\n**学科领域：**\n[说明所属的学科领域]\n\n**论文类型：**\n[说明是期刊论文、会议论文、学位论文等]\n\n**目标期刊/会议：**\n[如果有明确目标，请说明]\n\n**现有材料：**\n[描述已有的研究数据、文献综述、实验结果等]\n\n**具体需求：**\n[说明需要帮助的具体方面，如摘要、引言、方法论、结论等]\n\n请提供：\n1. 论文整体结构建议\n2. 各章节的写作要点和逻辑框架\n3. 具体的写作内容和表达建议\n4. 学术规范和格式要求\n5. 参考文献的引用建议\n6. 语言表达的优化建议",
            "usage": "提供研究主题和现有材料，获得专业的学术写作指导",
            "example": "适用于各学科的学术论文写作，包括理工科、人文社科等领域"
        },
        {
            "id": 8,
            "title": "创意故事生成器",
            "category": "writing",
            "description": "根据关键词和设定创作引人入胜的故事情节",
            "tags": ["创意写作", "故事创作", "情节设计"],
            "prompt": "请作为创意写作专家，为我创作一个引人入胜的故事：\n\n**故事类型：**\n[说明故事类型，如科幻、悬疑、爱情、冒险等]\n\n**故事长度：**\n[说明期望的故事长度，如短篇、中篇、章节等]\n\n**核心元素：**\n[提供故事的核心元素，如主角设定、背景环境、关键物品等]\n\n**情感基调：**\n[说明希望的情感基调，如轻松幽默、紧张刺激、温馨感人等]\n\n**特殊要求：**\n[如果有特殊要求，如特定的结局、必须包含的情节等]\n\n请提供：\n1. 完整的故事大纲\n2. 主要角色的详细设定\n3. 关键情节的详细描述\n4. 对话和场景的生动描写\n5. 故事的高潮和结局\n6. 如果需要，可以提供续集的可能性",
            "usage": "提供故事类型和核心元素，获得完整的创意故事",
            "example": "适用于小说创作、剧本写作、游戏剧情、广告故事等各种创意写作需求"
        },
        {
            "id": 9,
            "title": "商业计划书撰写",
            "category": "business",
            "description": "协助撰写专业的商业计划书，包括市场分析和财务预测",
            "tags": ["商业计划", "市场分析", "财务预测"],
            "prompt": "请作为商业顾问，协助我撰写专业的商业计划书：\n\n**项目概述：**\n[详细描述商业项目的核心理念和价值主张]\n\n**行业背景：**\n[说明所在行业的基本情况和发展趋势]\n\n**目标市场：**\n[描述目标客户群体和市场规模]\n\n**竞争情况：**\n[分析主要竞争对手和竞争优势]\n\n**资金需求：**\n[说明资金需求和用途]\n\n**团队情况：**\n[介绍核心团队成员和能力]\n\n请提供：\n1. 完整的商业计划书结构\n2. 执行摘要的精炼表述\n3. 详细的市场分析和竞争分析\n4. 营销策略和销售计划\n5. 运营计划和管理团队介绍\n6. 财务预测和风险分析\n7. 融资计划和退出策略",
            "usage": "提供项目基本信息，获得完整的商业计划书框架和内容",
            "example": "适用于创业融资、项目申报、合作洽谈等各种商业场景"
        },
        {
            "id": 10,
            "title": "数据分析报告生成",
            "category": "business",
            "description": "将数据转化为有洞察力的分析报告和商业建议",
            "tags": ["数据分析", "商业洞察", "决策支持"],
            "prompt": "请作为数据分析专家，帮我生成专业的数据分析报告：\n\n**数据背景：**\n[描述数据的来源、时间范围、业务背景]\n\n**分析目标：**\n[说明分析的具体目标和要解决的业务问题]\n\n**数据概况：**\n[提供数据的基本统计信息或粘贴数据样本]\n\n**关注指标：**\n[说明重点关注的业务指标和KPI]\n\n**受众对象：**\n[说明报告的目标受众，如管理层、业务团队等]\n\n请提供：\n1. 数据质量评估和清洗建议\n2. 关键指标的趋势分析\n3. 深层次的数据洞察和发现\n4. 可视化图表的建议和说明\n5. 业务影响分析和原因解释\n6. 具体的行动建议和改进方案\n7. 风险提示和注意事项",
            "usage": "提供数据背景和分析目标，获得专业的数据分析报告",
            "example": "适用于销售数据分析、用户行为分析、市场研究、运营效果评估等"
        },
        {
            "id": 11,
            "title": "英文学术翻译",
            "category": "translation",
            "description": "提供准确、专业的英文学术文献翻译服务",
            "tags": ["学术翻译", "英文翻译", "专业术语"],
            "prompt": "请作为专业的学术翻译专家，为我翻译以下学术内容：\n\n**原文：**\n[在此粘贴需要翻译的英文内容]\n\n**学科领域：**\n[说明文献所属的学科领域，如计算机科学、生物医学、经济学等]\n\n**翻译要求：**\n[说明特殊要求，如保持学术严谨性、术语统一性等]\n\n**目标用途：**\n[说明翻译后的用途，如学习理解、论文引用、研究参考等]\n\n请提供：\n1. 准确流畅的中文翻译\n2. 专业术语的准确对应\n3. 重要概念的注释说明\n4. 语言表达的优化建议\n5. 如有歧义，提供多种理解可能\n6. 原文结构和逻辑的保持",
            "usage": "粘贴英文学术内容，获得专业准确的中文翻译",
            "example": "适用于学术论文、研究报告、技术文档、会议摘要等学术材料的翻译"
        },
        {
            "id": 12,
            "title": "中英文润色专家",
            "category": "translation",
            "description": "对中英文文本进行专业润色，提高语言表达质量",
            "tags": ["文本润色", "语言优化", "表达改进"],
            "prompt": "请作为语言润色专家，帮我优化以下文本的表达：\n\n**原文：**\n[在此粘贴需要润色的文本]\n\n**文本类型：**\n[说明文本类型，如学术论文、商业报告、营销文案、个人陈述等]\n\n**目标受众：**\n[描述目标读者群体]\n\n**语言要求：**\n[说明语言风格要求，如正式、亲和、专业、创新等]\n\n**润色重点：**\n[说明重点关注的方面，如语法、逻辑、表达、风格等]\n\n请提供：\n1. 润色后的完整文本\n2. 主要修改点的详细说明\n3. 语言表达的改进建议\n4. 逻辑结构的优化建议\n5. 词汇选择的替换建议\n6. 整体风格的统一性检查",
            "usage": "提供需要润色的文本和具体要求，获得专业的语言优化服务",
            "example": "适用于各种类型文本的语言优化，包括学术写作、商务沟通、创意文案等"
        },
        {
            "id": 13,
            "title": "UI/UX设计建议",
            "category": "design",
            "description": "提供用户界面和用户体验的专业设计建议",
            "tags": ["UI设计", "UX设计", "用户体验"],
            "prompt": "请作为UI/UX设计专家，为我的项目提供设计建议：\n\n**项目类型：**\n[描述项目类型，如网站、移动应用、桌面软件等]\n\n**目标用户：**\n[详细描述目标用户群体的特征和使用习惯]\n\n**核心功能：**\n[说明产品的核心功能和主要使用场景]\n\n**设计目标：**\n[说明设计目标，如提高转化率、改善用户体验、增强品牌形象等]\n\n**现有设计：**\n[如果有现有设计，请描述或提供链接]\n\n**技术限制：**\n[说明技术实现的限制条件]\n\n请提供：\n1. 整体设计策略和设计原则\n2. 用户界面布局和信息架构建议\n3. 交互流程和用户路径优化\n4. 视觉设计风格和色彩方案\n5. 响应式设计和适配建议\n6. 可用性测试和改进建议\n7. 设计规范和组件库建议",
            "usage": "描述项目需求和目标用户，获得专业的UI/UX设计指导",
            "example": "适用于网站设计、App界面、软件界面、小程序等各种数字产品的设计优化"
        },
        {
            "id": 14,
            "title": "品牌视觉设计指导",
            "category": "design",
            "description": "提供品牌视觉识别系统的设计建议和创意方向",
            "tags": ["品牌设计", "视觉识别", "创意设计"],
            "prompt": "请作为品牌设计专家，为我的品牌提供视觉设计指导：\n\n**品牌信息：**\n[详细描述品牌的定位、价值观、目标市场]\n\n**行业特点：**\n[说明所在行业的特点和设计趋势]\n\n**品牌个性：**\n[描述希望传达的品牌个性，如专业、创新、亲和、高端等]\n\n**应用场景：**\n[说明品牌视觉的主要应用场景，如网站、包装、广告等]\n\n**参考偏好：**\n[如果有喜欢的设计风格或参考案例，请说明]\n\n**预算考虑：**\n[说明设计预算范围和实现难度要求]\n\n请提供：\n1. 品牌视觉策略和设计方向\n2. Logo设计理念和创意方案\n3. 色彩系统和配色方案\n4. 字体选择和排版规范\n5. 图形元素和视觉语言\n6. 应用系统的设计规范\n7. 品牌延展和应用建议",
            "usage": "提供品牌基本信息和设计需求，获得完整的品牌视觉设计方案",
            "example": "适用于新品牌创建、品牌升级、视觉识别系统设计等品牌设计需求"
        },
        {
            "id": 15,
            "title": "个性化学习计划",
            "category": "education",
            "description": "根据个人情况制定科学有效的学习计划和方法",
            "tags": ["学习计划", "个性化教育", "学习方法"],
            "prompt": "请作为教育专家，为我制定个性化的学习计划：\n\n**学习目标：**\n[详细描述想要达成的学习目标]\n\n**当前水平：**\n[说明在该领域的当前知识水平和技能基础]\n\n**可用时间：**\n[说明每天/每周可以投入的学习时间]\n\n**学习偏好：**\n[描述个人的学习偏好和习惯，如视觉学习、实践学习等]\n\n**资源限制：**\n[说明可用的学习资源和预算限制]\n\n**时间期限：**\n[说明希望达成目标的时间期限]\n\n**特殊需求：**\n[如果有特殊需求或困难，请说明]\n\n请提供：\n1. 详细的学习路径和阶段划分\n2. 每个阶段的具体学习内容和目标\n3. 推荐的学习资源和材料\n4. 学习方法和技巧建议\n5. 进度检查和评估方式\n6. 常见困难的解决方案\n7. 学习动机维持的建议",
            "usage": "提供学习目标和个人情况，获得科学的个性化学习计划",
            "example": "适用于语言学习、技能培训、考试准备、职业发展等各种学习需求"
        },
        {
            "id": 16,
            "title": "面试准备助手",
            "category": "education",
            "description": "提供全面的面试准备指导，包括常见问题和回答技巧",
            "tags": ["面试准备", "求职指导", "职业发展"],
            "prompt": "请作为职业发展顾问，帮我准备即将到来的面试：\n\n**职位信息：**\n[详细描述应聘的职位和公司信息]\n\n**个人背景：**\n[说明个人的教育背景、工作经验、技能特长]\n\n**面试类型：**\n[说明面试类型，如电话面试、视频面试、现场面试等]\n\n**关注重点：**\n[说明特别关注的方面，如技术能力、沟通能力、领导力等]\n\n**担心问题：**\n[说明担心被问到的问题或薄弱环节]\n\n请提供：\n1. 常见面试问题及标准回答模板\n2. 针对该职位的专业问题准备\n3. 个人优势的包装和表达方式\n4. 薄弱环节的应对策略\n5. 面试礼仪和注意事项\n6. 反向提问的建议\n7. 面试后的跟进策略",
            "usage": "提供职位信息和个人背景，获得全面的面试准备指导",
            "example": "适用于各种职位的面试准备，包括技术岗位、管理岗位、销售岗位等"
        },
        {
            "id": 17,
            "title": "产品需求文档撰写",
            "category": "business",
            "description": "协助撰写清晰、完整的产品需求文档(PRD)",
            "tags": ["产品需求", "PRD", "产品管理"],
            "prompt": "请作为产品经理，帮我撰写专业的产品需求文档：\n\n**产品概述：**\n[描述产品的基本概念和核心价值]\n\n**目标用户：**\n[详细描述目标用户群体和使用场景]\n\n**核心功能：**\n[列出产品的核心功能和特性]\n\n**业务目标：**\n[说明产品要达成的业务目标和成功指标]\n\n**技术约束：**\n[说明技术实现的限制和要求]\n\n**时间计划：**\n[说明产品开发的时间计划和里程碑]\n\n请提供：\n1. 完整的PRD文档结构\n2. 详细的功能需求描述\n3. 用户故事和使用流程\n4. 界面原型和交互说明\n5. 技术需求和接口定义\n6. 测试用例和验收标准\n7. 风险评估和应对方案",
            "usage": "提供产品基本信息，获得完整的产品需求文档",
            "example": "适用于各种产品的需求文档撰写，包括Web产品、移动应用、企业软件等"
        },
        {
            "id": 18,
            "title": "SQL查询优化师",
            "category": "programming",
            "description": "分析和优化SQL查询性能，提供最佳实践建议",
            "tags": ["SQL优化", "数据库性能", "查询调优"],
            "prompt": "请作为数据库专家，帮我优化以下SQL查询：\n\n**当前SQL：**\n[粘贴需要优化的SQL语句]\n\n**数据库类型：**\n[说明数据库类型，如MySQL、PostgreSQL、Oracle等]\n\n**表结构信息：**\n[提供相关表的结构和索引信息]\n\n**数据规模：**\n[说明表的数据量和查询频率]\n\n**性能问题：**\n[描述当前遇到的性能问题]\n\n**业务需求：**\n[说明查询的业务目的和要求]\n\n请提供：\n1. 当前SQL的性能分析\n2. 优化后的SQL语句\n3. 索引创建和优化建议\n4. 查询执行计划分析\n5. 性能提升预期\n6. 数据库配置优化建议\n7. 监控和维护建议",
            "usage": "提供SQL语句和数据库信息，获得专业的查询优化建议",
            "example": "适用于各种数据库的SQL优化，包括复杂查询、报表查询、实时查询等"
        },
        {
            "id": 19,
            "title": "正则表达式生成器",
            "category": "programming",
            "description": "根据需求生成准确的正则表达式并提供详细解释",
            "tags": ["正则表达式", "文本处理", "模式匹配"],
            "prompt": "请作为正则表达式专家，帮我生成符合需求的正则表达式：\n\n**匹配需求：**\n[详细描述需要匹配的文本模式]\n\n**示例文本：**\n[提供需要匹配的正面和负面示例]\n\n**使用环境：**\n[说明使用的编程语言或工具，如JavaScript、Python、grep等]\n\n**特殊要求：**\n[说明特殊要求，如大小写敏感、多行匹配等]\n\n**性能考虑：**\n[说明是否有性能要求或文本量很大]\n\n请提供：\n1. 完整的正则表达式\n2. 表达式的详细解释\n3. 各部分的含义说明\n4. 匹配示例和测试用例\n5. 常见陷阱和注意事项\n6. 性能优化建议\n7. 替代方案（如果有）",
            "usage": "描述匹配需求和示例，获得准确的正则表达式和详细解释",
            "example": "适用于邮箱验证、电话号码提取、日期格式匹配、文本清洗等各种文本处理需求"
        },
        {
            "id": 20,
            "title": "邮件营销模板",
            "category": "marketing",
            "description": "创建高转化率的邮件营销内容和模板",
            "tags": ["邮件营销", "EDM", "客户沟通"],
            "prompt": "请作为邮件营销专家，为我创建高效的邮件营销内容：\n\n**邮件目的：**\n[说明邮件的具体目的，如产品推广、客户挽回、活动通知等]\n\n**目标受众：**\n[详细描述邮件接收者的特征和需求]\n\n**产品/服务：**\n[描述要推广的产品或服务]\n\n**核心卖点：**\n[说明产品的核心优势和卖点]\n\n**行动目标：**\n[说明希望用户采取的具体行动]\n\n**品牌调性：**\n[描述品牌的风格和语调]\n\n**发送时机：**\n[说明邮件的发送时机和背景]\n\n请提供：\n1. 吸引人的邮件主题行（多个版本）\n2. 完整的邮件正文内容\n3. 清晰的CTA（行动召唤）设计\n4. 邮件结构和排版建议\n5. 个性化元素的使用建议\n6. A/B测试的变量建议\n7. 效果评估指标和优化方向",
            "usage": "提供邮件目的和目标受众信息，获得完整的邮件营销方案",
            "example": "适用于各种邮件营销场景，包括新品发布、促销活动、客户关怀、会员通知等"
        }
    ];
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
