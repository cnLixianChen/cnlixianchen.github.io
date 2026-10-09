---
layout: academic
permalink: /
title: "Homepage"
redirect_from:
  - /about/
  - /about.html
---

<section class="profile" aria-labelledby="profile-name">
  <div class="portrait-wrap"><img class="portrait" src="{{ '/images/name.jpg' | relative_url }}" alt="Lixian Chen" width="180" height="180" fetchpriority="high"><span class="portrait-caption">LIXIAN CHEN</span></div>
  <div class="profile-copy">
    <p class="eyebrow">Multimodal learning &amp; geometric learning</p>
    <h1 id="profile-name">Lixian Chen<span class="name-period">.</span></h1>
    <p class="profile-role">Incoming Graduate Student</p>
    <p class="profile-school"><a href="https://www.seu.edu.cn/">Southeast University</a><span class="status-pill">Fall 2027</span></p>
    <div class="contact-links">
      <a href="mailto:{{ site.author.email }}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/></svg>{{ site.author.email }}</a>
      <a href="{{ site.author.googlescholar }}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2 8 10-5 10 5-10 5L2 8Zm4 3v6c4 3 8 3 12 0v-6M22 8v7"/></svg>Google Scholar ↗</a>
    </div>
  </div>
</section>

<section class="bio" aria-label="About Lixian Chen">
  <p>I have been admitted to <a href="https://www.seu.edu.cn/">Southeast University</a> through the recommendation-based graduate admission scheme and will join in <strong>Fall 2027</strong>, advised by <a href="https://cs.seu.edu.cn/weixs/main.htm">Prof. Xiu-Shen Wei (魏秀参)</a>. I am currently completing my undergraduate studies at <a href="https://www.gdut.edu.cn/">Guangdong University of Technology</a>.</p>
  <p>My research focuses on <strong>multimodal learning</strong> and <strong>vision-language models</strong>, with particular interests in test-time adaptation and geometric learning in hyperbolic spaces.</p>
  <ul class="research-tags" aria-label="Research interests"><li>Multimodal Learning</li><li>Vision-Language Models</li><li>Test-Time Adaptation</li><li>Geometric Learning</li></ul>
</section>

<section class="content-section" id="news" aria-labelledby="news-heading">
  <div class="section-heading"><h2 id="news-heading">News</h2><span class="section-note">Recent updates</span></div>
  <ol class="news-list">
  {% assign sorted_news = site.news | sort: "date" | reverse %}
  {% for item in sorted_news limit:5 %}
    <li><time datetime="{{ item.date | date: '%Y-%m-%d' }}">{{ item.date | date: "%Y.%m" }}</time><div>{{ item.content | markdownify }}</div></li>
  {% endfor %}
  </ol>
</section>

<section class="content-section" id="education" aria-labelledby="education-heading">
  <div class="section-heading"><h2 id="education-heading">Education</h2><span class="section-note">Academic journey</span></div>
  {% include academic-education.html %}
</section>

<section class="content-section" id="publications" aria-labelledby="publications-heading">
  <div class="section-heading"><div><h2 id="publications-heading">Selected Publications</h2><p class="section-note contribution-note"><sup>*</sup> Equal contribution</p></div><a class="quiet-link" href="{{ '/publications/' | relative_url }}">All publications ↗</a></div>
  {% include academic-publications.html %}
</section>
