Enables you to create a wordcloud from all of your public github repositories. 

**Process**:
+ Checkout all public repos
+ split up all source codes into single words
+ utilize puppeteer and wordcloud2 in order to create the wordcloud

**Code:**
```js
const cloud = require("github-code-cloud")
cloud.generateCloud("gabbersepp", process.env.GITHUB_TOKEN, ["js", "asm", "cs", "ts", "java"]);
```

**Examples:**

Image:

![](./assets/img.png)

HTML:

![](./assets/html-spans.jpg)