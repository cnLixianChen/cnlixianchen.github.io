---
layout: academic
permalink: /
title: "Homepage"
redirect_from:
  - /about/
  - /about.html
---

<section class="profile" aria-labelledby="profile-name">
  <div class="portrait-wrap">
    <img class="portrait"
         src="{{ '/images/name.jpg' | relative_url }}"
         alt="Lixian Chen"
         width="280"
         height="280"
         fetchpriority="high">
  </div>

  <div class="profile-copy">
    <h1 id="profile-name">Lixian Chen</h1>
    <p class="profile-role"><svg class="detail-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m2 8 10-5 10 5-10 5L2 8Zm4 3v6c4 3 8 3 12 0v-6M22 8v7"/></svg>Incoming M.S. Student</p>
    <p class="profile-school"><svg class="detail-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m3 9 9-6 9 6H3Zm2 2v8m5-8v8m4-8v8m5-8v8M3 21h18"/></svg>
      <a href="https://www.seu.edu.cn/">Southeast University</a>
      <span class="status-pill">Fall 2027</span>
    </p>

    <div class="contact-links">
      <a href="mailto:{{ site.author.email }}">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2"/>
          <path d="m3 6 9 7 9-7"/>
        </svg>
        {{ site.author.email }}
      </a>
      <a href="{{ site.author.googlescholar }}">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m2 8 10-5 10 5-10 5L2 8Zm4 3v6c4 3 8 3 12 0v-6M22 8v7"/>
        </svg>
        Google Scholar ↗
      </a>
    </div>
  </div>
</section>

<section class="bio" aria-label="About Lixian Chen">
  <p>
    I will join
    <a href="https://www.seu.edu.cn/">Southeast University</a>
    as a master's student in <strong>Fall 2027</strong>,
    where I will be advised by <a class="advisor-link" href="https://cs.seu.edu.cn/weixs/main.htm">Prof. Xiu-Shen Wei</a>.
    I am currently completing my undergraduate studies at Guangdong University of Technology.
  </p>

  <p>
    My research focuses on <strong>robust multimodal learning</strong>,
    particularly how vision-language models adapt and generalize under
    distribution shifts. I am interested in understanding not only
    what models can achieve, but also why they fail and what makes
    their behavior reliable.
  </p>

  <ul class="research-tags" aria-label="Research interests">
    <li>Multimodal Learning</li>
    <li>Model Robustness</li>
    <li>Test-Time Adaptation</li>
  </ul>
</section>

<section class="content-section" id="news" aria-labelledby="news-heading">
  <div class="section-heading">
    <h2 id="news-heading">News</h2>
    <span class="section-note">Recent updates</span>
  </div>
  <ol class="news-list">
    {% assign sorted_news = site.news | sort: "date" | reverse %}
    {% for item in sorted_news limit:5 %}
      <li>
        <time datetime="{{ item.date | date: '%Y-%m-%d' }}">
          {{ item.date | date: "%Y.%m" }}
        </time>
        <div>{{ item.content | markdownify }}</div>
      </li>
    {% endfor %}
  </ol>
</section>

<section class="content-section" id="education" aria-labelledby="education-heading">
  <div class="section-heading">
    <h2 id="education-heading">Education</h2>
    <span class="section-note">Academic journey</span>
  </div>
  {% include academic-education.html %}
</section>

<section class="content-section" id="publications" aria-labelledby="publications-heading">
  <div class="section-heading">
    <div>
      <h2 id="publications-heading">Selected Publications</h2>
      <p class="section-note contribution-note"><sup>*</sup> Equal contribution</p>
    </div>
    <a class="quiet-link" href="{{ '/publications/' | relative_url }}">
      All publications ↗
    </a>
  </div>
  {% include academic-publications.html %}
</section>
