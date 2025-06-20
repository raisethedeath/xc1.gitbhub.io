// 视频数据存储结构
let videos = [];
let currentVideo = null;
let currentChapter = null;

// DOM元素
const videoPlayer = document.getElementById('videoPlayer');
const videoTitle = document.getElementById('videoTitle');
const videoDescription = document.getElementById('videoDescription');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const chaptersContainer = document.getElementById('chaptersContainer');

// 页面初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 加载视频数据
    await loadVideos();
    
    // 初始化页面
    if (window.location.pathname.includes('upload.html')) {
        initUploadPage();
    } else {
        initHomePage();
    }
    
    // 设置导航按钮事件
    document.getElementById('homeBtn')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
    
    document.getElementById('uploadBtn')?.addEventListener('click', () => {
        window.location.href = 'upload.html';
    });
    
    document.getElementById('backBtn')?.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

// 加载视频数据
async function loadVideos() {
    try {
        const response = await fetch('videos.json');
        videos = await response.json();
        console.log('视频数据加载成功:', videos);
    } catch (error) {
        console.error('加载视频数据失败:', error);
        videos = [];
    }
}

// 初始化主页
function initHomePage() {
    // 如果没有视频数据，显示空状态
    if (videos.length === 0) {
        videoTitle.textContent = '暂无视频内容';
        return;
    }
    
    // 默认加载第一个视频
    playVideo(videos[0]);
    
    // 设置视频进度监听
    videoPlayer.addEventListener('timeupdate', updateProgress);
}

// 播放视频
function playVideo(video) {
    currentVideo = video;
    currentChapter = null;
    
    // 更新播放器
    videoPlayer.src = video.url;
    videoTitle.textContent = video.title;
    videoDescription.textContent = video.description;
    
    // 加载进度
    const progress = localStorage.getItem(`progress_${video.id}`) || 0;
    progressBar.value = progress;
    progressText.textContent = `${progress}%`;
    
    // 生成章节列表
    renderChapters(video.chapters);
    
    // 尝试播放
    videoPlayer.play().catch(e => console.log('自动播放被阻止:', e));
}

// 更新进度
function updateProgress() {
    if (!currentVideo) return;
    
    const progress = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    progressBar.value = progress;
    progressText.textContent = `${progress.toFixed(1)}%`;
    
    // 保存进度
    localStorage.setItem(`progress_${currentVideo.id}`, progress);
    
    // 更新章节状态
    updateChapterHighlight();
}

// 渲染章节
function renderChapters(chapters) {
    chaptersContainer.innerHTML = '';
    
    chapters.forEach(chapter => {
        const chapterEl = document.createElement('div');
        chapterEl.className = 'chapter-card';
        chapterEl.innerHTML = `
            <h4>${chapter.title}</h4>
            <p>开始时间: ${formatTime(chapter.startTime)}</p>
        `;
        
        chapterEl.addEventListener('click', () => {
            jumpToChapter(chapter);
        });
        
        chaptersContainer.appendChild(chapterEl);
    });
}

// 跳转到章节
function jumpToChapter(chapter) {
    if (!currentVideo) return;
    
    videoPlayer.currentTime = chapter.startTime;
    currentChapter = chapter;
    
    // 更新章节高亮
    updateChapterHighlight();
}

// 更新章节高亮
function updateChapterHighlight() {
    if (!currentVideo || !videoPlayer.duration) return;
    
    const chapterCards = document.querySelectorAll('.chapter-card');
    let currentChapterIndex = -1;
    
    // 找到当前章节
    currentVideo.chapters.forEach((chapter, index) => {
        const isActive = videoPlayer.currentTime >= chapter.startTime && 
                         (index === currentVideo.chapters.length - 1 || 
                         videoPlayer.currentTime < currentVideo.chapters[index + 1].startTime);
        
        chapterCards[index].classList.toggle('active', isActive);
        
        if (isActive) {
            currentChapterIndex = index;
        }
    });
}

// 格式化时间
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// 初始化上传页面
function initUploadPage() {
    const chaptersForm = document.getElementById('chaptersForm');
    const addChapterBtn = document.getElementById('addChapterBtn');
    const uploadForm = document.getElementById('uploadForm');
    const uploadStatus = document.getElementById('uploadStatus');
    
    // 添加章节按钮
    addChapterBtn.addEventListener('click', () => {
        const chapterItem = document.createElement('div');
        chapterItem.className = 'chapter-item';
        chapterItem.innerHTML = `
            <input type="text" placeholder="章节标题" class="chapter-title" required>
            <input type="number" placeholder="开始时间(秒)" min="0" class="chapter-time" required>
            <button type="button" class="remove-chapter">删除</button>
        `;
        
        chapterItem.querySelector('.remove-chapter').addEventListener('click', () => {
            chapterItem.remove();
        });
        
        chaptersForm.appendChild(chapterItem);
    });
    
    // 表单提交
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // 获取表单数据
        const title = document.getElementById('videoTitle').value;
        const description = document.getElementById('videoDescription').value;
        const category = document.getElementById('videoCategory').value;
        const fileInput = document.getElementById('videoFile');
        
        // 收集章节
        const chapters = [];
        document.querySelectorAll('.chapter-item').forEach(item => {
            const title = item.querySelector('.chapter-title').value;
            const startTime = parseFloat(item.querySelector('.chapter-time').value);
            
            if (title && !isNaN(startTime)) {
                chapters.push({ title, startTime });
            }
        });
        
        // 验证数据
        if (!fileInput.files.length) {
            showUploadStatus('请选择视频文件', 'error');
            return;
        }
        
        const file = fileInput.files[0];
        
        // 显示上传状态
        showUploadStatus('上传中...', 'loading');
        
        try {
            // 在实际应用中，这里应该是上传到服务器的代码
            // 由于GitHub Pages的限制，我们模拟上传过程
            
            // 模拟上传延迟
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 创建新视频对象
            const newVideo = {
                id: Date.now().toString(),
                title,
                description,
                category,
                url: URL.createObjectURL(file), // 实际应用中应为服务器URL
                chapters,
                duration: 0 // 实际应用中应从视频元数据获取
            };
            
            // 添加到视频列表
            videos.push(newVideo);
            
            // 更新JSON文件（模拟）
            await saveVideos();
            
            showUploadStatus('上传成功！即将返回首页...', 'success');
            
            // 3秒后返回首页
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
            
        } catch (error) {
            console.error('上传失败:', error);
            showUploadStatus(`上传失败: ${error.message}`, 'error');
        }
    });
}

// 显示上传状态
function showUploadStatus(message, type) {
    const uploadStatus = document.getElementById('uploadStatus');
    uploadStatus.textContent = message;
    uploadStatus.className = '';
    
    switch (type) {
        case 'success':
            uploadStatus.classList.add('status-success');
            break;
        case 'error':
            uploadStatus.classList.add('status-error');
            break;
        case 'loading':
            uploadStatus.classList.add('status-loading');
            break;
    }
}

// 保存视频数据（模拟）
async function saveVideos() {
    // 在实际应用中，这里应该发送到服务器保存
    // 由于GitHub Pages的限制，我们只能模拟这个过程
    
    console.log('保存视频数据:', videos);
    
    // 更新本地存储（仅限演示）
    localStorage.setItem('videos', JSON.stringify(videos));
    
    // 在实际应用中，更新videos.json
    // 由于GitHub Pages是静态的，无法直接保存
    // 需要配合GitHub API或使用其他后端服务
}

// 渲染文档列表
function renderDocumentList(category = 'all') {
  const container = document.getElementById('documentsContainer');
  container.innerHTML = '';
  
  // 获取所有文档
  const allDocs = [];
  courses.forEach(course => {
    course.chapters.forEach(chapter => {
      if (chapter.type !== 'video' && chapter.docPath) {
        allDocs.push({
          title: chapter.title,
          path: chapter.docPath,
          category: course.category || 'general',
          course: course.title,
          chapterId: chapter.id,
          courseId: course.id
        });
      }
    });
  });
  
  // 过滤文档
  const filteredDocs = category === 'all' 
    ? allDocs 
    : allDocs.filter(doc => doc.category === category);
  
  // 渲染文档卡片
  filteredDocs.forEach(doc => {
    const docCard = document.createElement('div');
    docCard.className = 'doc-card';
    docCard.innerHTML = `
      <h3>${doc.title}</h3>
      <p class="doc-meta">所属课程: ${doc.course} | 分类: ${doc.category}</p>
      <button class="view-doc" data-path="${doc.path}" 
              data-course-id="${doc.courseId}" 
              data-chapter-id="${doc.chapterId}">
        查看文档
      </button>
    `;
    container.appendChild(docCard);
  });
  
  // 添加文档查看事件
  document.querySelectorAll('.view-doc').forEach(btn => {
    btn.addEventListener('click', () => {
      const docPath = btn.dataset.path;
      const courseId = btn.dataset.courseId;
      const chapterId = btn.dataset.chapterId;
      loadAndRenderDoc(docPath, courseId, chapterId);
    });
  });
}

// 加载并渲染Markdown文档
async function loadAndRenderDoc(docPath, courseId, chapterId) {
  try {
    const response = await fetch(docPath);
    const markdown = await response.text();
    
    // 使用marked解析Markdown
    const htmlContent = marked.parse(markdown);
    
    // 获取当前章节的相关视频（如果有）
    const course = courses.find(c => c.id === courseId);
    const chapter = course.chapters.find(ch => ch.id === chapterId);
    
    let videoSection = '';
    if (chapter && chapter.videoRef) {
      videoSection = `
        <div class="doc-video">
          <h3>相关视频讲解</h3>
          <video controls>
            <source src="${chapter.videoRef}" type="video/mp4">
          </video>
          ${chapter.videoDescription ? `<p>${chapter.videoDescription}</p>` : ''}
        </div>
      `;
    }
    
    // 组合内容
    const fullContent = `
      <div class="doc-header">
        <h2>${chapter.title}</h2>
        <p>所属课程: ${course.title}</p>
      </div>
      <div class="doc-body">
        <div class="markdown-content">${htmlContent}</div>
        ${videoSection}
      </div>
    `;
    
    document.getElementById('docContent').innerHTML = fullContent;
    document.getElementById('docViewerModal').style.display = 'block';
  } catch (error) {
    console.error('加载文档失败:', error);
    document.getElementById('docContent').innerHTML = `<p class="error">加载文档失败: ${error.message}</p>`;
  }
}

// 关闭模态框
document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('docViewerModal').style.display = 'none';
});

// 初始化文档页面
if (window.location.pathname.includes('docs.html')) {
  renderDocumentList();
  
  // 分类筛选
  document.querySelectorAll('#categoryList li').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('#categoryList li').forEach(li => {
        li.classList.remove('active');
      });
      item.classList.add('active');
      renderDocumentList(item.dataset.category);
    });
  });
  
  // 文档搜索
  document.getElementById('searchBtn').addEventListener('click', () => {
    const searchTerm = document.getElementById('docSearch').value.toLowerCase();
    // 实现搜索功能...
  });
}