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
  import drafter from 'drafter'

  import 'aglio-theme-olio'

  // const updateDelay = 1000

  export default {
    name: 'landing-page',
    data: function () {
      return {
        updateTimer: null,
        cachedContent: null,
        savedContent: null
      }
    },
    computed: {
      apimd: {
        get () {
          return this.$store.state.settings.settings.apimd
        },
        set (val) {
          this.$store.commit('settingsSetApimd', val)
          this.saveContent()
        }
      },
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
          // if (this.updateTimer) {
          //   window.clearTimeout(this.updateTimer)
          //   this.updateTimer = null
          // }
          //
          // this.updateTimer = window.setTimeout(this.checkErrors.bind(this), updateDelay)
        }
      }
    },
    components: {
      Editor, Selector
    },
    mounted: function () {
      const self = this

      self.editor.commands.addCommand({
        name: 'Save',
        bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
        exec: self.saveContent.bind(self)
      })

      self.editor.on('blur', self.saveContent.bind(self))

      // self.$mousetrap.bind(['command+s', 'ctrl+s'], function () {
      //   console.log('ctrl+s pressed')
      //   self.saveContent()
      // })

      drafter.onParsed(function (err, res) {
        let errors = {}
        let positions = []
        let processError = function (error, type) {
          let pos = 0
          if (error.location && error.location.length > 0) {
            pos = error.location[0].index
          }
          pos = '' + pos
          if (!errors[pos]) {
            errors[pos] = []
          }

          errors[pos].push({
            message: error.message,
            type: type
          })
          positions.push(pos)
        }

        if (res.error && res.error.message) {
          processError(res.error, 'error')
        }
        if (res.warnings && res.warnings.length > 0) {
          for (let warning of res.warnings) {
            processError(warning, 'warning')
          }
        }

        positions.sort()

        let lines = self.editor.session.getLength()
        let lastLineEnd = 0
        let posI = 0
        let pos = positions[posI]
        let annotations = []

        for (let i = 0; i < lines; i++) {
          // console.log(i + ' ' + lastLineEnd + ' ' + posI + ' ' + positions[posI])

          if (posI >= positions.length) {
            break
          }

          let lineLength = self.editor.session.getLine(i).length + 1
          while (lastLineEnd + lineLength > pos) {
            for (let error of errors[pos]) {
              annotations.push({
                row: i,
                column: pos - lastLineEnd,
                text: error.message,
                type: error.type // also warning and information
              })
            }
            posI++

            if (posI >= positions.length) {
              break
            }

            pos = positions[posI]
          }

          lastLineEnd += lineLength
        }

        let gutter = self.$refs.editor.$el.querySelector('.ace_gutter')
        gutter.classList.remove('error')
        gutter.classList.remove('warning')
        if (res.error && res.error.message) {
          gutter.classList.add('error')
        } else if (res.warnings && res.warnings.length > 0) {
          gutter.classList.add('warning')
        }

        // self.editor.session.clearAnnotations()
        self.editor.session.setAnnotations(annotations)

        if (err) {
          return
        }

        if (!res.ast.resourceGroups || res.ast.resourceGroups.length === 0) {
          return
        }

        for (let group of res.ast.resourceGroups) {
          if (!group.resources && group.resources.length === 0) {
            continue
          }

          for (let resource of group.resources) {
            if (!resource.actions && resource.actions.length === 0) {
              continue
            }

            for (let action of resource.actions) {
              if (!action.examples || action.examples.length === 0) {
                continue
              }

              let example = action.examples[0]
              if (!example.requests || example.requests.length === 0) {
                continue
              }

              // let request = example.requests[0]

              // editor.execCommand("find")
              // console.log(request.body)
              // console.log(request.headers)
            }
          }
        }
      })

      this.saveContent()
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      editorInit: function () {
        require('brace/mode/markdown')
        require('brace/theme/chrome')
      },
      // checkErrors () {
      //   this.updateTimer = null
      //   drafter.parse(this.cachedContent.replace(/\r\n?/g, '\n').replace(/\t/g, '    '), {type: 'ast'})
      // },
      saveContent () {
        if (this.updateTimer) {
          window.clearTimeout(this.updateTimer)
          this.updateTimer = null
        }

        if (this.savedContent === this.cachedContent) {
          return
        }
        this.savedContent = this.cachedContent

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
            return
          }

          let webview = document.querySelector('webview')
          webview.src = 'data:text/html;charset=utf-8,' + encodeURI(html)
        })
      }
    }
  }
</script>

<style lang="less">
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

  .ace_editor {
    .ace_gutter {
      &.error {
        background: #ffcccc;
      }
      &.warning {
        background: #ffeedd;
      }
    }
  }

</style>
