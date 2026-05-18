---
permalink: /
title: "Lixian Chen"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

Hi! I am **Lixian Chen**, an undergraduate student at **Guangdong University of Technology**.

My research focuses on **multimodal learning**, **vision-language models**.  
Recently, I have been working on topics such as test-time adaptation and geometric learning in hyperbolic spaces.

{% comment %}
## About Me

I am currently engaged in research on robust and generalizable machine learning models.  
This homepage summarizes my recent work, including publications and ongoing research projects.
{% endcomment %}


## News

<div class="home-news">
<ul>
{% assign sorted_news = site.news | sort: "date" | reverse %}
{% for item in sorted_news limit:5 %}
  <li>
    <span class="home-news-date">[{{ item.date | date: "%Y.%m" }}]</span>
    {{ item.content | markdownify | remove: '<p>' | remove: '</p>' }}
  </li>
{% endfor %}
</ul>
</div>

## Publications

{% include base_path %}

{% for post in site.publications reversed %}
  {% include archive-single.html %}
{% endfor %}
