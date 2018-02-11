<template>
  <label class="file-select">
    <!-- We can't use a normal button element here, as it would become the target of the label. -->
    <div class="select-button">
      <!-- Display the filename if a file has been selected. -->
      <span v-if="value">Selected File: {{value}}</span>
      <span v-else>Select File</span>
    </div>
    <!-- Now, the file input that we hide. -->
    <input type="file" @change="handleFileChange"/>
  </label>
</template>

<script>
  export default {
    name: 'selector',
    props: ['value'],
    components: {},
    data: function () {
      return {
        apimd: null
      }
    },
    methods: {
      handleFileChange: function (e) {
        this.$emit('input', e.target.files[0].path)

        // // Asynchronous read
        // fs.readFile(e.target.files[0].path, function (err, data) {
        //   if (err) {
        //     return console.error(err)
        //   }
        //
        //   this.value = data.toString()
        // })
      }
    }
  }
</script>

<style scoped>

</style>