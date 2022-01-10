<template>
  <div class="string"> 
    <template v-if="this.readonly">
      {{value}}
    </template> 
    <template v-else> 
      <el-input-number v-if="this.list.length ==0"
        :value="editValue" 
      ></el-input-number>
      <el-select v-else v-model="editValue">
        <el-option
          v-for="(item,index) in this.list"
          :key="index"
          :value="item"
          :label="item"
        ></el-option>
      </el-select>  
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Watch,Prop, Vue } from 'vue-property-decorator';

const EditorProps = Vue.extend({
  props: {
    refPropertyId : {
      type: String, 
      required: true,
    }, 
    value : {
      type: Number, 
      default: 0
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
export default class NumberEditor extends EditorProps {
  
  data(){
    return {
      editValue: this.value 
      
    }
  }

  @Watch('editValue', { immediate: true, deep: true })
  onPersonChanged1(val: number, oldVal: number) {
    this.$emit("change",this.refPropertyId, val,oldVal)
  }
    
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped> 
</style>
