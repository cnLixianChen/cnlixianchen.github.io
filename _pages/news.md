---
title: "News"
layout: archive
permalink: /news/
---

<ul>
{% for post in site.posts %}
  <li>
    <em>[{{ post.date | date: "%Y.%m" }}]</em>
    {{ post.content | markdownify | remove: '<p>' | remove: '</p>' }}
  </li>
{% endfor %}
</ul>
