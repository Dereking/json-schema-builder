<template>
  <span></span>
</template>

<script lang="ts">
import { Component,ModelSync, Prop, Vue } from 'vue-property-decorator';
import { JsonSchemaBaseSchema } from '../JsonSchema';

const EditorProps = Vue.extend({
  props: {
    refPropertyId : {
      type: String, 
      required: true,
    }, 
    value : {
      type: String, 
      default: ""
    }, 
    readonly :  {
      type: Boolean,
      //required: true,
      default: false
    },
    list : {
      type: Array, 
      default: ()=>{return []} 
    }, 
  }
})

@Component
export default class NullEditor extends EditorProps {
 
  data(){
    return {
      editValue: this.value  
    }
  }  
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped> 
</style>
