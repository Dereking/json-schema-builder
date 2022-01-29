<template>
  <div> 
    <template v-if="this.readonly">
      {{value}}
    </template>
    <template v-else> 
      <el-input v-if="this.list.length ==0"
        v-model="editValue"  
        @change="onValueChange"
      ></el-input>
      <el-select v-else v-model="editValue" 
        @change="onValueChange">
        <el-option
          v-for="(item,index) in list"
          :key="index"
          :value="item"
          :label="item"
        ></el-option>
      </el-select>  
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

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
export default class StringEditor extends EditorProps {  
   
  // data(){
  //   return {
  //     editValue: this.value 
      
  //   }
  // }
  editValue = this.value 

  onValueChange(val : string){
    this.$emit('input', val)
    this.$emit('change', this.refPropertyId, val)
  }
    
  @Watch('value', { immediate: true, deep: true })
  onChanged1(val: string, oldVal: string) {
    this.editValue = val
  }
 
}
 
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped> 
</style>
