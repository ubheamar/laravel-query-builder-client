import ApiError from "../util/ApiError";
export function handleError(error:ApiError) {

}

/**
 * If the given value is not an array, wrap it in one.
 *
 * @param  {Any} value
 * @return {Array}
 */
export function arrayWrap (value:any) {
  return Array.isArray(value) ? value : [value]
}
/**
 * Extract the errors from the response object.
 *
 * @param  {Object} response
 * @return {Object}
 */
export function extractErrors (response:any) {
 /* if (!response.data || typeof response.data !== 'object') {
    return { error: Form.errorMessage }
  }*/

  if (response.data.errors) {
    return { ...response.data.errors }
  }

  if (response.data.message) {
    return { error: response.data.message }
  }

  return { ...response.data }
}

export function getFormData(object:any){
  const formData = new FormData();
  Object.keys(object).forEach(key => formData.append(key, object[key]));
  return formData;
}
