import {Annotation} from "../annotation";

export default class ResourceAnnotation extends Annotation{
  constructor(target:any,public name?:string,public hasMedia?:boolean) {
    super();
    if(!name){
      this.name = `${target.name}s`.toLocaleLowerCase();
    }
  }
}
