//http://json-schema.org/draft/2020-12/json-schema-core.html

//import { prototype } from "vue/types/umd"

export enum JsonSchemaDataType   { Null="Null", Object="Object", Array="Array", String="String", Number="Number", Boolean ="Boolean" }

export type TJsonSchemaValueAnyType = JsonSchemaBaseSchema |boolean|string| number|Array<unknown>|Record<string, unknown>| null |undefined

let uniqid= 1

//原始 JsonSchema 类型
export class JsonSchema{ 
    $schema :string|null|undefined = undefined
    $id  :string|null|undefined = undefined
    $vocabulary :Array<string>

    constructor(obj : any){
        this.$vocabulary  = []

        Object.assign(this, obj)
        Object.assign(this.$vocabulary, obj["$vocabulary"])
    }
}



//interface LooseObject extends Record<string, unknown>{}
interface LooseObject {
    // key: string
    // val?:unknown 
    [key: string]: unknown
}

//result of toJson() function 
export class JsonSchemaRes implements LooseObject{
    [key: string]: unknown 
}

export class JsonSchemaPropertyDef{
    name :string 
    propType:JsonSchemaDataType
    list: Array<string>
    value : TJsonSchemaValueAnyType 
    readonly = false
    constructor(name : string,propType: JsonSchemaDataType, list: Array<string>, value :TJsonSchemaValueAnyType,readonly:boolean ){
        this.name= name
        this.value = value
        this.list = list
        this.propType = propType
        this.readonly= readonly
    }
}

//base schema class .
export class JsonSchemaBaseSchema implements LooseObject {
    uid = "uid"+(uniqid++) 
    isEdit =false

    name  = "" //name of the schema 
    title :string |undefined = undefined
    description :string |undefined = undefined
    schemaType : JsonSchemaDataType = JsonSchemaDataType.Null
    value :TJsonSchemaValueAnyType
    default : TJsonSchemaValueAnyType

    $schema :string |undefined = undefined
    $id :string |undefined = undefined

    $anchor :string |undefined = undefined
    $dynamicAnchor :string |undefined = undefined 

    
   // hasChildren = false
    children: Array<JsonSchemaBaseSchema>   = []
    canRename = false


    constructor(name :string, jtype : JsonSchemaDataType, val :TJsonSchemaValueAnyType,canRename :boolean,title?:string) { 
        this.value = val
        this.name = name
        this.title = title
        this.schemaType = jtype
        this.canRename = canRename
    }
    [key: string]: unknown
    public getProperties():Array<JsonSchemaPropertyDef>{
        const ret=[]
        //Null="Null", Object=, Array=, String=}
        ret.push(new JsonSchemaPropertyDef("type", JsonSchemaDataType.String, ["Null","Object","String","Array", "Number", "Boolean" ], this.schemaType,false))
        ret.push(new JsonSchemaPropertyDef("$schema",JsonSchemaDataType.String,[], this.$schema,false))
        ret.push(new JsonSchemaPropertyDef("$id",JsonSchemaDataType.String,[], this.$id,false))
        ret.push(new JsonSchemaPropertyDef("name",JsonSchemaDataType.String,[], this.name,true))
        ret.push(new JsonSchemaPropertyDef("title",JsonSchemaDataType.String,[],this.title,false))
        ret.push(new JsonSchemaPropertyDef("description",JsonSchemaDataType.String,[],this.description,false))
       //ret.push(new JsonSchemaPropertyDef("children",this.children,false))
        //ret.push(new JsonSchemaPropertyDef("$vocabulary",JsonSchemaDataType.Array,[],this.$vocabulary,false))
        ret.push(new JsonSchemaPropertyDef("$anchor",JsonSchemaDataType.String,[],this.$anchor,false))
        ret.push(new JsonSchemaPropertyDef("$dynamicAnchor",JsonSchemaDataType.String,[],this.$dynamicAnchor,false))
        ret.push(new JsonSchemaPropertyDef("value",JsonSchemaDataType.Object,[], this.value,false))
        ret.push(new JsonSchemaPropertyDef("default",JsonSchemaDataType.Object,[], this.default,false))
       
        console.log(ret);
        
        return ret
    }

    toJson():JsonSchemaRes {
        const ret = new JsonSchemaRes()
        this.children.forEach(c => {
            (<LooseObject> ret) [c.name] =c.toJson()
        });

        if(this.canRename){
            (<LooseObject> ret)['name'] = this.name
        }
        (<LooseObject> ret)['type'] =  this.schemaType .toLocaleLowerCase()

        if (this.title != undefined ) (<LooseObject> ret) ['title'] = this.title   
        if (this.description != undefined )(<LooseObject> ret) ['description'] = this.description 
        if (this.$schema != undefined )(<LooseObject> ret) ['$schema'] = this.$schema 
        if (this.$id != undefined )(<LooseObject> ret) ['$id'] = this.$id 
        if (this.$anchor != undefined )(<LooseObject> ret) ['$anchor'] = this.$anchor 
        if (this.$dynamicAnchor != undefined ) 
          (<LooseObject> ret)['$dynamicAnchor'] = this.$dynamicAnchor 
        return ret 
    }

    public NewSubSchema(){ 
            this.children .push( new JsonSchemaDefault()) 
    } 
    
    public AddSubSchema(name:string, schema: JsonSchemaBaseSchema){
        console.log("add", name,schema);
        this.children.push(schema)
        //this.hasChildren = true 
    }
}



//创建jsonschema的document 类
export class JsonSchemaDocument   extends JsonSchemaBaseSchema {
    MediaType= "application/schema+json";
    url = ""

    //$schema: JsonSchema$schema 
    //$id: JsonSchema$id 
    // $vocabulary: Array<string> =[]
    // properties: JsonSchemaProperties

    //jsonschema 文档对象反序列化后。
    jsonschemaObj: JsonSchema 

    constructor() {
        super("ROOT",JsonSchemaDataType.Object,undefined,true) 

        this.jsonschemaObj = new JsonSchema({})
      // this.$schema = new JsonSchema$schema($schema)
        //this.$id = new JsonSchema$id($schema)
        // this.$vocabulary = new JsonSchema$vocabulary([])

        // this.properties = new JsonSchemaProperties()


        this.AddSubSchema("$vocabulary",new JsonSchema$vocabulary([])) 
        this.AddSubSchema("properties",new JsonSchemaProperties()) 
        this.AddSubSchema("$defs",new JsonSchema$defs()) 
    }

    public test(): string {
        return "dd"
    }

    public LoadFromUrl(jsonUrl :string, clb:()=>void):void {
 
        this.url = jsonUrl

        const that = this
        this.load(this.url, (json: string) => {
            console.log(json);

            this.jsonschemaObj = JSON.parse(json);
            console.log(this.jsonschemaObj);
            

           // this.$schema = new JsonSchema$schema(this.jsonschemaObj.$schema)
           // this.$id = new JsonSchema$id(this.jsonschemaObj.$id)
          //  this.$vocabulary = new JsonSchema$vocabulary([])
            clb()
        }, (err) => {
            console.log("err", err) 
        }) 
    }

    private load(url: string, clb: (json: string) => void, onError: (err: string) => void): void {
        const xhr = new XMLHttpRequest()
        xhr.open('GET', url)
        xhr.send()
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                //var json =
                clb(xhr.responseText)
            } else {
                onError("status=" + xhr.status + ", response=" + xhr.responseText)
            }
        }
        xhr.onerror = function () {
            onError("status=" + xhr.status + ", response=" + xhr.responseText)
        }
    }
 
}

//DefaultSchema
export class JsonSchemaDefault extends JsonSchemaBaseSchema {
    constructor() {
        super("key"+ (uniqid++), JsonSchemaDataType.String,"",true);
    }
}

//VocabularySubSchema
export class JsonSchemaVocabularySubSchema extends JsonSchemaBaseSchema {
    constructor() {
        super("https://json-schema.org/draft/2020-12/vocab/core", JsonSchemaDataType.Boolean,
            true,true);
    }
}



//$schema
//"$schema": "https://json-schema.org/draft/2020-12/schema",
export class JsonSchema$schema extends JsonSchemaBaseSchema {
    constructor($schema: string) {
        if ($schema == "")
            $schema = "https://json-schema.org/draft/2020-12/schema"
        super("$schema", JsonSchemaDataType.String, $schema,false);
    }
}


//$id
//"$id": "https://json-schema.org/draft/2020-12/schema",
export class JsonSchema$id extends JsonSchemaBaseSchema {
    constructor($id: string) {
        if ($id == "")
            $id = "https://example.org/draft/2020-12/schema"
        super("$id", JsonSchemaDataType.String, $id,false);
    }
}
  


//$vocabulary
/*
"$vocabulary": {
    "https://json-schema.org/draft/2020-12/vocab/core": true,
    "https://json-schema.org/draft/2020-12/vocab/applicator": true,
    "https://json-schema.org/draft/2020-12/vocab/validation": true,
    "https://example.com/vocab/example-vocab": true
  },
*/
export class JsonSchema$vocabulary extends JsonSchemaBaseSchema  {
    constructor(uris: Array<boolean>) {
        const val: LooseObject = {}
        uris.forEach(uri => {
            val.uri = true
        });
        super("$vocabulary",  JsonSchemaDataType.Array, val,false);
    }

    toJson():JsonSchemaRes {
        const ret = new JsonSchemaRes()
        this.children.forEach(c => {
            (<LooseObject> ret)[c.name] = true
        });
 
        return ret  
    }
 
    public NewSubSchema(){ 
        this.children.push( new JsonSchemaVocabularySubSchema()) 
} 
}


//$ref 引用
//"$ref": "some ref",
//                    "$ref": "#/$defs/enabledToggle",
export class JsonSchema$ref extends JsonSchemaBaseSchema {
    constructor($ref: string) {
        super("$ref", JsonSchemaDataType.String,  $ref,false);
    }
}

//$dynamicRef 引用
//"$dynamicRef": "some dynamicRef",
//"$dynamicRef": "#node"
export class JsonSchema$dynamicRef extends JsonSchemaBaseSchema {
    constructor($dynamicRef: string) {
        super("$ref",  JsonSchemaDataType.String, $dynamicRef,false);
    }
}

//$defs 引用
// "properties": {
//     "enabled": {
//         "description": "If set to null, Feature B
//                         inherits the enabled
//                         value from Feature A",
//         "$ref": "#/$defs/enabledToggle"
//     }
// }
// "$defs": {
//     "enabledToggle": {
//         "title": "Enabled",
//         "description": "Whether the feature is enabled (true),
//                         disabled (false), or under
//                         automatic control (null)",
//         "type": ["boolean", "null"],
//         "default": null
//     }
// }
export class JsonSchema$defs extends JsonSchemaBaseSchema {
    constructor() {
        super("$defs",  JsonSchemaDataType.Object, {},false);
    }

    AddDef(defname: string, def: JsonSchema$def): void {
        Object.assign(this, { defname: def })
        //this.defname = def
    }
}

export class JsonSchema$def extends JsonSchemaBaseSchema {
    constructor(name: string, val: any) {
        super(name,  JsonSchemaDataType.String, val,false);
    }
}
 

export class JsonSchemaProperties extends JsonSchemaBaseSchema {
    constructor() {
        super("properties",  JsonSchemaDataType.Object, new JsonSchemaDefault(),false);
    }
}


 
/*
/////////////////////

/// 描述jsonschema json 的 JsonSchemaDefinition
class JsonSchemaDefinition {

    MediaType= "application/schema+json";
    public PropertyName: JsonSchemaDefinitionProperty
        = new JsonSchemaDefinitionProperty("name", JsonSchemaDefinitionPropertyType.Name,
            "Name", "Product", "name of this filed");
    public PropertyTitle: JsonSchemaDefinitionProperty
        = new JsonSchemaDefinitionProperty("title", JsonSchemaDefinitionPropertyType.Title,
            "Title:", "Product", "Title of this schema");
    public PropertyDescription: JsonSchemaDefinitionProperty
        = new JsonSchemaDefinitionProperty("description", JsonSchemaDefinitionPropertyType.Description,
            "Description", "Description of this field",  "Description of this schema");
    public PropertySchema: JsonSchemaDefinitionProperty
        = new JsonSchemaDefinitionProperty("$schema", JsonSchemaDefinitionPropertyType.Schema,
            "https://json-schema.org/draft/2020-12/schema", "Title:", "$Schema of this schema");
    public PropertyId: JsonSchemaDefinitionProperty
        = new JsonSchemaDefinitionProperty("$id", JsonSchemaDefinitionPropertyType.ID,
            "https://example.com/polygon", "Title:",  "Schema ID of this schema");
    public PropertyProperties: JsonSchemaDefinitionProperty
        = new JsonSchemaDefinitionProperty("properties", JsonSchemaDefinitionPropertyType.Properties,
            new JsonSchemaProperty(), "Title:",  "Title of this schema"
        );
    public PropertyRequired: JsonSchemaDefinitionProperty
        = new JsonSchemaDefinitionProperty("required", JsonSchemaDefinitionPropertyType.Required, [],
            "Title:", "Title of this schema");
    public PropertyType: JsonSchemaDefinitionProperty = new JsonSchemaDefinitionProperty("type",
        JsonSchemaDefinitionPropertyType.Type, JsonSchemaFieldType.Object,
        "Title:", "Title", "Title of this schema");

    public JsonSchemaDefinitionProperties: Array<JsonSchemaDefinitionProperty> = [
        this.PropertySchema,
        this.PropertyId,
        this.PropertyName,
        this.PropertyTitle,
        this.PropertyType,
        this.PropertyDescription,
        this.PropertyProperties,
        this.PropertyRequired
    ]
}

//json schema 属性的类型。
enum JsonSchemaDefinitionPropertyType { Schema, Type, Name, ID, Properties, Required, Title, Description, Defs }

//json schema的 属性。
class JsonSchemaDefinitionProperty {
    name: string;
    type: JsonSchemaDefinitionPropertyType;
    value: any;

    default: any;
    $ref: string;
    description: string;

    // 子属性。比如properties
    children: Array<JsonSchemaDefinitionProperty>;
    //是否有子属性
    hasChildren = false;


    constructor(name: string, type: JsonSchemaDefinitionPropertyType, val: any, defaultVal: any, description: string) {
        this.name = name;
        this.type = type;
        this.value = val;
        this.default = defaultVal;
        this.$ref = "";
        this.description = description;
        this.children = [
        ]
        console.log("type:", typeof (val), val)

        switch (type) {
            case JsonSchemaDefinitionPropertyType.Properties:
                // this.children = [
                //     new JsonSchemaDefinitionProperty("user",JsonSchemaDefinitionPropertyType.Properties, "test" )
                // ]
                this.hasChildren = true;
                break;
            default:
                this.hasChildren = false;
                break;
        }
    }
}

 

class JsonSchemaDefinitionProperty$schema {
    name = "$schema"
    defaultVal = 'https://json-schema.org/draft/2020-12/schema'
    val = 'https://json-schema.org/draft/2020-12/schema'

    constructor(val : string){
        this.val = val;
    } 
} 


 

class JsonSchemaDefinitionProperty$id {
    name = "$id"
    defaultVal = 'https://example.com/jsonschema/product.json'
    val = 'https://example.com/jsonschema/product.json'

    constructor(val : string){
        this.val = val;
    } 
} 


class JsonSchemaDefinitionProperty$defs {
    name = "$id"
    defaultVal = 'https://example.com/jsonschema/product.json'
    val = 'https://example.com/jsonschema/product.json'

    constructor(val : string){
        this.val = val;
    } 
} 








//////////
enum JsonSchemaFieldType { Null, Object, String, Number, Boolean, Array }


class JsonSchemaProperty {
    name = "";
    val = "";
}

class JsonSchemaRef {

}


class JsonSchema {
    // 字段 
    // "$id": ,
    // "$schema": ,
    $schema = "https://json-schema.org/draft/2020-12/schema";
    $id = "https://example.com/polygon";
    name = "";
    $type: JsonSchemaFieldType = JsonSchemaFieldType.Object;
    //$ref : JsonSchemaRef = null;


    // 构造函数 
    constructor(id: string, jname: string, jtype: JsonSchemaFieldType) {
        this.$id = id
        this.name = jname
        this.$type = jtype
    }

    // 方法 
    disp(): void {
        console.log("")
    }
}


export {
    JsonSchemaDefinition,
    JsonSchema, JsonSchemaRef, JsonSchemaProperty, JsonSchemaFieldType
}


*/