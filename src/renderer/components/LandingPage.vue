<template>
  <div id="wrapper">
    <Split>
      <SplitArea :size="25">
        <selector v-model=" apimd"></selector>
      </SplitArea>
      <SplitArea :size="75">
        <Split direction="horizontal">
          <SplitArea :size="50">
            <editor v-model="content" @init="editorInit()" lang="markdown" theme="chrome" ref="editor"></editor>
          </SplitArea>
          <SplitArea :size="50">
            <webview id="foo" src="" style="display:inline-flex; width:100%; height:99%"></webview>
          </SplitArea>
        </Split>
      </SplitArea>
    </Split>
  </div>
</template>

<script>
  import fs from 'fs'
  import aglio from 'aglio'
  import Editor from './ace/AceEditor'
  import Selector from './apimd/Selector'

  import 'aglio-theme-olio'

  const updateFrequency = 1500

  export default {
    name: 'landing-page',
    data: function () {
      return {
        apimd: null,
        timer: null,
        lastUpdated: null,
        updateTimer: null,
        cachedContent: null
      }
    },
    computed: {
      editor () {
        return this.$refs.editor.editor
      },
      content: {
        get () {
          if (!this.apimd) {
            return ''
          }

          if (this.cachedContent) {
            return this.cachedContent
          }

          try {
            let data = fs.readFileSync(this.apimd)
            this.cachedContent = data.toString()
          } catch (err) {
            console.log(err)
          }

          return this.cachedContent
        },
        set (val) {
          if (!this.apimd) {
            return
          }

          this.cachedContent = val

          if (!this.lastUpdated || this.lastUpdated + updateFrequency <= Date.now()) {
            this.apimdUpdated()
          } else if (!this.updateTimer) {
            this.updateTimer = window.setTimeout(this.apimdUpdated.bind(this), this.lastUpdated + updateFrequency - Date.now())
          }
        }
      }
    },
    components: {
      Editor, Selector
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      editorInit: function () {
        require('brace/mode/markdown')
        require('brace/theme/chrome')
      },
      apimdUpdated () {
        this.lastUpdated = Date.now()
        this.updateTimer = null

        console.log('udpate called')

        let self = this

        fs.writeFile(this.apimd, self.cachedContent, function (err) {
          if (err) {
            console.log(err)
          }
        })

        // let options = {
        //   themeVariables: 'default'
        // }

        aglio.render(self.cachedContent, {}, function (err, html, warnings) {
          if (err) {
            self.editor.session.setAnnotations([{
              row: 0,
              column: 0,
              text: err.message,
              type: 'error'
            }])

            return console.log(err)
          }
          let warns = {}
          let warnPos = []
          if (warnings && warnings.length > 0) {
            for (let warning of warnings) {
              let pos = warning.location[0].index
              warns['' + pos] = warning
              warnPos.push(pos)
            }
          }
          warnPos.sort()

          let lines = self.editor.session.getLength()
          let lastLineEnd = 0
          let posI = 0
          let pos = warnPos[posI]
          let annotations = []

          for (let i = 0; i < lines; i++) {
            // console.log(i + ' ' + lastLineEnd + ' ' + posI + ' ' + warnPos[posI])

            if (posI >= warnPos.length) {
              break
            }

            let lineLength = self.editor.session.getLine(i).length + 1
            while (lastLineEnd + lineLength > pos) {
              annotations.push({
                row: i,
                column: pos - lastLineEnd,
                text: warns[pos].message,
                type: 'warning' // also warning and information
              })
              posI++

              if (posI >= warnPos.length) {
                break
              }

              pos = warnPos[posI]
            }

            lastLineEnd += lineLength
          }

          // self.editor.session.clearAnnotations()
          self.editor.session.setAnnotations(annotations)

          let webview = document.querySelector('webview')
          webview.src = 'data:text/html;charset=utf-8,' + encodeURI(html)
        })
      }
    }
  }
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  #wrapper {
    background: radial-gradient(
      ellipse at top left,
      rgba(255, 255, 255, 1) 40%,
      rgba(229, 229, 229, .9) 100%
    );
    height: 100vh;
    width: 100vw;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Source Sans Pro', sans-serif;
  }

</style>
