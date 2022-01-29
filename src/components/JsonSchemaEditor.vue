<template>
  <div class="hello">
    <el-row :gutter="5">
      <el-col :span="16">
        <el-table
          :data="editorItems"
          row-key="key"
          border
          default-expand-all
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          highlight-current-row
          @current-change="handleCurrentChange"
          @row-click="handleRowClick"
        >
          <!-- <el-table-column
            prop="key"
            label="Key"
            fixed
            sortable
            width="180"
          >
            <template slot-scope="scope">
              <el-input
                v-if="scope.row.isEdit && scope.row.canRename"
                v-model="scope.row.key"
                placeholder=""
                size="mini"
                style="width: 80px"
              ></el-input>
              <span v-else>{{ scope.row.key }}</span>
            </template>
          </el-table-column> -->
          <el-table-column
            prop="name"
            label="名称"
            fixed
            sortable 
          >
            <template slot-scope="scope">
              <el-input
                v-if="scope.row.isEdit && scope.row.canRename"
                v-model="scope.row.name"
                placeholder=""
                size="mini"  
              ></el-input>
              <span v-else>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型">
            <template slot-scope="scope">
              <el-select
                v-if="scope.row.isEdit"
                v-model="scope.row.schemaType"
                clearable
                placeholder="请选择"
                @change="onTypeChange(scope.$index, scope.row)"
              >
                <!-- Null, Object, Array, String, Number, Boolean -->
                <el-option value="Null" label="Null"></el-option>
                <el-option value="Object" label="Object"></el-option>
                <el-option value="Array" label="Array"></el-option>
                <el-option value="String" label="String"></el-option>
                <el-option value="Number" label="Number"></el-option>
                <el-option value="Boolean" label="Boolean"></el-option>
              </el-select>
              <span v-else><i class="el-icon-information"></i>{{ scope.row.schemaType }}</span>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="value" label="值" sortable width="280">
            <template slot-scope="scope">
              <i class="el-icon-time"></i>
              <span style="margin-left: 10px">{{ scope.row.value }}</span>
              <component v-bind:is="scope.row.schemaType + 'Editor'"
                value="scope.row.value"
                readonly="scope.row.isEdit"
                v-on:commit-edit="alert()"
              > 
              </component>
            </template>
          </el-table-column> -->

          <el-table-column fixed="right" label="操作">
            <template slot-scope="scope">

              <el-dropdown 
                :disabled="
                  scope.row.schemaType != 'Array' &&
                  scope.row.schemaType != 'Object'
                " 
                >
                <el-button type="primary" size="mini"  >
                  <i class="el-icon-plus"></i><i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                
                <el-dropdown-menu slot="dropdown" >  
                  <el-dropdown-item><a @click="handleAddChild(scope.$index, scope.row)">String Type</a></el-dropdown-item>
                  <el-dropdown-item>狮子头</el-dropdown-item>
                  <el-dropdown-item>螺蛳粉</el-dropdown-item>
                  <el-dropdown-item>双皮奶</el-dropdown-item>
                  <el-dropdown-item>蚵仔煎</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown> 
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.$index, scope.row)"
                ><i class="el-icon-minus"></i
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="8"> 
        <el-table :data="curObj"  >
          <el-table-column label="属性" sortable prop="name"></el-table-column>
          <el-table-column label="值" 
            :filters="[{ text: '未定义', value: 'undefined' },{ text: '已定义值', value: 'defined' }  ]"
            :filter-method="filterPropertyValue"
            filter-placement="bottom-end"
          >
            <template slot-scope="scope">  
                <component  v-bind:is="scope.row.propType + 'Editor'" 
                  v-model="scope.row.value"
                  :refPropertyId="scope.row.name" 
                  :readonly="scope.row.readonly"
                  v-on:change="onPropertyChange"
                  :list="scope.row.list"
                > 
                </component>
            </template>
          </el-table-column>
        </el-table> 
      </el-col>
    </el-row>
    <div>
      <el-button type="primary" @click="load">load</el-button>
      <el-button type="primary" @click="save">save</el-button>
      <el-button type="primary" @click="test">test</el-button>
    </div>
  </div>
</template>
 
<script lang="ts">
/* eslint-disable */

import { Component, Prop, Vue, Watch, Emit } from "vue-property-decorator";

import NullEditor from "./ValueEditor/NullEditor.vue";
import ArrayEditor from "./ValueEditor/ArrayEditor.vue";
import ObjectEditor from "./ValueEditor/ObjectEditor.vue";
import StringEditor from "./ValueEditor/StringEditor.vue";
import NumberEditor from "./ValueEditor/NumberEditor.vue";

import {
  JsonSchemaDocument,
  JsonSchemaBaseSchema,
  JsonSchemaDataType,
} from "./JsonSchema";

import { TreeData, TreeNode } from "element-ui/types/tree";
// import ElTreeNode from './tree-node.vue';
//import {loadNode} from './tableFuncs'; 

@Component({
  components: {
    NullEditor,
    ArrayEditor,
    ObjectEditor,
    StringEditor,
    NumberEditor,
  },
})
export default class JsonSchemaEditor extends Vue {
  @Prop() private msg!: string;

  @Prop({ default: 0 }) public num!: number;

  curID = 0;
  schemaDoc: JsonSchemaDocument = new JsonSchemaDocument();

  editorItems: Array<JsonSchemaBaseSchema> = [this.schemaDoc];

  curObj = this.schemaDoc.getProperties();
  edtingRow: JsonSchemaBaseSchema|null = null; 

  tableData = [
    {
      id: 1,
      date: "2016-05-02",
      name: "王小虎",
      address: "上海市普陀区金沙江路 1518 弄",
    },
    {
      id: 2,
      date: "2016-05-04",
      name: "王小虎",
      address: "上海市普陀区金沙江路 1517 弄",
    },
    {
      id: 3,
      date: "2016-05-01",
      name: "王小虎",
      address: "上海市普陀区金沙江路 1519 弄",
      children: [
        {
          id: 31,
          date: "2016-05-01",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1519 弄",
        },
        {
          id: 32,
          date: "2016-05-01",
          name: "王小虎",
          address: "上海市普陀区金沙江路 1519 弄",
        },
      ],
    },
    {
      id: 4,
      date: "2016-05-03",
      name: "王小虎",
      address: "上海市普陀区金沙江路 1516 弄",
    },
  ];

  loadChildrenMethod(row: any) {
    // 异步加载子节点
    return new Promise((resolve) => {
      // resolve(this.editorItems.row.key)
    });
  }
  filterPropertyValue(value:any, row:JsonSchemaBaseSchema) {
    if (value == 'undefined')
      return !row.value 
    if (value == 'defined')
      return !!row.value 
  }

  onPropertyChange(key:string, val:string):void{
    console.log("onPropertyChange","key",key,"val",val,"curObj",this.curObj,"edtingRow:",this.edtingRow );  
    if (this.edtingRow)
      this.edtingRow[key] = val
  }
 
  handleAddChild(index: number, row: JsonSchemaBaseSchema) {
    row.NewSubSchema();
    console.log("handleAddChild schema", index, row);
  }
  handleDelete(index: number, row: JsonSchemaBaseSchema) {
    console.log("handleDelete",index, row);
  }

  handleCurrentChange(row: JsonSchemaBaseSchema) {

    this.curObj = row.getProperties();
    this.edtingRow = row
    //row.isEdit = true;
    console.log("handleCurrentChange,", row,"this.curObj",this.curObj);
  }

  handleRowClick(row: JsonSchemaBaseSchema, column :any, event:any) {

    console.log("handleRowClick", column);

   // this.cancelEdit(); 
  }
  cancelEdit() {
    console.log("cancelEdit");

    if (this.edtingRow != null) {
      this.edtingRow.isEdit = false;
      this.edtingRow = null;
    }
  }

  onTypeChange(index: number, row: JsonSchemaBaseSchema): void {
    //row.isEdit = false
  }

  created() {
    console.log("vue created");
    // this.schemaDoc = new JsonSchemaDocument("")
  }

  mounted() {
    document.addEventListener("click", (e) => {
      console.log("click ", this.$el, e.target);
      //if (!this.$el.contains(e.target)){
      if (this.edtingRow != null) {
        //  this.cancelEdit()
      }
    });

    console.log("ok", this.schemaDoc);
    this.load();
  }

  load() {
    this.schemaDoc.LoadFromUrl("/test.json", function () {
      console.log("ok");
    });
  }
  test() {
    console.log(this.schemaDoc);
    
  }
  save() {
    const a = this.schemaDoc.toJson();
    console.log("save", JSON.stringify(a));
  }

  append(data: any) {
    console.log("add node :", data, typeof data);

    const newChild = {
      key: this.curID++,
      val: "testtest",
      label: "testttt",
      children: [],
    };
    if (!data.children) {
      this.$set(data, "children", []);
    }
    data.children.push(newChild);
  }

  remove(node: any, data: any) {
    // const parent = node.parent;
    // const children = parent.data.children || parent.data;
    // const index = children.findIndex(d => d.key === data.key);
    // children.splice(index, 1);
  }

  // renderContent(h, { node, data, store }) {
  //   return (
  //     <span class="custom-tree-node">
  //       <span>{node.label}</span>
  //       <span>
  //         <el-button size="mini" type="text" on-click={ () => this.append(data) }>Append</el-button>
  //         <el-button size="mini" type="text" on-click={ () => this.remove(node, data) }>Delete</el-button>
  //       </span>
  //     </span>);
  // }

  handleDragStart(node: TreeNode<any, TreeData>, ev: any) {
    console.log("drag start", node);
  }
  handleDragEnter(
    draggingNode: TreeNode<any, TreeData>,
    dropNode: TreeNode<any, TreeData>,
    ev: any
  ) {
    console.log("tree drag enter: ", dropNode.label);
  }
  handleDragLeave(
    draggingNode: TreeNode<any, TreeData>,
    dropNode: TreeNode<any, TreeData>,
    ev: any
  ) {
    console.log("tree drag leave: ", dropNode.label);
  }
  handleDragOver(
    draggingNode: TreeNode<any, TreeData>,
    dropNode: TreeNode<any, TreeData>,
    ev: any
  ) {
    console.log("tree drag over: ", dropNode, dropNode.label);
  }
  handleDragEnd(
    draggingNode: TreeNode<any, TreeData>,
    dropNode: TreeNode<any, TreeData>,
    dropType: any,
    ev: any
  ) {
    console.log("tree drag end: ", dropNode && dropNode.label, dropType);
  }
  handleDrop(
    draggingNode: TreeNode<any, TreeData>,
    dropNode: TreeNode<any, TreeData>,
    dropType: any,
    ev: any
  ) {
    console.log("tree drop: ", dropNode.label, dropType);
  }

  allowDrop(
    draggingNode: TreeNode<any, TreeData>,
    dropNode: TreeNode<any, TreeData>,
    type: "prev" | "inner" | "next"
  ): boolean {
    // if (dropNode.data.label === '二级 3-1') {
    //   return type !== 'inner';
    // } else {
    //   return true;
    // }
    return true;
  }
  allowDrag(draggingNode: TreeNode<any, TreeData>): boolean {
    return true;
    // if (draggingNode == null || draggingNode.data == null || draggingNode.data.label == null)
    //   return false;
    // return draggingNode.data.label.indexOf('三级 3-2-2') === -1;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tree-line {
  display: block;
  min-width: 280px;
  float: left;
  text-align: left;
}
.tree-line .label {
  min-width: 280px;
}
.tree-line .type {
  min-width: 280px;
}
.tree-line .val {
  min-width: 280px;
}
</style>
