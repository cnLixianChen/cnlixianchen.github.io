---
title: "News"
layout: archive
permalink: /news/
---

{% for post in site.posts %}
  <p><strong>{{ post.date | date: "%Y-%m-%d" }}</strong> — {{ post.title }}</p>
{% endfor %}
