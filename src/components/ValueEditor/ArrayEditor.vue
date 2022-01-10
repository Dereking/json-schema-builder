<template>
  <div class="string"> 
    <template v-if="this.readonly">
      {{value}}
    </template>  
  </div>
</template>

<script lang="ts">
import { Component,PropSync, Prop, Vue } from 'vue-property-decorator';
import { JsonSchemaBaseSchema } from '../JsonSchema';

const EditorProps = Vue.extend({
  props: {
    refPropertyId : {
      type: String, 
      required: true,
    }, 
    value : {
      type: Array, 
      default:  ()=>{return []} 
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
export default class ArrayEditor extends EditorProps { 
 
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
