// 项目渲染函数
function renderProjects(projects) {
    const container = document.getElementById('projects-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    projects.forEach(project => {
        const projectCard = `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card project-card h-100">
                    <img src="${project.thumbnail}" class="card-img-top" alt="${project.title}">
                    <div class="card-overlay">
                        <h5 class="card-title">${project.title}</h5>
                        <p class="card-text">${project.shortDescription}</p>
                        <a href="project-detail.html?id=${project.id}" class="btn btn-sm btn-light">查看详情</a>
                    </div>
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-${project.status === '进行中' ? 'primary' : 'success'}">
                                ${project.status}
                            </span>
                            <small class="text-muted">${project.startDate}</small>
                        </div>
                        <h6 class="card-subtitle mb-2 text-muted">${project.subtitle}</h6>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += projectCard;
    });
}

// 模拟渲染函数
function renderSimulations(simulations) {
    const container = document.getElementById('simulations-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    simulations.forEach(sim => {
        const simCard = `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100">
                    <div class="ratio ratio-16x9">
                        <video class="card-img-top" poster="${sim.thumbnail}" controls>
                            <source src="${sim.video}" type="video/mp4">
                        </video>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${sim.title}</h5>
                        <p class="card-text">${sim.description}</p>
                        <div class="d-flex justify-content-between">
                            <span class="badge bg-secondary">${sim.system}</span>
                            <span class="badge bg-info">${sim.method}</span>
                        </div>
                    </div>
                    <div class="card-footer bg-transparent border-0">
                        <button class="btn btn-sm btn-outline-primary w-100 view-simulation" 
                                data-id="${sim.id}">
                            查看详情
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += simCard;
    });
    
    // 添加查看详情事件
    document.querySelectorAll('.view-simulation').forEach(btn => {
        btn.addEventListener('click', () => {
            const simId = btn.dataset.id;
            const simulation = simulations.find(s => s.id === simId);
            if (simulation) {
                showSimulationDetail(simulation);
            }
        });
    });
}

// 显示模拟详情
function showSimulationDetail(simulation) {
    // 设置模态框标题
    document.getElementById('simulationModalTitle').textContent = simulation.title;
    
    // 设置视频
    const videoPlayer = document.getElementById('simulation-video');
    videoPlayer.querySelector('source').src = simulation.video;
    
    // 设置描述
    document.getElementById('simulation-description').innerHTML = `
        <h6>模拟描述</h6>
        <p>${simulation.longDescription}</p>
    `;
    
    // 设置参数
    const paramsList = document.getElementById('simulation-params');
    paramsList.innerHTML = '';
    
    simulation.parameters.forEach(param => {
        paramsList.innerHTML += `
            <li class="list-group-item d-flex justify-content-between">
                <span>${param.name}</span>
                <span class="fw-bold">${param.value}</span>
            </li>
        `;
    });
    
    // 设置相关文档
    const docsContainer = document.getElementById('related-docs');
    docsContainer.innerHTML = '';
    
    simulation.relatedDocuments.forEach(doc => {
        docsContainer.innerHTML += `
            <div class="mb-2">
                <a href="${doc.link}" class="d-block text-truncate" target="_blank">
                    <i class="bi bi-file-earmark-text me-1"></i> ${doc.title}
                </a>
                <small class="text-muted">${doc.date}</small>
            </div>
        `;
    });
    
    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('simulationModal'));
    modal.show();
    
    // 重新加载视频
    videojs(videoPlayer, {
        controls: true,
        autoplay: false,
        preload: 'auto'
    });
}

// 渲染日志条目
function renderJournalEntries(entries) {
    const container = document.getElementById('journal-entries');
    if (!container) return;
    
    container.innerHTML = '';
    
    entries.forEach(entry => {
        const entryDate = new Date(entry.date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const entryElement = `
            <div class="journal-entry" data-id="${entry.id}" data-category="${entry.category}">
                <h3 class="mb-1">${entry.title}</h3>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">${entryDate}</span>
                    <span class="badge bg-primary">${getCategoryName(entry.category)}</span>
                </div>
                <p>${entry.summary}</p>
                <button class="btn btn-sm btn-outline-primary view-entry">查看详情</button>
            </div>
        `;
        
        container.innerHTML += entryElement;
    });
    
    // 添加查看详情事件
    document.querySelectorAll('.view-entry').forEach(btn => {
        btn.addEventListener('click', function() {
            const entryId = this.closest('.journal-entry').dataset.id;
            const entry = entries.find(e => e.id === entryId);
            if (entry) {
                showJournalEntry(entry);
            }
        });
    });
}

// 显示日志详情
function showJournalEntry(entry) {
    // 设置模态框标题
    document.getElementById('journalModalTitle').textContent = entry.title;
    
    // 设置日期和分类
    const entryDate = new Date(entry.date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    
    document.getElementById('entry-date').textContent = entryDate;
    document.getElementById('entry-category').textContent = getCategoryName(entry.category);
    
    // 渲染Markdown内容
    fetch(entry.contentFile)
        .then(response => response.text())
        .then(markdown => {
            const htmlContent = marked.parse(markdown);
            document.getElementById('journal-content').innerHTML = htmlContent;
            
            // 高亮代码块
            document.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
            
            // 显示模态框
            const modal = new bootstrap.Modal(document.getElementById('journalModal'));
            modal.show();
        });
}

// 辅助函数：获取分类名称
function getCategoryName(category) {
    const categories = {
        simulation: "数值模拟",
        experiment: "实验记录",
        analysis: "数据分析",
        ideas: "研究想法"
    };
    
    return categories[category] || category;
}

// 渲染项目详情
function renderProjectDetail(project) {
    // 设置项目标题
    document.getElementById('project-title').textContent = project.title;
    document.getElementById('project-subtitle').textContent = project.subtitle;
    
    // 渲染项目描述
    fetch(project.descriptionFile)
        .then(response => response.text())
        .then(markdown => {
            document.getElementById('project-description').innerHTML = marked.parse(markdown);
        });
    
    // 渲染时间线
    const timeline = document.getElementById('project-timeline');
    timeline.innerHTML = '';
    
    project.timeline.forEach(event => {
        const eventDate = new Date(event.date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        timeline.innerHTML += `
            <li class="timeline-item">
                <div class="timeline-date">${eventDate}</div>
                <div class="timeline-content">${event.description}</div>
            </li>
        `;
    });
    
    // 渲染数值模拟部分
    fetch(project.simulationFile)
        .then(response => response.text())
        .then(markdown => {
            document.getElementById('simulation-content').innerHTML = marked.parse(markdown);
        });
    
    // 渲染模拟视频
    const videosContainer = document.getElementById('simulation-videos');
    videosContainer.innerHTML = '';
    
    project.simulationVideos.forEach(video => {
        videosContainer.innerHTML += `
            <div class="col-md-6 mb-4">
                <div class="card">
                    <div class="ratio ratio-16x9">
                        <video class="card-img-top" controls>
                            <source src="${video.file}" type="video/mp4">
                        </video>
                    </div>
                    <div class="card-body">
                        <h5>${video.title}</h5>
                        <p class="card-text">${video.description}</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    // 渲染实验部分
    fetch(project.experimentFile)
        .then(response => response.text())
        .then(markdown => {
            document.getElementById('experiment-content').innerHTML = marked.parse(markdown);
        });
    
    // 渲染实验设置和结果
    document.getElementById('experiment-setup').innerHTML = marked.parse(project.experimentSetup);
    document.getElementById('experiment-results').innerHTML = marked.parse(project.experimentResults);
    
    // 渲染数据分析部分
    fetch(project.analysisFile)
        .then(response => response.text())
        .then(markdown => {
            document.getElementById('analysis-content').innerHTML = marked.parse(markdown);
        });
    
    // 渲染关键指标
    const metricsContainer = document.getElementById('key-metrics');
    metricsContainer.innerHTML = '';
    
    project.keyMetrics.forEach(metric => {
        metricsContainer.innerHTML += `
            <div class="d-flex justify-content-between mb-2">
                <span>${metric.name}</span>
                <span class="fw-bold">${metric.value}</span>
            </div>
        `;
    });
    
    // 渲染图表
    renderDataCharts(project);
}

// 渲染数据图表
function renderDataCharts(project) {
    // 图表1 - 折线图
    const ctx1 = document.getElementById('data-chart-1').getContext('2d');
    new Chart(ctx1, {
        type: 'line',
        data: {
            labels: project.chartData.labels,
            datasets: [{
                label: project.chartData.datasets[0].label,
                data: project.chartData.datasets[0].data,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: project.chartData.title
                }
            }
        }
    });
    
    // 图表2 - 散点图
    const ctx2 = document.getElementById('data-chart-2').getContext('2d');
    new Chart(ctx2, {
        type: 'scatter',
        data: {
            datasets: [{
                label: project.scatterData.label,
                data: project.scatterData.points,
                backgroundColor: '#dc3545',
                pointRadius: 6
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: project.scatterData.xLabel
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: project.scatterData.yLabel
                    }
                }
            }
        }
    });
}