import { isObject } from "@lindorm-io/core";
import { isArray, isBoolean, isDate, isError, isNull, isNumber, isString, isUndefined } from "lodash";

export const getType = (value: any): string => {
  if (isArray(value)) return "array";
  if (isBoolean(value)) return "boolean";
  if (isDate(value)) return "date";
  if (isError(value)) return "error";
  if (isNull(value)) return "null";
  if (isNumber(value)) return "number";
  if (isString(value)) return "string";
  if (isUndefined(value)) return "undefined";
};

export const getMetaArray = (input: Array<any>): Array<string> => {
  const result: Array<any> = [];

  for (const value of input) {
    if (isObject(value)) {
      result.push(getMetaObject(value));
    } else if (isArray(value)) {
      result.push(getMetaArray(value));
    } else {
      result.push(getType(value));
    }
  }

  return result;
};

export const getMetaObject = (input: Record<string, any>): Record<string, string> => {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(input)) {
    if (isObject(value)) {
      result[key] = getMetaObject(value);
    } else if (isArray(value)) {
      result[key] = getMetaArray(value);
    } else {
      result[key] = getType(value);
    }
  }

  return result;
};

const stringifyArrayValues = (input: Array<any>): Array<any> => {
  const result: Array<any> = [];

  for (const value of input) {
    if (isObject(value)) {
      result.push(stringifyObjectValues(value));
    } else if (isArray(value)) {
      result.push(stringifyArrayValues(value));
    } else if (isDate(value)) {
      result.push(value.toJSON());
    } else if (isError(value)) {
      result.push(JSON.stringify(value, Object.getOwnPropertyNames(value)));
    } else if (isString(value)) {
      result.push(value);
    } else if (isNull(value)) {
      result.push("null");
    } else if (isUndefined(value)) {
      result.push("undefined");
    } else {
      result.push(JSON.stringify(value));
    }
  }

  return result;
};

const stringifyObjectValues = (input: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(input)) {
    if (isObject(value)) {
      result[key] = stringifyObjectValues(value);
    } else if (isArray(value)) {
      result[key] = stringifyArrayValues(value);
    } else if (isDate(value)) {
      result[key] = value.toJSON();
    } else if (isError(value)) {
      result[key] = JSON.stringify(value, Object.getOwnPropertyNames(value));
    } else if (isString(value)) {
      result[key] = value;
    } else if (isNull(value)) {
      result[key] = "null";
    } else if (isUndefined(value)) {
      result[key] = "undefined";
    } else {
      result[key] = JSON.stringify(value);
    }
  }

  return result;
};

export const stringifyBlob = (object: Record<string, any>): string => {
  return JSON.stringify({
    json: stringifyObjectValues(object),
    meta: getMetaObject(object),
  });
};
