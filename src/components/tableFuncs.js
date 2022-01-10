function loadNode(/*tree , treeNode,*/ resolve) { 
    setTimeout(() => {
      resolve([
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
      ]);
    }, 1000);
}


//exports.loadNode = loadNode

module.exports = {loadNode }