### 如何使用

配置 node 环境，大于 18 即可

```
nvm use <version bigger than 18>
```

安装依赖，这一步因为需要下载 Chrome 内核来渲染 HTML 页面，比较慢

```
npm install --verbose
```

构建一下

```
npm run build
```

使用命令生成客户端 SDK 集成文档 pdf (服务端 SDK、合规指南请参考 launch.json)

```
node lib/cli.js docs-to-pdf docusaurus \
  --initialDocURLs "https://growingio.github.io/growingio-sdk-docs/docs" \
  --contentSelector "article" \
  --paginationSelector "a.pagination-nav__link.pagination-nav__link--next" \
  --excludeSelectors "a.card.padding--lg.cardContainer_fWXF" \
  --excludePaths "/ios/modules/ABTesting%20Module" \
  --cssStyle $'*{font-family: Arial, Helvetica, sans-serif !important;}' \
  --outputPDFFilename "GrowingIO SDK 集成文档.pdf" \
  --paperFormat "A4"
```

注意：生成的 pdf 第一页如果是空白，用 macOS 默认的 Preview 打开后，选中第一页，菜单栏选择 Edit -> Delete 删掉即可



### 如何调试

用 vscode 使用 launch.json 已经配置好的 3 种调试器来调试（Client_SDK_PDF 生成客户端 SDK 文档，Server_SDK_PDF 生成服务端 SDK 文档，Compliance_PDF 生成合规指南）



### 解决报错

docs-to-pdf 该库有些依赖有问题，在 npm install 之后，手动改一下：

#### [ERROR] ReferenceError: ReadableStream is not defined

报错内容：

```
[18.03.2025 16:01.19.750] [ERROR] ReferenceError: ReadableStream is not defined
    at getReadableFromProtocolStream (/docs-to-pdf/node_modules/puppeteer-core/lib/cjs/puppeteer/common/util.js:212:5)
    at CdpPage.createPDFStream (/docs-to-pdf/node_modules/puppeteer-core/lib/cjs/puppeteer/cdp/Page.js:822:66)
    at async CdpPage.pdf (/docs-to-pdf/node_modules/puppeteer-core/lib/cjs/puppeteer/cdp/Page.js:826:26)
    at async generatePDF (/docs-to-pdf/lib/core.js:131:5)
    at async generateDocusaurusPDF (docs-to-pdf/lib/provider/docusaurus.js:74:9)
```

解决方法：

进入 node_modules/puppeteer-core/lib/cjs/puppeteer/common/util.js，添加 ReadableStream 导入：

```
const { ReadableStream } = require('node:stream/web');
```

