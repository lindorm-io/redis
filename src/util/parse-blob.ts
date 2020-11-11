import { TObject, isObject } from "@lindorm-io/core";
import { isArray, isBoolean, isObject as _isObject, isString } from "lodash";

const parseErrorValue = (input: any): Error => {
  const parsed = _isObject(input) ? input : JSON.parse(input);

  const error: any = new Error(parsed.message);
  error.stack = parsed.stack;

  for (const [key, value] of Object.entries(parsed)) {
    if (key === "message" || key === "stack") continue;
    error[key] = value;
  }

  return error;
};

const parseArrayValue = (input: any, meta: TObject<any>): Array<any> => {
  const parsed = isArray(input) ? input : JSON.parse(input);

  const result: Array<any> = [];

  for (const [index, value] of parsed.entries()) {
    if (isObject(meta[index])) {
      result.push(parseObjectValue(value, meta[index]));
    } else if (isArray(meta[index])) {
      result.push(parseArrayValue(value, meta[index]));
    } else if (meta[index] === "boolean") {
      result.push(isBoolean(value) ? value : JSON.parse(value));
    } else if (meta[index] === "date") {
      result.push(new Date(value));
    } else if (meta[index] === "error") {
      result.push(parseErrorValue(value));
    } else if (meta[index] === "number") {
      result.push(parseInt(value, 10));
    } else if (meta[index] === "string") {
      result.push(value);
    } else if (meta[index] === "null") {
      result.push(null);
    } else if (meta[index] === "undefined") {
      result.push(undefined);
    }
  }

  return result;
};

const parseObjectValue = (json: TObject<any>, meta: TObject<any>): TObject<any> => {
  const result: TObject<any> = {};

  for (const [key, value] of Object.entries(json)) {
    if (isObject(meta[key])) {
      result[key] = parseObjectValue(json[key], meta[key]);
    } else if (isArray(meta[key])) {
      result[key] = parseArrayValue(json[key], meta[key]);
    } else if (meta[key] === "boolean") {
      result[key] = JSON.parse(value);
    } else if (meta[key] === "date") {
      result[key] = new Date(value);
    } else if (meta[key] === "error") {
      result[key] = parseErrorValue(value);
    } else if (meta[key] === "number") {
      result[key] = parseInt(value, 10);
    } else if (meta[key] === "string") {
      result[key] = isString(value) ? value : JSON.parse(value);
    } else if (meta[key] === "null") {
      result[key] = null;
    } else if (meta[key] === "undefined") {
      result[key] = undefined;
    }
  }

  return result;
};

export const parseBlob = (string: string): TObject<any> => {
  const { json, meta } = JSON.parse(string);
  return parseObjectValue(json, meta);
};
