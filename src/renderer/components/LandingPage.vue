<template>
    <div id="wrapper">
        <Split>
            <SplitArea :size="25">
                <LeftMenu @project="setSelectedProject($event)"/>
            </SplitArea>
            <SplitArea :size="75">
                <Apib ref="apib"/>
            </SplitArea>
        </Split>
    </div>
</template>

<script>
  import Apib from './Apib'
  import LeftMenu from './LeftMenu'

  export default {
    name: 'landing-page',
    data: function () {
      return {}
    },
    components: {
      LeftMenu, Apib
    },
    computed: {
      apimd: {
        get () {
          return this.$store.state.settings.settings.apimd
        },
        set (val) {
          this.$store.commit('settingsSetApimd', val)
        }
      }
    },
    methods: {
      setSelectedProject (project) {
        console.log('test1')
        this.$refs.apib.setProject(project)
      },
      open (link) {
        this.$electron.shell.openExternal(link)
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

</style>
