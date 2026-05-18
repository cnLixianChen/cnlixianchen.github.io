---
permalink: /
title: "Lixian Chen"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

Hi! I am **Lixian Chen**, an undergraduate student at **Guangdong University of Technology**.

My research focuses on **multimodal learning**, **vision-language models**, and **model adaptation under distribution shift**.  
Recently, I have been working on topics such as test-time adaptation, low-rank adaptation for large language models, and geometric learning in hyperbolic spaces.

<! ## About Me

I am currently engaged in research on robust and generalizable machine learning models.  
This homepage summarizes my recent work, including publications and ongoing research projects.
!>
## Publications

{% include base_path %}

{% for post in site.publications reversed %}
  {% include archive-single.html %}
{% endfor %}
