import electron from 'electron'
import path from 'path'
import fs from 'fs'
import Vue from 'vue'

const settingsFile = 'postgirl.json'

const settingsPath = path.join((electron.app || electron.remote.app).getPath('userData'), settingsFile)

function save (state) {
  try {
    fs.writeFile(settingsPath, JSON.stringify(state), function (err) {
      console.log(err)
    })
  } catch (err) {
    console.log(err)
  }
}

function load () {
  try {
    return JSON.parse(fs.readFileSync(settingsPath))
  } catch (err) {
    console.log(err)
  }

  return {}
}

const settings = {
  state: {
    settings: {
      apimd: '',
      projects: {},
      selectedProjectId: ''
    }
  },
  mutations: {
    settingsLoad (state) {
      state.settings = Object.assign(state.settings, load())
      console.log(state.settings)
    },
    settingsAddProject (state, project) {
      Vue.set(state.settings.projects, project.id, project)
      save(state.settings)
    },
    settingsRemoveProject (state, project) {
      Vue.delete(state.settings.projects, project.id)
      save(state.settings)
    },
    settingsSetApimd (state, apimd) {
      state.settings.apimd = apimd
      save(state.settings)
    },
    settingsSetProjectProperty (state, data) {
      console.log(data)
      let project = state.settings.projects[data.id]
      if (!project) {
        return
      }

      console.log(project)
      Vue.set(project, data.property, data.value)

      // for (let project of state.settings.projects) {
      //   if (project.id === data.id) {
      //     console.log('here6')
      //     project[data.property] = data.value
      //   }
      // }
      save(state.settings)
    },
    settingsSetSelectedProject (state, projectId) {
      state.settings.selectedProjectId = projectId
      save(state.settings)
    }
  },
  actions: {
    someAsyncTask ({commit}) {
      // do something async
      commit('INCREMENT_MAIN_COUNTER')
    }
  }
}

export default settings
