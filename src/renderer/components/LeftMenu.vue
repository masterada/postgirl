<template>
    <div>
        <b-button @click="add">New</b-button>
        <b-list-group>
            <b-list-group-item v-for="(project, projectId) in projects" :active="projectId == selectedProjectId"
                               @click="(selectedProjectId = projectId)">
                {{ project.name }}
                <b-button @click="edit(project)">Edit</b-button>
                <b-button @click="remove(project)">Delete</b-button>
            </b-list-group-item>
        </b-list-group>
        <b-modal title="Bootstrap-Vue" ref="projectSettingsModal">
            <b-form-input
                    :value="selectedProject.name"
                    placeholder="Project name"
                    type="text"
                    @change="setProjectProperty(selectedProject, 'name', $event)"
            />
            <b-form-file
                    :value="selectedProject.definitionFile"
                    :state="Boolean(selectedProject.definitionFile)"
                    placeholder="Choose api-blueprint definition file"
                    @change="setProjectProperty(selectedProject, 'definitionFile', $event.target.files[0].path)"/>
            <b-form-file
                    :value="selectedProject.htmlFile"
                    :state="Boolean(selectedProject.htmlFile)"
                    placeholder="Choose output html file"
                    @change="setProjectProperty(selectedProject, 'htmlFile', $event.target.files[0].path)"/>
            <b-form-file
                    :value="selectedProject.middlewareFile"
                    :state="Boolean(selectedProject.middlewareFile)"
                    placeholder="Choose output middleware file"
                    @change="setProjectProperty(selectedProject, 'middlewareFile', $event.target.files[0].path)"/>
        </b-modal>
    </div>
</template>

<script>
  import Selector from './apimd/Selector'
  import uuidv4 from 'uuid/v4'

  export default {
    name: 'lef-menu',
    props: ['type'],
    data: function () {
      return {}
    },
    computed: {
      selectedProjectId: {
        get () {
          return this.$store.state.settings.settings.selectedProjectId
        },
        set (projectId) {
          this.$store.commit('settingsSetSelectedProject', projectId)
          this.$emit('project', this.selectedProject)
        }
      },
      selectedProject: {
        get () {
          return this.projects[this.selectedProjectId] || {}
        }
      },
      projects: {
        get () {
          return this.$store.state.settings.settings.projects
        }
      }
    },
    components: {
      Selector
    },
    mounted () {
      if (this.selectedProject) {
        this.$emit('project', this.selectedProject)
      }
    },
    methods: {
      setSelected (id) {
        this.selectedProjectId = id
      },
      add () {
        let project = {
          id: uuidv4(),
          definitionFile: '',
          middlewaresFile: '',
          htmlFile: ''
        }
        this.$store.commit('settingsAddProject', project)
        this.selectedProjectId = project.id
        this.$refs.projectSettingsModal.show()
      },
      edit (project) {
        this.selectedProjectId = project.id
        this.$refs.projectSettingsModal.show()
      },
      remove (project) {
        this.$store.commit('settingsRemoveProject', project)
      },
      setProjectProperty (project, property, value) {
        console.log(project)
        console.log(property)
        console.log({project: project, property: property, value: value})
        this.$store.commit('settingsSetProjectProperty', {id: project.id, property: property, value: value})
        console.log(this.projects)
      }
    }
  }
</script>

<style lang="less">

</style>
