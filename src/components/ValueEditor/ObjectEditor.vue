<template>
  <div> 
    <template v-if="this.readonly">
      {{value}}
    </template>
      {{value}}
  </div>
</template>

<script lang="ts">
import { Component,PropSync , Prop, Vue } from 'vue-property-decorator';
import { JsonSchemaDataType } from '../JsonSchema';

const EditorProps = Vue.extend({
  props: {
    refPropertyId : {
      type: String, 
      required: true,
    }, 
    value : {
      type: Object, 
      default:  ()=>{return {}} 
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
export default class ObjectEditor extends EditorProps {
  
  data(){
    return {
      editValue: this.value  
    }
  }
  
  onValueChange(val : string){
    this.$emit('input', val)
    this.$emit('change', this.refPropertyId, val)
  }
    
    
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped> 
</style>
