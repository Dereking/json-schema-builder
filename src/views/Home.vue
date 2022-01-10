<template>
  <div class="home"> 
    <JsonSchemaEditor msg="Welcome to Your Vue.js + TypeScript App"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
//import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import JsonSchemaEditor from '@/components/JsonSchemaEditor.vue'


@Component({
  components: {
    JsonSchemaEditor,
  },
})
export default class Home extends Vue {}
</script>
