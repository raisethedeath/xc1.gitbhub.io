---
title: 文档页面示例
layout: default
---

{% if site.sidebar %}
  {% include sidebar.html %}
{% endif %}

<article class="content">
  {{ content }}
  
  <!-- 自动生成目录 -->
  <div class="toc">
    <h3>页面目录</h3>
    {% include toc.html html=content %}
  </div>
</article>
