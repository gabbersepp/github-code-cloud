# Make a wordcloud from all of your public repositories hosted on github
**This readme is still in progress**


Enables you to create a wordcloud from all of your public github repositories. 

**Process**:
+ Checkout all public repos
+ split up all source codes into single words
+ utilize puppeteer and wordcloud2 in order to create the wordcloud

# Usage

*TODO* publish it on npm

```js
const cloud = require("github-code-cloud")
cloud.doAll("gabbersepp", process.env.GITHUB_TOKEN, ["js", "asm", "cs", "ts", "java"]);
```

# Live Example

Image:

![](./assets/img.png)

HTML:

![](./assets/html-spans.jpg)

You can see a live demo of the output at [biehler-josef.de](https://biehler-josef.de). Visit it in your desktop browser (mobile currently not supported) and you will see the tags in the background:

![](./assets/bj.jpg)

You can hover over each tag and you will see some description about every tag.

