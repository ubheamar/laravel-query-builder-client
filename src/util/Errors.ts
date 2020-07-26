import {arrayWrap} from "./Utils";

export default class Errors {
  errors: any = {};

  public set(field: any, messages?: any) {
    if (typeof field === 'object') {
      this.errors = field
    } else {
      this.set({...this.errors, [field]: arrayWrap(messages)})
    }
  }

  /**
   * Get all the errors.
   *
   * @return {Object}
   */
  all() {
    return this.errors
  }

  /**
   * Determine if there is an error for the given field.
   *
   * @param  {String} field
   * @return {Boolean}
   */
  public has (field:string) {
    return this.errors.hasOwnProperty(field)
  }

  /**
   * Determine if there are any errors for the given fields.
   *
   * @param  {...String} fields
   * @return {Boolean}
   */
  public hasAny (...fields:string[]) {
    return fields.some(field => this.has(field))
  }

  /**
   * Determine if there are any errors.
   *
   * @return {Boolean}
   */
  public any () {
    return Object.keys(this.errors).length > 0
  }

  /**
   * Get the first error message for the given field.
   *
   * @param  String} field
   * @return {String|undefined}
   */
  public get (field:string) {
    if (this.has(field)) {
      return this.getAll(field)[0]
    }
  }

  /**
   * Get all the error messages for the given field.
   *
   * @param  {String} field
   * @return {Array}
   */
  public getAll (field:string) {
    return arrayWrap(this.errors[field] || [])
  }

  /**
   * Get the error message for the given fields.
   *
   * @param  {...String} fields
   * @return {Array}
   */
  public only (...fields:string[]) {
    const messages: any[] = [];

    fields.forEach(field => {
      const message = this.get(field);

      if (message) {
        messages.push(message)
      }
    });

    return messages
  }

  /**
   * Get all the errors in a flat array.
   *
   * @return {Array}
   */
  public flatten () {
    return Object.values(this.errors).reduce((a:any , b) => a.concat(b), [])
  }

  /**
   * Clear one or all error fields.
   *
   * @param {String|undefined} field
   */
  public clear (field?:string|undefined) {
    const errors:any = {};

    if (field) {
      Object.keys(this.errors).forEach(key => {
        if (key !== field) {
          errors[key] = this.errors[key]
        }
      })
    }

    this.set(errors)
  }
}
