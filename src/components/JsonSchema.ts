//http://json-schema.org/draft/2020-12/json-schema-core.html

//import { prototype } from "vue/types/umd"

export enum JsonSchemaDataType { Null = "Null", Object = "Object", Array = "Array", String = "String", Number = "Number", Boolean = "Boolean" }

export type TJsonSchemaValueAnyType = JsonSchemaBaseSchema | boolean | string | number | Array<unknown> | Record<string, unknown> | null | undefined
 
const keywords=[
    "$schema","$id","$vocabulary", "$anchor" ,

    "type","name",

    "$comment",
    "$ref","$refs","$dynamicRef",

    "$defs" ,

    //Keywords for Applying Subschemas to Objects
    "properties",
    "patternProperties",   
    "additionalProperties",//"additionalProperties", whose behavior is defined in terms of "properties" and "patternProperties"
    "propertyNames",//If the instance is an object, this keyword validates if every property name in the instance validates against the provided schema.
                    // Note the property name that the schema is testing will always be a string.
    
    "default",
    "maxLength",
    "exclusiveMinimum" ,
    "allOf" , //This keyword's value MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.
    "anyOf",//This keyword's value MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.
    "oneOf",//This keyword's value MUST be a non-empty array. Each item of the array MUST be a valid JSON Schema.
    "not",// This keyword's value MUST be a valid JSON Schema.

    //"if", "then", and "else" MUST NOT interact with each other across subschema boundaries.
    // In other words, an "if" in one branch of an "allOf" MUST NOT have an impact on a "then" or "else" in another branch.
    "if",//This keyword's value MUST be a valid JSON Schema.
    "then", 
    "else",

    //Keywords for Applying Subschemas to Child Instances

    //This keyword applies its subschema to all instance elements at indexes greater
    // than the length of the "prefixItems" array in the same schema object,
    // as reported by the annotation result of that "prefixItems" keyword. 
    //If no such annotation result exists, "items" applies its subschema to all instance array elements. [CREF11]
    "items", // whose behavior is defined in terms of "prefixItems" 
    
    "prefixItems", //The value of "prefixItems" MUST be a non-empty array of valid JSON Schemas.
    "contains", //whose behavior is defined in terms of "minContains"

    "minContains",


    //A Vocabulary for Unevaluated Locations
    "unevaluatedItems", //whose behavior is defined in terms of annotations from "prefixItems", "items", "contains", and itself
    "unevaluatedProperties", //whose behavior is defined in terms of annotations from "properties", "patternProperties",
                            // "additionalProperties" and itself

] 


//id seed for object key.
let uniqid = 1

//原始 JsonSchema 类型
export class JsonSchema {
    $schema: string | null | undefined = undefined
    $id: string | null | undefined = undefined
    $vocabulary: Array<string>

    constructor(obj: any) {
        this.$vocabulary = []

        Object.assign(this, obj)
        Object.assign(this.$vocabulary, obj["$vocabulary"])
    }
}



//for inject key-value to object.
interface LooseObject {
    [key: string]: unknown
}

//result of toJson() function 
export class JsonSchemaRes implements LooseObject {
    [key: string]: unknown
}

//json schema property defination.
export class JsonSchemaPropertyDef {
    name: string
    propType: JsonSchemaDataType
    list: Array<string> //a list for value can be.
    value: TJsonSchemaValueAnyType
    readonly = false
    constructor(name: string, propType: JsonSchemaDataType, list: Array<string>, value: TJsonSchemaValueAnyType, readonly: boolean) {
        this.name = name
        this.value = value
        this.list = list
        this.propType = propType
        this.readonly = readonly
    }
}

//base schema class .
//there are 2 kinds of properties in a JsonSchemaBaseSchema object:
// 1. key-value , include indected properties. name\key\'properties'\$scehma 
// 2. children object, for example, properties in 'properties' scehma.
// the key-value properties are edited in object inspector panel.
// the children properties  are edited in main object inspector panel .
export class JsonSchemaBaseSchema implements LooseObject {
    //injected key-value properties
    //for key-value injection
    [key: string]: unknown

    // parent : JsonSchemaBaseSchema |null = null

    //children properties
    //children store the ([key: string]: unknown) key and value. for el-table display.
    children: Array<JsonSchemaBaseSchema> = []


    //meta key-value properties

    //key of the schema in parent object. {"key":{}}
    key: string
    //name of the schema 
    name: string | undefined = undefined
    title: string | undefined = undefined

    //description :string |undefined = undefined
    description: string | undefined = undefined
    schemaType: JsonSchemaDataType = JsonSchemaDataType.Null
    value: TJsonSchemaValueAnyType
    default: TJsonSchemaValueAnyType

    $schema: string | undefined = undefined
    $id: string | undefined = undefined

    $anchor: string | undefined = undefined
    $dynamicAnchor: string | undefined = undefined



    //辅助属性。 
    parentType: JsonSchemaDataType | null = null
    parentName: string | null | undefined = null
    isEdit = false
    canRename = false


    constructor(parent: JsonSchemaBaseSchema | null, key: string, name: string, jtype: JsonSchemaDataType, val: TJsonSchemaValueAnyType, canRename: boolean, title?: string) {

        let newkey = !key ? "key" + (uniqid++) : key
        if (parent != null && parent.hasChildByKey(newkey)) {
            newkey = key + "_" + (uniqid++)
        }
        this.key = newkey

        // this.parent = parent
        this.parentType = parent ? parent.schemaType : null
        this.parentName = parent ? parent.name : null
        console.log("constructor parentName", this.parentName, this.parentType);

        this.name = name
        this.title = title
        this.schemaType = jtype
        this.value = val
        this.canRename = canRename

        console.log("constructor  ", this.name);
        
        if (this.name =="ROOT"){
             this.AddSubSchema("properties", new JsonSchemaProperties(this))
        }
    }

    private hasChildByKey(key: string): boolean {
        for (let index = 0; index < this.children.length; index++) {
            const child = this.children[index];
            if (child.key == key)
                return true
        }
        return false
    }


    public getProperties(): Array<JsonSchemaPropertyDef> {
        const ret = []
        //Null="Null", Object=, Array=, String=}
        ret.push(new JsonSchemaPropertyDef("schemaType", JsonSchemaDataType.String, ["Null", "Object", "String", "Array", "Number", "Boolean"], this.schemaType, false))

        const readonly = !!(this.parentName && this.parentName != 'properties')
        ret.push(new JsonSchemaPropertyDef("key", JsonSchemaDataType.String, [], this.key, readonly))

        ret.push(new JsonSchemaPropertyDef("name", JsonSchemaDataType.String, [], this.name, false))

        ret.push(new JsonSchemaPropertyDef("title", JsonSchemaDataType.String, [], this.title, false))
        ret.push(new JsonSchemaPropertyDef("description", JsonSchemaDataType.String, [], this.description, false))
        ret.push(new JsonSchemaPropertyDef("$schema", JsonSchemaDataType.String, [], this.$schema, false))
        ret.push(new JsonSchemaPropertyDef("$id", JsonSchemaDataType.String, [], this.$id, false))

        ret.push(new JsonSchemaPropertyDef("value", JsonSchemaDataType.Object, [], this.value, false))
        ret.push(new JsonSchemaPropertyDef("default", JsonSchemaDataType.Object, [], this.default, false))
        //ret.push(new JsonSchemaPropertyDef("children",this.children,false))
        //ret.push(new JsonSchemaPropertyDef("$vocabulary",JsonSchemaDataType.Array,[],this.$vocabulary,false))
        ret.push(new JsonSchemaPropertyDef("$anchor", JsonSchemaDataType.String, [], this.$anchor, false))
        ret.push(new JsonSchemaPropertyDef("$dynamicAnchor", JsonSchemaDataType.String, [], this.$dynamicAnchor, false))

        console.log("getProperties ===", ret);

        return ret
    }

    // setValue(key:string, val: string){

    // }


    toJson(): JsonSchemaRes {
        const ret = new JsonSchemaRes()
        this.children.forEach(c => {
            if (c.name) {
                (<LooseObject>ret)[c.name] = c.toJson()
            }
        });

        if (this.canRename) {
            (<LooseObject>ret)['name'] = this.name
        }
        (<LooseObject>ret)['type'] = this.schemaType.toLocaleLowerCase()

        if (this.title != undefined) (<LooseObject>ret)['title'] = this.title
        if (this.description != undefined) (<LooseObject>ret)['description'] = this.description
        if (this.$schema != undefined) (<LooseObject>ret)['$schema'] = this.$schema
        if (this.$id != undefined) (<LooseObject>ret)['$id'] = this.$id
        if (this.$anchor != undefined) (<LooseObject>ret)['$anchor'] = this.$anchor
        if (this.$dynamicAnchor != undefined)
            (<LooseObject>ret)['$dynamicAnchor'] = this.$dynamicAnchor 


        return ret
    }

    public NewSubSchema() {
        this.children.push(new JsonSchemaString(this, ""))
    }

    public AddSubSchema(name: string, schema: JsonSchemaBaseSchema) {
        this.children.push(schema)
    }
}



//创建jsonschema的document 类
export class JsonSchemaDocument extends JsonSchemaBaseSchema {
    MediaType = "application/schema+json";
    url = ""

    // properties : JsonSchemaProperties = new JsonSchemaProperties(this)
    // $vocabulary : JsonSchema$vocabulary = new JsonSchema$vocabulary(this,[])
    // $defs : JsonSchema$defs = new JsonSchema$defs(this)

    //jsonschema 文档对象反序列化后。
    jsonschemaObj: JsonSchema

    constructor() {
        super(null, "ROOT", "ROOT", JsonSchemaDataType.Object, undefined, true)

        this.jsonschemaObj = new JsonSchema({})
        // this.$schema = new JsonSchema$schema($schema)
        //this.$id = new JsonSchema$id($schema)
        // this.$vocabulary = new JsonSchema$vocabulary([])

        // this.properties = new JsonSchemaProperties()


        this.AddSubSchema("$vocabulary", new JsonSchema$vocabulary(this, []))
        this.AddSubSchema("$defs", new JsonSchema$defs(this))
    }

    public test(): string {
        return "dd"
    }

    public LoadFromUrl(jsonUrl: string, clb: () => void): void {

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


    toJson(): JsonSchemaRes {
        const ret = new JsonSchemaRes()
        this.children.forEach(c => {
            if (c.key) {
                (<LooseObject>ret)[c.key] = c.toJson()
            }
        });

        if (this.canRename) {
            (<LooseObject>ret)['name'] = this.name
        }
        (<LooseObject>ret)['type'] = this.schemaType.toLocaleLowerCase()

        if (this.title != undefined) (<LooseObject>ret)['title'] = this.title
        if (this.description != undefined) (<LooseObject>ret)['description'] = this.description
        if (this.$schema != undefined) (<LooseObject>ret)['$schema'] = this.$schema
        if (this.$id != undefined) (<LooseObject>ret)['$id'] = this.$id
        if (this.$anchor != undefined) (<LooseObject>ret)['$anchor'] = this.$anchor
        if (this.$dynamicAnchor != undefined) {
            (<LooseObject>ret)['$dynamicAnchor'] = this.$dynamicAnchor
        }

        // (<LooseObject> ret)['$vocabulary']  = this.$vocabulary;
        // (<LooseObject> ret)['properties']  = this.properties;
        // (<LooseObject> ret)['$defs']  = this.$defs
        return ret
    }
}



//JsonSchemaString
export class JsonSchemaString extends JsonSchemaBaseSchema {
    constructor(parent: JsonSchemaBaseSchema, str: string) {
        super(parent, "", "string1", JsonSchemaDataType.String, str, true);
    }

    toString(): string {
        return !this.value ? "" : this.value.toString()
    }
}

//JsonSchemaObject
export class JsonSchemaObject extends JsonSchemaBaseSchema {
    constructor(parent: JsonSchemaBaseSchema, name: string) {
        super(parent, "", "object1", JsonSchemaDataType.String, {}, true);
    }
}


//VocabularySubSchema
export class JsonSchemaVocabularySubSchema extends JsonSchemaBaseSchema {
    constructor(parent: JsonSchemaBaseSchema) {
        super(parent, "", "https://json-schema.org/draft/2020-12/vocab/core", JsonSchemaDataType.Boolean,
            true, true);
    }
}



//$schema
//"$schema": "https://json-schema.org/draft/2020-12/schema",
export class JsonSchema$schema extends JsonSchemaBaseSchema {
    constructor(parent: JsonSchemaBaseSchema, $schema: string) {
        if ($schema == "")
            $schema = "https://json-schema.org/draft/2020-12/schema"
        super(parent, "", "$schema", JsonSchemaDataType.String, $schema, false);
    }
}


//$id
//"$id": "https://json-schema.org/draft/2020-12/schema",
export class JsonSchema$id extends JsonSchemaBaseSchema {
    constructor(parent: JsonSchemaBaseSchema, $id: string) {
        if ($id == "")
            $id = "https://example.org/draft/2020-12/schema"
        super(parent, "$id", "$id", JsonSchemaDataType.String, $id, false);
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
export class JsonSchema$vocabulary extends JsonSchemaBaseSchema {
    constructor(parent: JsonSchemaBaseSchema, uris: Array<boolean>) {
        const val: LooseObject = {}
        uris.forEach(uri => {
            val.uri = true
        });
        super(parent, "$vocabulary", "$vocabulary", JsonSchemaDataType.Array, val, false);
    }

    toJson(): JsonSchemaRes {
        const ret = new JsonSchemaRes()
        this.children.forEach(c => {
            if (c.name) {
                (<LooseObject>ret)[c.name] = true
            }
        });

        return ret
    }

    public NewSubSchema() {
        this.children.push(new JsonSchemaVocabularySubSchema(this))
    }
}


//$ref 引用
//"$ref": "some ref",
//                    "$ref": "#/$defs/enabledToggle",
export class JsonSchema$ref extends JsonSchemaBaseSchema {
    constructor(parent: JsonSchemaBaseSchema, $ref: string) {
        super(parent, "$ref", "$ref", JsonSchemaDataType.String, $ref, false);
    }
}

//$dynamicRef 引用
//"$dynamicRef": "some dynamicRef",
//"$dynamicRef": "#node"
export class JsonSchema$dynamicRef extends JsonSchemaBaseSchema {
    constructor(parent: JsonSchemaBaseSchema, $dynamicRef: string) {
        super(parent, "$ref", "$ref", JsonSchemaDataType.String, $dynamicRef, false);
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
    constructor(parent: JsonSchemaBaseSchema) {
        super(parent, "$defs", "$defs", JsonSchemaDataType.Array, {}, false);
    }

    public NewSubSchema() {
        const key = "refKey"
        this.AddSubSchema(key)
    }
    public AddSubSchema(key: string): void {
        this.children.push(new JsonSchema$def(this, key, "defName", ""))
    }
}

export class JsonSchema$def extends JsonSchemaBaseSchema {
    constructor(parent: JsonSchemaBaseSchema, id: string, name: string, val: any) {
        super(parent, id, name, JsonSchemaDataType.String, val, true);
    }
}

//JsonSchemaProperties "properties"
export class JsonSchemaProperties extends JsonSchemaBaseSchema {
    constructor(parent: JsonSchemaBaseSchema) {
        super(parent, "properties", "properties", JsonSchemaDataType.Object, new JsonSchemaObject(parent, "uname"), false);
    }

    public NewSubSchema() {
        const key = "propertyKey"
        this.AddSubSchema(key)
    }
    public AddSubSchema(key: string): void {
        //this.children.push(new JsonSchemaProperty(this,key)) 
        // const a = 
        this.children.push(new JsonSchemaProperty(this, key))
    }
}


//JsonSchemaPropertiy, sub schema of  "properties"
export class JsonSchemaProperty extends JsonSchemaBaseSchema {
    constructor(parent: JsonSchemaBaseSchema, key: string) {
        super(parent, key, "property name", JsonSchemaDataType.Object, new JsonSchemaObject(parent, "uname"), true);
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