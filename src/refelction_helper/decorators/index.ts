
import ResourceAnnotation from "../decorators/ResourceAnnotation";
import MediaAnnotation from "../decorators/MediaAnnotation";
import {classDecorator, propertyDecorator} from "../decoration";


export const Resource = (name?:string,hasMedia?:boolean) => classDecorator(target => new ResourceAnnotation(target,name,hasMedia));
export const MediaField = () => propertyDecorator((target,propertyKey)=>new MediaAnnotation(target,propertyKey));

