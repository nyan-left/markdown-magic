const fs = require('fs')
const path = require('path')
const test = require('ava')
const rimraf = require('rimraf')
const sinon = require('sinon')
const markdownMagic= require('../index')

const CLEAN_UP = true
const testMarkdownPath = path.join(__dirname, 'fixtures', 'test.md')
const outputDir = path.join(__dirname, 'fixtures', 'output')
const delay = (ms) => new Promise(res => setTimeout(res, ms))
const matchWord = 'AUTO-GENERATED-CONTENTX'
const defaultConfig = {
  matchWord: matchWord
}
/**
 * Test markdownMagic Function
 */
test('if valid string path supplied', t => {
  markdownMagic(testMarkdownPath, defaultConfig)
  t.pass()
  // emptyDirectory(outputDir)
})

test('if valid glob pattern supplied', t => {
  const config = {
    outputDir: outputDir
  }
  markdownMagic(['test/fixtures/**/*md', '!test/fixtures/output/*.md'], config)
  t.pass()
  // empty dir
  // rimraf.sync(outputDir)
})

test('if valid config supplied', t => {
  markdownMagic(testMarkdownPath, defaultConfig)
  t.pass()
  // emptyDirectory(outputDir)
})

test.cb('if callback function supplied, call it once', t => {
  const callback = sinon.spy()
  markdownMagic(testMarkdownPath, defaultConfig, () => {
    callback()
    t.true(callback.calledOnce)
    t.end()
  })
  // emptyDirectory(outputDir)
})

test.cb('if callback function supplied, as second arg, call it once', t => {
  const callback = sinon.spy()
  markdownMagic(testMarkdownPath, defaultConfig, () => {
    callback()
    t.true(callback.calledOnce)
    t.end()
  })
 
  // emptyDirectory(outputDir)
})

/**
 * Test Config settings
 */

test.cb('if config.outputDir supplied, make new file', t => {
  const config = {
    outputDir: outputDir,
    ...defaultConfig
  }
  markdownMagic(testMarkdownPath, config, function() {
    const newfile = path.join(outputDir, 'test.md')
    const fileWasCreated = filePathExists(newfile)
    t.true(fileWasCreated)
    t.end()
    // remove test file after assertion
    // emptyDirectory(outputDir)
  })
})

test.cb('if config.matchWord supplied, use it for comment matching', t => {
  const filePath = path.join(__dirname, 'fixtures', 'custom-match-word-test.md')
  const config = {
    matchWord: 'YOLO',
    outputDir: outputDir
  }
  markdownMagic(filePath, config, () => {
    const newfile = path.join(config.outputDir, 'custom-match-word-test.md')
    const newContent = fs.readFileSync(newfile, 'utf8')
    t.regex(newContent, /module\.exports\.run/, 'local code snippet inserted')
    t.end()
  })
  // remove test file after assertion
  // rimraf.sync(outputDir)
})

test.cb('<!-- AUTO-GENERATED-CONTENT:START (TOC)-->', t => {
  const filePath = path.join(__dirname, 'fixtures', 'TOC-test.md')
  const config = {
    outputDir: outputDir
  }
  markdownMagic(filePath, config, () => {
    const newfile = path.join(config.outputDir, 'TOC-test.md')
    const newContent = fs.readFileSync(newfile, 'utf8')

    const expectedTest1 = `
<!-- AUTO-GENERATED-CONTENT:START (TOC) - Test #1: without option and the content with empty line  -->
- [Title A](#title-a)
  - [Subtitle z](#subtitle-z)
  - [Subtitle x](#subtitle-x)
- [Title B](#title-b)
- [Title C](#title-c)
<!-- AUTO-GENERATED-CONTENT:END -->`

    // console.log('expectedTest1', expectedTest1)
    // console.log('newContent', newContent)
    const regexTest1 = new RegExp(`(?=${expectedTest1.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "i")
    t.regex(newContent, regexTest1, 'Test #1 : without option and the content with empty line')

    const expectedTest2 = `
<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click Me) - Test #2: with collapse options and the content with 'aaaaaaaaa'  -->
<details>
<summary>Click Me</summary>

- [Title A](#title-a)
  - [Subtitle z](#subtitle-z)
  - [Subtitle x](#subtitle-x)
- [Title B](#title-b)
- [Title C](#title-c)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->`
    const regexTest2 = new RegExp(`(?=${expectedTest2.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "i")
    t.regex(newContent, regexTest2, "Test #2: with collapse options and the content with 'aaaaaaaaa'")

    const expectedTest3 = `
<!-- AUTO-GENERATED-CONTENT:START (TOC:collapse=true&collapseText=Click Me=I have the power) - Test #3: with collapseText contains character '='  -->
<details>
<summary>Click Me=I have the power</summary>

- [Title A](#title-a)
  - [Subtitle z](#subtitle-z)
  - [Subtitle x](#subtitle-x)
- [Title B](#title-b)
- [Title C](#title-c)

</details>
<!-- AUTO-GENERATED-CONTENT:END -->`
    const regexTest3 = new RegExp(`(?=${expectedTest3.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "i")
    t.regex(newContent, regexTest3, "Test #3: with collapseText contains character '='")

    const expectedTest4 = `
<!-- AUTO-GENERATED-CONTENT:START (TOC) - Test #4: without option and the content is empty  -->
- [Title A](#title-a)
  - [Subtitle z](#subtitle-z)
  - [Subtitle x](#subtitle-x)
- [Title B](#title-b)
- [Title C](#title-c)
<!-- AUTO-GENERATED-CONTENT:END -->`
    const regexTest4 = new RegExp(`(?=${expectedTest4.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "i")
    t.regex(newContent, regexTest4, 'Test #4 : without option and the content is empty')

    const expectedTest5 = `
<!-- AUTO-GENERATED-CONTENT:START (TOC) - Test #5: without option and tags with same line  -->
- [Title A](#title-a)
  - [Subtitle z](#subtitle-z)
  - [Subtitle x](#subtitle-x)
- [Title B](#title-b)
- [Title C](#title-c)
<!-- AUTO-GENERATED-CONTENT:END -->`
    const regexTest5 = new RegExp(`(?=${expectedTest5.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "i")
    t.regex(newContent, regexTest5, 'Test #5 : without option and tags with same line')

    t.end()
  })

})

/**
 * Test Built in transforms
 */
test.cb('<!-- AUTO-GENERATED-CONTENT:START (CODE)-->', t => {
  const filePath = path.join(__dirname, 'fixtures', 'CODE-test.md')
  const config = { outputDir: outputDir }
  const newfile = path.join(config.outputDir, 'CODE-test.md')

  markdownMagic(filePath, config, function(err, data) {
    // console.log('data', data)
    const newContent = fs.readFileSync(newfile, 'utf8')
    // check local code
    t.regex(newContent, /module\.exports\.run/, 'local code snippet inserted')
    // check local code with range lines
    t.regex(newContent, /```js\n  const baz = 'foobar'\n  console\.log\(`Hello \${baz}`\)\n```/, 'local code snippet with range lines inserted')
    // check remotely fetched code
    t.regex(newContent, /require\('doxxx'\)/, 'remote code snippet inserted')
    // check remotely fetched code with range lines
    t.regex(newContent, /```json\n  "author": "David Wells",\n  "license": "MIT",\n```/, 'remote code snippet with range lines inserted')

    t.end()
  })

  if (filePathExists(newfile)) {
    // rimraf.sync(outputDir)
  }
  // remove test file after assertion
})

/**
 * Test Built in transforms
 */
test.cb('<!-- AUTO-GENERATED-CONTENT:START (FILE)-->', t => {
  const filePath = path.join(__dirname, 'fixtures', 'FILE-test.md')
  const config = { outputDir: outputDir }
  const newfile = path.join(config.outputDir, 'FILE-test.md')

  markdownMagic(filePath, config, function(err, data) {
    // console.log('data', data)
    const newContent = fs.readFileSync(newfile, 'utf8')
    // check local code
    t.regex(newContent, /module\.exports\.run/, 'local code snippet inserted')
    // check local code with range lines
    t.regex(newContent, /const baz = 'foobar'\n  console\.log\(`Hello \${baz}`\)/, 'local code snippet with range lines inserted')
    t.end()
  })

  if (filePathExists(newfile)) {
    // rimraf.sync(outputDir)
  }
  // remove test file after assertion
})

test.cb('<!-- AUTO-GENERATED-CONTENT:START (REMOTE)-->', t => {
  const filePath = path.join(__dirname, 'fixtures', 'REMOTE-test.md')

  const config = { outputDir: outputDir }
  markdownMagic(filePath, config, function() {
    const newfile = path.join(config.outputDir, 'REMOTE-test.md')
    const newContent = fs.readFileSync(newfile, 'utf8')
    // check local code
    t.regex(newContent, /Markdown Magic/, 'word "Markdown Magic" not found in remote block')
    t.end()
    // remove test file after assertion
    // rimraf.sync(outputDir)
  })
})

test.cb('Verify single line comments remain inline', t => {
  const filePath = path.join(__dirname, 'fixtures', 'INLINE-test.md')
  const config = { 
    outputDir: outputDir,
    transforms: {
      INLINE(content, options) {
        return `inline`
      },
      OTHER(content, options) {
        return `other`
      }
    }
  }
  markdownMagic(filePath, config, function() {
    const newfile = path.join(config.outputDir, 'INLINE-test.md')
    const newContent = fs.readFileSync(newfile, 'utf8')
    // Check inline remains inline
    t.is(newContent.indexOf('<!-- AUTO-GENERATED-CONTENT:START (INLINE) -->inline<!-- AUTO-GENERATED-CONTENT:END -->') > -1, true)
    // Preserve line spacing
    t.regex(newContent, /\nother\n/, 'preserves line spacing')
    t.end()
  })
})

test.cb('<!-- AUTO-GENERATED-CONTENT:START (customTransform)-->', t => {
  const filePath = path.join(__dirname, 'fixtures', 'CUSTOM-test.md')

  const config = { 
    outputDir: outputDir,
    transforms: {
      /* Match <!-- AUTO-GENERATED-CONTENT:START (customTransform:optionOne=hi&optionOne=DUDE) --> */
      customTransform(content, options) {
        // options = { optionOne: hi, optionOne: DUDE}
        return `This will replace all the contents of inside the comment ${options.optionOne}`
      }
    }
  }
  markdownMagic(filePath, config, function() {
    const newfile = path.join(config.outputDir, 'CUSTOM-test.md')
    // console.log('newfile', newfile)
    const newContent = fs.readFileSync(newfile, 'utf8')
    // console.log('newContent', newContent)
    // check local code
    t.regex(newContent, /will replace all the contents/, 'has custom transform data')
    t.end()
    // remove test file after assertion
    // rimraf.sync(outputDir)
  })
})

test.cb('Async <!-- AUTO-GENERATED-CONTENT:START (customAsync)-->', t => {
  const filePath = path.join(__dirname, 'fixtures', 'CUSTOM-async.md')

  const config = { 
    outputDir: outputDir,
    transforms: {
      /* Match <!-- AUTO-GENERATED-CONTENT:START (customAsync:optionOne=hi) --> */
      async customAsync(content, options) {
        await delay(500)
        // options = { optionOne: hi, optionOne: DUDE}
        return `async data here ${options.optionOne}`
      }
    }
  }
  markdownMagic(filePath, config, function() {
    const newfile = path.join(config.outputDir, 'CUSTOM-async.md')
    const newContent = fs.readFileSync(newfile, 'utf8')
    // check local code
    t.regex(newContent, /async data here hi/, 'has custom transform data')
    t.end()
    // remove test file after assertion
    // rimraf.sync(outputDir)
  })
})

test.after.always('cleanup', async t => {
  if (CLEAN_UP) {
    rimraf.sync(outputDir)
  }
})

/*
  Util functions
*/
function filePathExists(fp) {
  try {
    fs.accessSync(fp)
    return true
  } catch (err) {
    return false
  }
}

function emptyDirectory(filePath, callBack) {
  rimraf.sync(filePath)
  callBack && callBack(null)
}
