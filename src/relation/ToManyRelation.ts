import {Relation} from "./Relation";
import {PluralResponse} from "../response/PluralResponse";
import {Builder} from "../Builder";
import {QueryMethods} from "../QueryMethods";
import {SingularResponse} from "../response/SingularResponse";
import {SortDirection} from "../SortDirection";

export class ToManyRelation extends Relation implements QueryMethods
{


  get(page?: number): Promise<PluralResponse> {
    return <Promise<PluralResponse>> new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getId())
      .get(page);
  }

  first(): Promise<SingularResponse> {
    return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getId())
      .first();
  }

  find(id: string | number): Promise<SingularResponse> {
    return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getId())
      .find(id);
  }

  where(attribute: string, value: string): Builder {
    return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getId())
      .where(attribute, value);
  }

  with(value: any): Builder {
    return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getId())
      .with(value);
  }

  public orderBy(attribute: string, direction?: SortDirection|string): Builder {
    return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getId())
      .orderBy(attribute, direction);
  }

  option(queryParameter: string, value: string): Builder {
    return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getId())
      .option(queryParameter, value);
  }
}
