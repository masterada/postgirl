import electron from 'electron'
import path from 'path'
import fs from 'fs'

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
      apimd: ''
    }
  },
  mutations: {
    settingsLoad (state) {
      state.settings = Object.assign(state.settings, load())
    },

    settingsSetApimd (state, apimd) {
      state.settings.apimd = apimd
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
