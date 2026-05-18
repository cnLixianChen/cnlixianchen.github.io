---
title: "News"
layout: archive
permalink: /news/
---

{% for post in site.posts %}
  <p><strong>{{ post.date | date: "%Y-%m" }}</strong> — {{ post.title }}</p>
{% endfor %}
