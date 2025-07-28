# 🤝 贡献指南 | Contributing Guide

感谢你对 AI提示词模板库 项目的关注！我们欢迎所有形式的贡献，无论是新的提示词模板、功能改进、bug修复还是文档完善。

## 📋 目录

- [贡献方式](#贡献方式)
- [开发环境设置](#开发环境设置)
- [提交流程](#提交流程)
- [代码规范](#代码规范)
- [模板规范](#模板规范)
- [问题反馈](#问题反馈)
- [社区准则](#社区准则)

## 🎯 贡献方式

### 1. 提交新的提示词模板

这是最受欢迎的贡献方式！我们需要更多高质量的提示词模板。

**适合贡献的模板类型：**
- 编程开发相关（代码审查、调试、优化等）
- 写作文案相关（学术写作、创意写作、商业文案等）
- 设计创意相关（UI/UX设计、品牌设计等）
- 营销推广相关（社交媒体、邮件营销等）
- 教育学习相关（学习计划、知识总结等）
- 商业分析相关（数据分析、市场研究等）
- 翻译润色相关（多语言翻译、文本优化等）

### 2. 改进现有模板

- 优化提示词的表达和逻辑
- 添加更详细的使用说明
- 提供更好的使用示例
- 修正错误或不准确的内容

### 3. 功能开发

- 新增实用功能
- 改进用户体验
- 性能优化
- 移动端适配改进

### 4. 文档完善

- 改进README文档
- 添加使用教程
- 翻译文档到其他语言
- 完善代码注释

## 🛠️ 开发环境设置

### 前置要求

- 现代浏览器（Chrome、Firefox、Safari、Edge等）
- 文本编辑器（VS Code、Sublime Text等）
- Git 版本控制工具
- 基础的HTML、CSS、JavaScript知识

### 本地开发

1. **Fork 项目**
   ```bash
   # 在GitHub上点击Fork按钮，然后克隆你的fork
   git clone https://github.com/yourusername/AI-Prompt-Templates-Hub.git
   cd AI-Prompt-Templates-Hub
   ```

2. **启动本地服务器**
   ```bash
   # 方法1: 使用Python
   python -m http.server 8000
   
   # 方法2: 使用Node.js
   npx serve .
   
   # 方法3: 使用PHP
   php -S localhost:8000
   ```

3. **在浏览器中访问**
   ```
   http://localhost:8000
   ```

## 📝 提交流程

### 1. 创建分支

```bash
# 创建并切换到新分支
git checkout -b feature/your-feature-name

# 或者修复bug的分支
git checkout -b fix/your-bug-fix
```

### 2. 进行更改

- 添加新的提示词模板到 `data/prompts.json`
- 修改代码或文档
- 确保更改符合项目规范

### 3. 测试更改

- 在本地测试所有功能是否正常
- 确保新添加的模板能正确显示
- 检查响应式设计在不同设备上的表现

### 4. 提交更改

```bash
# 添加更改的文件
git add .

# 提交更改（使用清晰的提交信息）
git commit -m "feat: 添加营销文案相关的提示词模板"

# 推送到你的fork
git push origin feature/your-feature-name
```

### 5. 创建 Pull Request

1. 在GitHub上访问你的fork
2. 点击 "New Pull Request"
3. 填写详细的PR描述
4. 等待代码审查

## 📐 代码规范

### HTML规范

- 使用语义化的HTML标签
- 保持良好的缩进（2个空格）
- 添加必要的注释
- 确保可访问性（添加alt属性、aria标签等）

### CSS规范

- 使用BEM命名规范
- 保持样式的模块化
- 使用CSS变量定义颜色和尺寸
- 确保响应式设计

### JavaScript规范

- 使用ES6+语法
- 保持函数的单一职责
- 添加必要的错误处理
- 使用有意义的变量和函数名
- 添加JSDoc注释

```javascript
/**
 * 处理搜索功能
 * @param {string} query - 搜索关键词
 * @returns {Array} 筛选后的结果
 */
function handleSearch(query) {
    // 实现代码
}
```

## 📋 模板规范

### 模板质量要求

1. **实用性** - 模板必须解决实际问题
2. **清晰性** - 提示词表达清晰，逻辑明确
3. **完整性** - 包含完整的使用说明和示例
4. **准确性** - 内容准确，无误导信息
5. **原创性** - 避免直接复制他人的内容

### JSON格式规范

```json
{
  "id": 21,
  "title": "模板标题（简洁明确）",
  "category": "分类标识（programming/writing/design/marketing/education/business/translation/other）",
  "description": "简短描述模板的用途和价值（50-100字）",
  "tags": ["标签1", "标签2", "标签3"],
  "prompt": "完整的提示词内容，包含占位符和详细说明",
  "usage": "详细的使用方法说明",
  "example": "具体的使用示例和适用场景"
}
```

### 提示词编写规范

1. **结构清晰**
   ```
   请作为[角色定位]，帮我[具体任务]：
   
   **输入信息：**
   [用户需要提供的信息]
   
   **输出要求：**
   [期望的输出格式和内容]
   
   请提供：
   1. [具体要求1]
   2. [具体要求2]
   ...
   ```

2. **占位符使用**
   - 使用 `[描述]` 格式标记需要用户填写的部分
   - 提供清晰的填写说明
   - 给出具体的示例

3. **角色定位**
   - 明确AI应该扮演的专业角色
   - 设定合适的专业背景和能力

## 🐛 问题反馈

### 报告Bug

使用 [GitHub Issues](https://github.com/yourusername/AI-Prompt-Templates-Hub/issues) 报告问题时，请包含：

1. **问题描述** - 清晰描述遇到的问题
2. **重现步骤** - 详细的操作步骤
3. **预期行为** - 你期望发生什么
4. **实际行为** - 实际发生了什么
5. **环境信息** - 浏览器版本、操作系统等
6. **截图** - 如果有助于理解问题

### 功能建议

提出新功能建议时，请说明：

1. **功能描述** - 详细描述建议的功能
2. **使用场景** - 什么情况下会用到这个功能
3. **用户价值** - 这个功能能解决什么问题
4. **实现建议** - 如果有技术建议请提出

## 🌟 社区准则

### 行为准则

- **友善包容** - 尊重所有贡献者，无论技术水平如何
- **建设性沟通** - 提供有建设性的反馈和建议
- **协作精神** - 乐于帮助他人，分享知识
- **质量导向** - 关注代码和内容的质量

### 代码审查

- 所有PR都需要经过代码审查
- 审查者会关注代码质量、功能完整性和用户体验
- 请耐心等待审查，并积极回应反馈
- 审查通过后会合并到主分支

## 🎉 贡献者认可

我们会在以下方式认可贡献者：

- 在README中列出贡献者
- 在发布说明中感谢贡献者
- 为优秀贡献者提供推荐信
- 邀请活跃贡献者成为项目维护者

## 📞 联系方式

如果你有任何问题或建议，可以通过以下方式联系我们：

- **GitHub Issues**: [提交问题](https://github.com/yourusername/AI-Prompt-Templates-Hub/issues)
- **GitHub Discussions**: [参与讨论](https://github.com/yourusername/AI-Prompt-Templates-Hub/discussions)
- **邮箱**: your.email@example.com

## 📚 学习资源

如果你是新手，以下资源可能对你有帮助：

- [Git 基础教程](https://git-scm.com/book/zh/v2)
- [GitHub 使用指南](https://docs.github.com/cn)
- [HTML/CSS/JavaScript 教程](https://developer.mozilla.org/zh-CN/)
- [开源贡献指南](https://opensource.guide/zh-hans/)

---

再次感谢你的贡献！让我们一起打造更好的AI提示词模板库！ 🚀
