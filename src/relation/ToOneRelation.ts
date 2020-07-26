import {Relation} from "./Relation";
import {SingularResponse} from "../response/SingularResponse";
import {QueryMethods} from "../QueryMethods";
import {Builder} from "../Builder";
import {SortDirection} from "../SortDirection";

export class ToOneRelation extends Relation implements QueryMethods
{
  get(page?: number): Promise<SingularResponse> {
    return <Promise<SingularResponse>> new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getId(), true)
      .get(page);
  }

  first(): Promise<SingularResponse> {
    return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getId(), true)
      .first();
  }

  find(id: string | number): Promise<SingularResponse> {
    return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getId(), true)
      .find(id);
  }

  where(attribute: string, value: string): Builder {
    return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getId(), true)
      .where(attribute, value);
  }

  with(value: any): Builder {
    return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getId(), true)
      .with(value);
  }

  orderBy(attribute: string, direction?: SortDirection|string): Builder {
    return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getId(), true)
      .orderBy(attribute, direction);
  }

  option(queryParameter: string, value: string): Builder {
    return new Builder(this.getType(), this.getName(), this.getReferringObject().getJsonApiType(), this.getReferringObject().getId(), true)
      .option(queryParameter, value);
  }
}
