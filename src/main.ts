import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'



import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);


// import 'xe-utils'
// import VXETable from 'vxe-table'
// import VXETablePluginElement from 'vxe-table-plugin-element' 
// import 'vxe-table-plugin-element/dist/style.css'
   
//import 'vxe-table/lib/style.css'

// VXETable.use(VXETablePluginElement)
// Vue.use(VXETable);
// Vue.prototype.$XModal = VXETable.modal 


Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
